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

    const getAppSettingValue = async (settingKey: string): Promise<string | null> => {
      if (ownerCodeId) {
        const { data: ownerSetting } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", settingKey)
          .eq("owner_code_id", ownerCodeId)
          .maybeSingle();

        if (ownerSetting?.value) return ownerSetting.value;
      }

      const { data: globalSetting } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", settingKey)
        .is("owner_code_id", null)
        .maybeSingle();

      if (globalSetting?.value) return globalSetting.value;

      // 보안상 owner 구분 없는 fallback 금지 (타 선생님 설정 혼입 방지)
      return null;
    };

    const dbApiKey = await getAppSettingValue("solapi_api_key");
    const dbApiSecret = await getAppSettingValue("solapi_api_secret");

    if (dbApiKey && dbApiSecret) {
      SOLAPI_API_KEY = dbApiKey;
      SOLAPI_API_SECRET = dbApiSecret;
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

    // 발신번호 조회 (owner 우선, 없으면 공통/최근 설정 fallback)
    const senderPhone = (await getAppSettingValue("solapi_sender_phone")) || "01092455554"; // 기본값 fallback
    
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("student_phone, parent_phone, name")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      throw new Error(`Student not found: ${studentError?.message || "Unknown error"}`);
    }

    // 수신자 유형 결정: 기본은 항상 학생, 학부모는 명시적으로 선택한 경우에만
    const targetRecipient = recipientType || "student";
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

    // KakaoTalk 발송이면 채널 ID 자동 조회 (owner 우선, 없으면 fallback)
    if (messageType === "kakao" && !kakaoChannelId) {
      kakaoChannelId = await getAppSettingValue("kakao_channel_id") || undefined;
    }

    if (messageType === "kakao" && !kakaoChannelId) {
      throw new Error("카카오톡 발송은 채널 ID가 필요합니다. 설정에서 채널 ID를 설정해주세요.");
    }

    // 솔라피는 모든 메시지 유형을 동일한 엔드포인트로 처리
    const isKakao = messageType === "kakao" && kakaoChannelId;
    const solapiEndpoint = "https://api.solapi.com/messages/v4/send";

    let solapiRequestBody: any;

    // SMS/LMS 요청 - 바이트 길이 기반으로 타입 결정
    const textBytes = new TextEncoder().encode(messageText);
    const byteLength = textBytes.length;
    const smsType = byteLength <= 90 ? "SMS" : "LMS";

    if (isKakao) {
      // 카카오 친구톡 요청 (CTA = ChinguTalk)
      solapiRequestBody = {
        message: {
          to: phoneNumber,
          from: senderPhone,
          text: messageText,
          type: "CTA",
          kakaoOptions: {
            pfId: kakaoChannelId,
            // 카카오 발송 실패 시 문자 대체발송 방지 (카카오 채널로만 발송)
            disableSms: false,
          },
        },
      };
    } else {
      solapiRequestBody = {
        message: {
          to: phoneNumber,
          from: senderPhone,
          text: messageText,
          type: smsType,
        },
      };
    }

    const solapiResponse = await fetch(solapiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authorization,
      },
      body: JSON.stringify(solapiRequestBody),
    });

    const solapiResult = await solapiResponse.json();

    // Log notification to database
    const notificationRecord = {
      student_id: studentId,
      type: isKakao ? "kakao" : "sms",
      message: messageText,
      status: solapiResponse.ok ? "sent" : "failed",
      submission_type: submissionType,
      teacher_note: teacherNote,
      sent_at: solapiResponse.ok ? new Date().toISOString() : null,
      error_message: solapiResponse.ok ? null : JSON.stringify(solapiResult),
      recipient_phone: phoneNumber,
      recipient_type: targetRecipient,
    };

    await supabase.from("notifications").insert(notificationRecord);

    if (!solapiResponse.ok) {
      console.error("Solapi API error:", solapiResult);
      
      // 잔액 부족 에러는 친절한 메시지로 반환 (500 대신 200)
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
      
      throw new Error(`Solapi API error: ${JSON.stringify(solapiResult)}`);
    }

    console.log("Message sent successfully:", solapiResult);

    return new Response(
      JSON.stringify({ success: true, message: "알림이 발송되었습니다.", result: solapiResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in send-kakao-notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
