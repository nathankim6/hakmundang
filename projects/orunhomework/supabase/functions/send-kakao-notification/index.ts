import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  studentId: string;
  studentName: string;
  submissionType: "daily_word" | "review" | "manual";
  teacherNote?: string;
  customMessage?: string;
  messageTemplate?: string;
  brandPrefix?: string;
  messageType?: "sms" | "kakao";
  kakaoChannelId?: string;
  recipientType?: "student" | "parent";
  ownerCodeId?: string; // 선생님별 API 키 조회용
}

async function generateSolapiSignature(apiKey: string, apiSecret: string): Promise<string> {
  const date = new Date().toISOString();
  const salt = crypto.randomUUID();
  const message = date + salt;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiSecret);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signature = signatureArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let SOLAPI_API_KEY = Deno.env.get("SOLAPI_API_KEY");
    let SOLAPI_API_SECRET = Deno.env.get("SOLAPI_API_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let { studentId, studentName, submissionType, teacherNote, customMessage, messageTemplate, brandPrefix, messageType = "sms", kakaoChannelId, recipientType, ownerCodeId }: NotificationRequest = await req.json();

    // app_settings에서 선생님별 솔라피 API 키 조회 (ownerCodeId 기반, 있으면 우선 사용)
    let solapiSettingsQuery = supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["solapi_api_key", "solapi_api_secret"]);
    
    if (ownerCodeId) {
      solapiSettingsQuery = solapiSettingsQuery.eq("owner_code_id", ownerCodeId);
    }
    
    const { data: solapiSettings } = await solapiSettingsQuery;

    if (solapiSettings?.length) {
      const dbApiKey = solapiSettings.find((s: any) => s.key === "solapi_api_key")?.value;
      const dbApiSecret = solapiSettings.find((s: any) => s.key === "solapi_api_secret")?.value;
      if (dbApiKey && dbApiSecret) {
        SOLAPI_API_KEY = dbApiKey;
        SOLAPI_API_SECRET = dbApiSecret;
      }
    }

    if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          needsApiKey: true,
          error: "솔라피 API 키가 설정되지 않았습니다. [설정] → [솔라피 API 키 설정]에서 API Key와 Secret을 등록해주세요." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ownerCodeId is already destructured above

    if (!studentId || !studentName) {
      throw new Error("Missing required fields: studentId and studentName");
    }

    // supabase client already created above

    // 발신번호 조회 (선생님별)
    let senderPhoneQuery = supabase
      .from("app_settings")
      .select("value")
      .eq("key", "solapi_sender_phone");
    
    if (ownerCodeId) {
      senderPhoneQuery = senderPhoneQuery.eq("owner_code_id", ownerCodeId);
    }
    
    const { data: senderPhoneSetting } = await senderPhoneQuery.maybeSingle();

    const senderPhone = senderPhoneSetting?.value || "01092455554"; // 기본값 fallback
    
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("student_phone, parent_phone, name")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      console.error("Student lookup failed:", studentError);
      throw new Error("학생 정보를 불러올 수 없습니다.");
    }

    // 수신자 유형 결정:
    // - manual이 아닌 과제 피드백 발송 → 학생 연락처로 발송 (recipientType이 명시적으로 "parent"가 아닌 경우)
    // - manual(알림센터에서 수동 발송) → recipientType에 따라 결정
    const targetRecipient = recipientType || (submissionType === "manual" ? "parent" : "student");
    const targetPhone = targetRecipient === "student" ? student.student_phone : student.parent_phone;
    const recipientLabel = targetRecipient === "student" ? "학생" : "학부모";

    if (!targetPhone) {
      console.log(`No ${recipientLabel} phone registered for student ${studentName}`);
      
      // Log failed notification attempt
      await supabase.from("notifications").insert({
        student_id: studentId,
        type: "sms",
        message: customMessage || `${recipientLabel} 연락처 미등록`,
        status: "failed",
        submission_type: submissionType,
        teacher_note: teacherNote,
        error_message: `${recipientLabel} 연락처가 등록되지 않았습니다.`,
        recipient_phone: null,
        recipient_type: targetRecipient,
      });
      
      return new Response(
        JSON.stringify({ success: false, message: `${recipientLabel} 연락처가 등록되지 않았습니다.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const phoneNumber = targetPhone.replace(/-/g, "");

    // Prepare message content
    let messageText: string;
    const prefix = brandPrefix || "[오런잉글리쉬]";
    
    if (customMessage) {
      // Manual custom message
      messageText = `${prefix}\n${customMessage}`;
    } else if (messageTemplate) {
       // Use custom template from client
       messageText = `${prefix}\n${messageTemplate}`;
       if (teacherNote) {
         messageText += `\n\n${teacherNote}`;
       }
     } else {
       // Default auto-generated message for submissions
       const submissionTypeText = submissionType === "daily_word" ? "일일 단어과제" : "리뷰 과제";
       messageText = `${prefix}\n${studentName} 학생의 ${submissionTypeText} 검토가 완료되었습니다.`;
       
       if (teacherNote) {
         messageText += `\n\n${teacherNote}`;
       }
     }

    const authorization = await generateSolapiSignature(SOLAPI_API_KEY, SOLAPI_API_SECRET);

    // KakaoTalk 발송이면 채널 ID 자동 조회
    if (messageType === "kakao" && !kakaoChannelId) {
      let channelQuery = supabase
        .from("app_settings")
        .select("value")
        .eq("key", "kakao_channel_id");
      if (ownerCodeId) {
        channelQuery = channelQuery.eq("owner_code_id", ownerCodeId);
      }
      const { data: channelSetting } = await channelQuery.maybeSingle();
      if (channelSetting?.value) {
        kakaoChannelId = channelSetting.value;
      }
    }

    if (messageType === "kakao" && !kakaoChannelId) {
      throw new Error("카카오톡 발송은 채널 ID가 필요합니다. 설정에서 채널 ID를 설정해주세요.");
    }

    // 솔라피는 모든 메시지 유형을 동일한 엔드포인트로 처리
    const isKakao = messageType === "kakao" && kakaoChannelId;
    const solapiEndpoint = "https://api.solapi.com/messages/v4/send";

    const enc = new TextEncoder();
    const byteLen = (s: string) => enc.encode(s).length;

    // 긴 메시지 자동 분할 (LMS 2000byte / 친구톡 1000자 제한 대비 여유분 확보)
    const MAX_PARTS = 3;
    const HEADER_RESERVE = 20; // "(1/3)\n" 같은 머리말 여유
    const limit = (isKakao ? 900 : 1800) - HEADER_RESERVE;

    const splitMessage = (text: string, maxBytes: number): string[] => {
      if ((isKakao ? text.length : byteLen(text)) <= maxBytes) return [text];
      const parts: string[] = [];
      // 줄 단위로 자르고, 한 줄이 너무 길면 문자 단위로 자름
      const units: string[] = [];
      for (const line of text.split("\n")) {
        if ((isKakao ? line.length : byteLen(line)) <= maxBytes) {
          units.push(line);
        } else {
          let buf = "";
          for (const ch of line) {
            const next = buf + ch;
            if ((isKakao ? next.length : byteLen(next)) > maxBytes) {
              units.push(buf);
              buf = ch;
            } else {
              buf = next;
            }
          }
          if (buf) units.push(buf);
        }
      }
      let current = "";
      for (const unit of units) {
        const candidate = current ? `${current}\n${unit}` : unit;
        if ((isKakao ? candidate.length : byteLen(candidate)) > maxBytes) {
          if (current) parts.push(current);
          current = unit;
        } else {
          current = candidate;
        }
      }
      if (current) parts.push(current);
      return parts;
    };

    let chunks = splitMessage(messageText, limit);
    if (chunks.length > MAX_PARTS) {
      throw new Error(`메시지가 너무 길어 ${MAX_PARTS}건으로 나눠 보낼 수 없습니다. 내용을 줄여 다시 시도해주세요.`);
    }
    const total = chunks.length;
    if (total > 1) {
      chunks = chunks.map((c, i) => `(${i + 1}/${total})\n${c}`);
    }

    const lmsSubject = (() => {
      const rawSubject = (brandPrefix || "[오런잉글리쉬]").replace(/[\[\]]/g, "");
      const subjBytes = enc.encode(rawSubject);
      if (subjBytes.length > 40) {
        return new TextDecoder("utf-8").decode(subjBytes.slice(0, 40)).replace(/\uFFFD/g, "") || "알림";
      }
      return rawSubject || "알림";
    })();

    let lastResult: any = null;
    let failedResponse: { result: any } | null = null;
    let sentCount = 0;

    // 분할 발송 시 도착 순서를 보장하기 위해 예약 발송 시간을 순차적으로 부여
    const SEND_GAP_MS = 4_000; // 각 메시지 간 4초 간격 (순차 발송)

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      let solapiRequestBody: any;

      if (isKakao) {
        const message: any = {
          to: phoneNumber,
          from: senderPhone,
          text: chunkText,
          type: "CTA",
          kakaoOptions: { pfId: kakaoChannelId },
        };
        solapiRequestBody = { message };
      } else {
        const smsType = byteLen(chunkText) <= 90 ? "SMS" : "LMS";
        const message: any = {
          to: phoneNumber,
          from: senderPhone,
          text: chunkText,
          type: smsType,
        };
        if (smsType === "LMS") message.subject = lmsSubject;
        solapiRequestBody = { message };
      }


      const chunkAuth = await generateSolapiSignature(SOLAPI_API_KEY, SOLAPI_API_SECRET);
      const solapiResponse = await fetch(solapiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": chunkAuth,
        },
        body: JSON.stringify(solapiRequestBody),
      });

      const solapiResult = await solapiResponse.json();
      lastResult = solapiResult;

      await supabase.from("notifications").insert({
        student_id: studentId,
        type: isKakao ? "kakao" : "sms",
        message: chunkText,
        status: solapiResponse.ok ? "sent" : "failed",
        submission_type: submissionType,
        teacher_note: teacherNote,
        sent_at: solapiResponse.ok ? new Date().toISOString() : null,
        error_message: solapiResponse.ok ? null : JSON.stringify(solapiResult),
        recipient_phone: phoneNumber,
        recipient_type: targetRecipient,
      });

      if (!solapiResponse.ok) {
        failedResponse = { result: solapiResult };
        break;
      }
      sentCount++;
      // 순서 보장을 위해 약간의 간격
      if (i < chunks.length - 1) await new Promise((r) => setTimeout(r, SEND_GAP_MS));
    }

    if (failedResponse) {
      const solapiResult = failedResponse.result;
      console.error("Solapi API error:", solapiResult);

      const errorCode = solapiResult?.errorCode;

      if (errorCode === "NotEnoughBalance") {
        return new Response(
          JSON.stringify({
            success: false,
            insufficientBalance: true,
            error: "솔라피 잔액이 부족하여 메시지를 발송할 수 없습니다. 솔라피 콘솔에서 잔액을 충전해주세요."
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const rawMsg: string = typeof solapiResult?.errorMessage === "string" ? solapiResult.errorMessage : "";
      if (rawMsg.includes("유효하지 않은 플러스 친구") || errorCode === "InvalidPfId") {
        throw new Error("카카오 채널 ID(pfId)가 올바르지 않습니다. 솔라피 콘솔의 pfId(KA01PF...)를 설정해주세요.");
      }

      if (errorCode === "FailedToAddMessage" && rawMsg.includes("byte")) {
        throw new Error("메시지가 너무 길어 발송할 수 없습니다. 내용을 줄여 다시 시도해주세요.");
      }

      if (sentCount > 0) {
        throw new Error(`메시지 ${total}건 중 ${sentCount}건만 발송되었습니다. 잠시 후 다시 시도해주세요.`);
      }
      throw new Error("메시지 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }

    console.log("Message sent successfully:", { parts: total, lastResult });

    return new Response(
      JSON.stringify({
        success: true,
        message: total > 1 ? `긴 메시지를 ${total}건으로 나눠 발송했습니다.` : "알림이 발송되었습니다.",
        parts: total,
        result: lastResult,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );


  } catch (error: unknown) {
    console.error("Error in send-kakao-notification:", error);
    const rawMessage = error instanceof Error ? error.message : "";
    // 한국어로 작성된 사용자 친화 메시지만 클라이언트에 그대로 전달
    const isUserFacing = /[가-힣]/.test(rawMessage);
    const safeMessage = isUserFacing ? rawMessage : "메시지 발송에 실패했습니다. 잠시 후 다시 시도해주세요.";
    return new Response(
      JSON.stringify({ success: false, error: safeMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
