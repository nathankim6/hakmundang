import { Settings as SettingsIcon, User, Phone, Key, Eye, EyeOff, MessageSquare, Loader2, Shield, ExternalLink, CheckCircle2, XCircle, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const { session } = useAuth();
  const ownerCodeId = session?.accessCodeId || null;

  const [kakaoChannelId, setKakaoChannelId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [isSavingSenderPhone, setIsSavingSenderPhone] = useState(false);
  const [solapiApiKey, setSolapiApiKey] = useState("");
  const [solapiApiSecret, setSolapiApiSecret] = useState("");
  const [isSavingSolapiKeys, setIsSavingSolapiKeys] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingKakao, setIsSavingKakao] = useState(false);

  useEffect(() => {
    if (!ownerCodeId) return;

    const loadSettings = async () => {
      let query = supabase
        .from("app_settings")
        .select("key, value");
      
      if (ownerCodeId) {
        query = query.eq("owner_code_id", ownerCodeId);
      } else {
        query = query.is("owner_code_id", null);
      }
      
      const { data } = await query;
      
      if (data) {
        data.forEach((setting) => {
          switch (setting.key) {
            case "solapi_sender_phone":
              setSenderPhone(setting.value);
              break;
            case "teacher_name":
              setProfileName(setting.value);
              break;
            case "teacher_email":
              setProfileEmail(setting.value);
              break;
            case "teacher_phone":
              setProfilePhone(setting.value);
              break;
            case "solapi_api_key":
              setSolapiApiKey(setting.value);
              break;
            case "solapi_api_secret":
              setSolapiApiSecret(setting.value);
              break;
            case "kakao_channel_id":
              setKakaoChannelId(setting.value);
              localStorage.setItem("kakao_channel_id", setting.value);
              break;
          }
        });
      }
    };
    loadSettings();
  }, [ownerCodeId]);

  const upsertSetting = async (key: string, value: string) => {
    // Check if setting already exists for this owner
    let query = supabase
      .from("app_settings")
      .select("id")
      .eq("key", key);
    
    if (ownerCodeId) {
      query = query.eq("owner_code_id", ownerCodeId);
    } else {
      query = query.is("owner_code_id", null);
    }
    
    const { data: existing } = await query.maybeSingle();
    
    if (existing) {
      const { error } = await supabase
        .from("app_settings")
        .update({ value: value.trim(), updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("app_settings")
        .insert({ key, value: value.trim(), owner_code_id: ownerCodeId, updated_at: new Date().toISOString() });
      if (error) throw error;
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const settings = [
        { key: "teacher_name", value: profileName },
        { key: "teacher_email", value: profileEmail },
        { key: "teacher_phone", value: profilePhone },
      ];

      for (const setting of settings) {
        if (setting.value.trim()) {
          await upsertSetting(setting.key, setting.value);
        }
      }
      
      toast.success("프로필이 저장되었습니다.");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("프로필 저장에 실패했습니다.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveKakaoChannel = async () => {
    setIsSavingKakao(true);
    if (kakaoChannelId.trim()) {
      localStorage.setItem("kakao_channel_id", kakaoChannelId);
      // DB에도 저장 (edge function에서 조회 가능하도록)
      try {
        const { data: existing } = await supabase
          .from("app_settings")
          .select("id")
          .eq("key", "kakao_channel_id")
          .eq("owner_code_id", ownerCodeId || "")
          .maybeSingle();
        if (existing) {
          await supabase.from("app_settings").update({ value: kakaoChannelId.trim() }).eq("id", existing.id);
        } else {
          await supabase.from("app_settings").insert({ key: "kakao_channel_id", value: kakaoChannelId.trim(), owner_code_id: ownerCodeId });
        }
      } catch (e) {
        console.error("Failed to save kakao channel to DB:", e);
      }
      toast.success("카카오톡 채널 ID가 저장되었습니다.");
    } else {
      toast.error("채널 ID를 입력해주세요.");
    }
    setIsSavingKakao(false);
  };

  const handleSaveSenderPhone = async () => {
    if (!senderPhone.trim()) {
      toast.error("발신번호를 입력해주세요.");
      return;
    }

    const cleanPhone = senderPhone.replace(/-/g, "").trim();
    
    if (!/^01[0-9]{8,9}$/.test(cleanPhone)) {
      toast.error("올바른 휴대폰 번호 형식이 아닙니다. (예: 01012345678)");
      return;
    }

    setIsSavingSenderPhone(true);
    try {
      await upsertSetting("solapi_sender_phone", cleanPhone);
      setSenderPhone(cleanPhone);
      toast.success("솔라피 발신번호가 저장되었습니다.");
    } catch (error) {
      console.error("Error saving sender phone:", error);
      toast.error("발신번호 저장에 실패했습니다.");
    } finally {
      setIsSavingSenderPhone(false);
    }
  };

  const handleSaveSolapiKeys = async () => {
    if (!solapiApiKey.trim() || !solapiApiSecret.trim()) {
      toast.error("API Key와 API Secret을 모두 입력해주세요.");
      return;
    }
    setIsSavingSolapiKeys(true);
    try {
      await upsertSetting("solapi_api_key", solapiApiKey);
      await upsertSetting("solapi_api_secret", solapiApiSecret);
      toast.success("솔라피 API 키가 저장되었습니다.");
    } catch (error) {
      console.error("Error saving Solapi keys:", error);
      toast.error("API 키 저장에 실패했습니다.");
    } finally {
      setIsSavingSolapiKeys(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title, description, statusBadge }: { 
    icon: React.ElementType; 
    title: string; 
    description: string;
    statusBadge?: React.ReactNode;
  }) => (
    <div className="flex items-start justify-between pb-4 border-b border-border/60">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {statusBadge}
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <PageHeader
        icon={SettingsIcon}
        title="설정"
        description="앱 설정을 관리합니다"
        showDate={false}
      />

      {/* 프로필 설정 */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-5">
          <SectionHeader 
            icon={User} 
            title="프로필 설정" 
            description="선생님 정보를 관리합니다" 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">이름</Label>
              <Input 
                id="name" 
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="홍길동"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">이메일</Label>
              <Input 
                id="email" 
                type="email" 
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="teacher@school.kr"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">전화번호</Label>
            <Input 
              id="phone" 
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              placeholder="010-1234-5678"
              className="h-9 text-sm max-w-xs"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={handleSaveProfile} disabled={isSavingProfile} className="h-8 px-4 text-xs">
              {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              저장
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SMS 발송 설정 */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-5">
          <SectionHeader 
            icon={Phone} 
            title="SMS 발송 설정" 
            description="SMS 발송 시 사용할 발신번호를 설정합니다"
            statusBadge={
              senderPhone ? (
                <Badge variant="secondary" className="text-[10px] gap-1 font-mono bg-emerald-50 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  {senderPhone}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-muted text-muted-foreground">
                  <XCircle className="w-3 h-3" />
                  미설정
                </Badge>
              )
            }
          />
          <div className="space-y-1.5">
            <Label htmlFor="sender-phone" className="text-xs font-medium text-muted-foreground">발신번호</Label>
            <div className="flex gap-2">
              <Input
                id="sender-phone"
                placeholder="01012345678"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                className="flex-1 max-w-xs h-9 text-sm font-mono"
              />
              <Button size="sm" onClick={handleSaveSenderPhone} disabled={isSavingSenderPhone} className="h-9 px-4 text-xs">
                {isSavingSenderPhone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                {isSavingSenderPhone ? "" : "저장"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              하이픈(-) 없이 숫자만 입력 · <a href="https://solapi.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">솔라피 대시보드에서 발신번호 등록 <ExternalLink className="w-2.5 h-2.5" /></a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 솔라피 API 키 설정 */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-5">
          <SectionHeader 
            icon={Key} 
            title="솔라피 API 인증" 
            description="SMS/카카오톡 발송에 사용할 API 인증 정보"
            statusBadge={
              solapiApiKey ? (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  연동됨
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-muted text-muted-foreground">
                  <XCircle className="w-3 h-3" />
                  미설정
                </Badge>
              )
            }
          />
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="solapi-api-key" className="text-xs font-medium text-muted-foreground">API Key</Label>
              <div className="relative max-w-md">
                <Input
                  id="solapi-api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="API Key 입력"
                  value={solapiApiKey}
                  onChange={(e) => setSolapiApiKey(e.target.value)}
                  className="pr-9 font-mono text-sm h-9"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="solapi-api-secret" className="text-xs font-medium text-muted-foreground">API Secret</Label>
              <div className="relative max-w-md">
                <Input
                  id="solapi-api-secret"
                  type={showApiSecret ? "text" : "password"}
                  placeholder="API Secret 입력"
                  value={solapiApiSecret}
                  onChange={(e) => setSolapiApiSecret(e.target.value)}
                  className="pr-9 font-mono text-sm h-9"
                />
                <button
                  type="button"
                  onClick={() => setShowApiSecret(!showApiSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors"
                >
                  {showApiSecret ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" />
              암호화되어 안전하게 저장됩니다 · <a href="https://console.solapi.com/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">API 키 확인 <ExternalLink className="w-2.5 h-2.5" /></a>
            </p>
            <Button size="sm" onClick={handleSaveSolapiKeys} disabled={isSavingSolapiKeys} className="h-8 px-4 text-xs">
              {isSavingSolapiKeys ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              저장
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 카카오톡 채널 설정 */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-5">
          <SectionHeader 
            icon={MessageSquare} 
            title="카카오톡 채널 (친구톡)" 
            description="친구톡 발송을 위한 솔라피 pfId를 설정합니다"
            statusBadge={
              kakaoChannelId ? (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  연동됨
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-muted text-muted-foreground">
                  <XCircle className="w-3 h-3" />
                  미설정
                </Badge>
              )
            }
          />
          <div className="space-y-1.5">
            <Label htmlFor="kakao-channel-id" className="text-xs font-medium text-muted-foreground">솔라피 pfId</Label>
            <div className="flex gap-2">
              <Input
                id="kakao-channel-id"
                placeholder="KA01PF..."
                value={kakaoChannelId}
                onChange={(e) => setKakaoChannelId(e.target.value)}
                className="max-w-xs h-9 text-sm font-mono"
              />
              <Button size="sm" onClick={handleSaveKakaoChannel} disabled={isSavingKakao} className="h-9 px-4 text-xs">
                {isSavingKakao ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                {isSavingKakao ? "" : "저장"}
              </Button>
            </div>
            <div className="text-[11px] text-muted-foreground space-y-1 mt-2">
              <p className="font-medium text-foreground/70">설정 방법:</p>
              <ol className="list-decimal list-inside space-y-0.5 ml-1">
                <li><a href="https://business.kakao.com/dashboard/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">카카오 비즈니스 <ExternalLink className="w-2.5 h-2.5" /></a>에서 채널 생성</li>
                <li><a href="https://console.solapi.com/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">솔라피 콘솔 <ExternalLink className="w-2.5 h-2.5" /></a> → 채널 연동 관리에서 카카오 채널 연동</li>
                <li>연동 후 발급된 <span className="font-mono text-foreground/80">pfId</span> (예: KA01PF...) 값을 위에 입력</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
