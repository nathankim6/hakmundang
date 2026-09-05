import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Edit3, Save, X, Upload } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
interface ModernTitleProps {
  className?: string;
}
export function ModernTitle({
  className
}: ModernTitleProps) {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [headerSettings, setHeaderSettings] = useState({
    logoUrl: '/lovable-uploads/8c4bc904-f076-4eb5-baad-6de31705ad79.png',
    title: 'ORUN TASK MANAGER',
    subtitle: 'Intelligent Work Management'
  });
  const [editValues, setEditValues] = useState(headerSettings);
  const [isSaving, setIsSaving] = useState(false);
  const { hasAdminPrivileges } = useAuthStore();
  const { toast } = useToast();

  // Load header settings from database
  useEffect(() => {
    loadHeaderSettings();
  }, []);

  const loadHeaderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('header_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading header settings:', error);
        return;
      }

      if (data) {
        const settings = {
          logoUrl: data.logo_url,
          title: data.title,
          subtitle: data.subtitle
        };
        setHeaderSettings(settings);
        setEditValues(settings);
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 기존 레코드를 업데이트 (upsert 대신 직접 업데이트)
      const { data: existingData } = await supabase
        .from('header_settings')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let error;
      if (existingData) {
        // 기존 레코드 업데이트
        const { error: updateError } = await supabase
          .from('header_settings')
          .update({
            logo_url: editValues.logoUrl,
            title: editValues.title,
            subtitle: editValues.subtitle,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
        error = updateError;
      } else {
        // 새 레코드 삽입
        const { error: insertError } = await supabase
          .from('header_settings')
          .insert({
            logo_url: editValues.logoUrl,
            title: editValues.title,
            subtitle: editValues.subtitle
          });
        error = insertError;
      }

      if (error) throw error;

      setHeaderSettings(editValues);
      setIsEditing(false);
      toast({
        title: "저장 완료",
        description: "헤더 설정이 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error saving header settings:', error);
      toast({
        title: "저장 실패",
        description: "헤더 설정 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValues(headerSettings);
    setIsEditing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('school-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('school-logos')
        .getPublicUrl(fileName);

      // 바로 저장하여 새로고침 시에도 유지되도록 함
      const newSettings = { ...headerSettings, logoUrl: publicUrl };
      
      // 기존 레코드를 업데이트 (upsert 대신 직접 업데이트)
      const { data: existingData } = await supabase
        .from('header_settings')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let error;
      if (existingData) {
        // 기존 레코드 업데이트
        const { error: updateError } = await supabase
          .from('header_settings')
          .update({
            logo_url: publicUrl,
            title: newSettings.title,
            subtitle: newSettings.subtitle,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
        error = updateError;
      } else {
        // 새 레코드 삽입
        const { error: insertError } = await supabase
          .from('header_settings')
          .insert({
            logo_url: publicUrl,
            title: newSettings.title,
            subtitle: newSettings.subtitle
          });
        error = insertError;
      }

      if (error) throw error;

      setHeaderSettings(newSettings);
      setEditValues(newSettings);
      
      toast({
        title: "업로드 완료",
        description: "로고 이미지가 업로드되고 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "업로드 실패",
        description: "로고 업로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleLogoClick = () => {
    if (hasAdminPrivileges()) {
      const fileInput = document.getElementById('logo-upload-direct') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return <div className={`relative flex items-center space-x-3 sm:space-x-4 flex-shrink-0 ${className}`}>
        <img alt="Orun Academy" className="h-[60px] sm:h-[80px] md:h-[100px] lg:h-[120px] w-[60px] sm:w-[80px] md:w-[100px] lg:w-[120px] object-cover rounded-full flex-shrink-0 border-2 border-white/30 dark:border-slate-700/30 shadow-lg" src="/lovable-uploads/8c4bc904-f076-4eb5-baad-6de31705ad79.png" />
        <span className="font-extrabold relative font-orbitron tracking-tight whitespace-nowrap">
          <span className="relative z-10 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-200 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent px-2 sm:px-4 md:px-6 lg:px-8">
            <span className="hidden sm:inline">ORUN TASK MANAGER</span>
            <span className="sm:hidden">ORUN<br />TASK</span>
          </span>
        </span>
      </div>;
  }
  return <motion.div className={`relative flex items-center space-x-3 sm:space-x-4 flex-shrink-0 ${className}`} initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} transition={{
    duration: 0.8,
    ease: "easeOut"
  }}>
      {/* Logo */}
      <motion.div className="relative" whileHover={{
      scale: 1.05
    }} transition={{
      type: "spring",
      stiffness: 400,
      damping: 25
    }}>
        {/* Glass shine overlay */}
        <motion.div 
          className={`absolute inset-0 rounded-full overflow-hidden z-10 ${hasAdminPrivileges() ? 'cursor-pointer' : ''}`}
          onClick={hasAdminPrivileges() ? handleLogoClick : undefined}
          animate={{
            background: [
              "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
              "linear-gradient(225deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
              "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Glass effect background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-white/10 to-transparent backdrop-blur-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.1)] z-5" />
        
        {/* Sparkle glow effect */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(255,255,255,0.2), inset 0 0 20px rgba(255,255,255,0.1)",
              "0 0 30px rgba(255,255,255,0.6), 0 0 60px rgba(255,255,255,0.3), inset 0 0 30px rgba(255,255,255,0.2)",
              "0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(255,255,255,0.2), inset 0 0 20px rgba(255,255,255,0.1)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 숨겨진 파일 입력 요소들 */}
        <input
          type="file"
          id="logo-upload"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          type="file"
          id="logo-upload-direct"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {isEditing ? (
          <div className="relative">
            <label
              htmlFor="logo-upload"
              className="cursor-pointer block h-[50px] sm:h-[65px] md:h-[80px] lg:h-[95px] w-[50px] sm:w-[65px] md:w-[80px] lg:w-[95px] rounded-full border-2 border-dashed border-primary/50 bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <Upload className="h-6 w-6 text-primary" />
            </label>
            {editValues.logoUrl && (
              <img
                alt="Preview"
                className="absolute inset-0 h-full w-full object-cover rounded-full"
                src={editValues.logoUrl}
              />
            )}
          </div>
        ) : (
          <img 
            alt="Orun Academy" 
            className={`h-[50px] sm:h-[65px] md:h-[80px] lg:h-[95px] w-[50px] sm:w-[65px] md:w-[80px] lg:w-[95px] object-cover rounded-full flex-shrink-0 relative z-0 ${hasAdminPrivileges() ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            src={headerSettings.logoUrl} 
            onClick={handleLogoClick}
          />
        )}
      </motion.div>

      {/* Title Section */}
      <motion.div 
        className="relative group" 
        initial={{
      opacity: 0,
      x: -20
    }} animate={{
      opacity: 1,
      x: 0
    }} transition={{
      delay: 0.2,
      duration: 0.6
    }}>
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-title-accent/5 via-title-glow/8 to-title-accent/5 rounded-2xl blur-xl -z-10" />
        <div className="absolute inset-0 bg-gradient-title-shine rounded-2xl opacity-30 -z-10" />
        
        <motion.div whileHover={{
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }} transition={{
        type: "spring",
        stiffness: 300,
        damping: 25
      }} className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-black/10 dark:via-black/5 rounded-2xl p-4 sm:p-6 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-2xl mx-[10px] px-[87px] py-[4px]">
          {/* Animated Spotlight Effect */}
          <motion.div className="absolute inset-0 overflow-hidden rounded-2xl opacity-40" initial={{
          x: "-100%"
        }} animate={{
          x: "200%"
        }} transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 3
        }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent w-1/3 h-full skew-x-12" />
          </motion.div>
          
          <motion.div whileHover={{
          y: -2
        }} transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }} className="relative z-10 text-center px-[59px]">
            {/* Main Title */}
            <motion.h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-orbitron tracking-[-0.02em] leading-tight cursor-default" style={{
            background: 'var(--gradient-premium)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 30px hsla(var(--title-glow), 0.4))"
          }} whileHover={{
            filter: "drop-shadow(0 6px 25px rgba(0, 0, 0, 0.2)) drop-shadow(0 0 40px hsla(var(--title-glow), 0.6))"
          }}>
{isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editValues.title}
                    onChange={(e) => setEditValues(prev => ({ ...prev, title: e.target.value }))}
                    className="text-center bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    placeholder="제목을 입력하세요"
                  />
                </div>
              ) : (
                <>
                  <div className={`${isSaving ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
                    <span className="hidden sm:inline animate-pulse-gentle bg-gradient-to-r from-title-primary via-title-accent to-title-primary bg-clip-text text-transparent font-black relative" style={{
                    textShadow: "0 0 20px hsla(var(--title-accent), 0.6), 0 0 35px hsla(var(--title-glow), 0.4), 0 0 50px hsla(var(--primary), 0.3)",
                    filter: "contrast(1.1) brightness(1.1) drop-shadow(0 0 10px hsla(var(--title-accent), 0.5))",
                    backdropFilter: "blur(1px)",
                    WebkitBackdropFilter: "blur(1px)"
                  }}>
                      <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/40 to-white/20 bg-clip-text text-transparent animate-pulse opacity-60"></span>
                      {headerSettings.title}
                    </span>
                    <span className="sm:hidden animate-pulse-gentle bg-gradient-to-r from-title-primary via-title-accent to-title-primary bg-clip-text text-transparent font-black relative" style={{
                    textShadow: "0 0 20px hsla(var(--title-accent), 0.6), 0 0 35px hsla(var(--title-glow), 0.4), 0 0 50px hsla(var(--primary), 0.3)",
                    filter: "contrast(1.1) brightness(1.1) drop-shadow(0 0 10px hsla(var(--title-accent), 0.5))",
                    backdropFilter: "blur(1px)",
                    WebkitBackdropFilter: "blur(1px)"
                  }}>
                      <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/40 to-white/20 bg-clip-text text-transparent animate-pulse opacity-60"></span>
                      {headerSettings.title.split(' ').slice(0, 2).join('\n')}
                    </span>
                  </div>
                  {isSaving && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-title-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </>
              )}
            </motion.h1>
            
            {/* Subtitle */}
            <motion.div initial={{
            opacity: 0,
            y: 15
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4,
            duration: 0.6
          }} whileHover={{
            scale: 1.05,
            backgroundColor: "hsla(var(--title-accent), 0.15)",
            boxShadow: "0 10px 25px -5px hsla(var(--title-glow), 0.3)"
          }} className="mt-3 inline-flex items-center rounded-full bg-gradient-to-r from-title-accent/10 via-title-glow/15 to-title-accent/10 border border-title-accent/20 shadow-lg backdrop-blur-sm mx-4 my-2 py-0 px-6">
{isEditing ? (
                <Input
                  value={editValues.subtitle}
                  onChange={(e) => setEditValues(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="text-center bg-white/20 border-white/30 text-white placeholder:text-white/50 text-xs"
                  placeholder="부제목을 입력하세요"
                />
              ) : (
                <span className="text-xs sm:text-sm md:text-base font-medium tracking-wider uppercase text-title-primary/90 dark:text-title-primary/90">
                  <span style={{
                  background: 'var(--gradient-accent)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }} className="bg-gradient-to-r from-title-primary via-title-accent to-title-primary bg-clip-text text-transparent font-semibold mx-0">
                    {headerSettings.subtitle}
                  </span>
                </span>
              )}
            </motion.div>
          </motion.div>
          
          {/* Admin Edit Controls */}
          {hasAdminPrivileges() && (
            <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 border-none"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 border-none text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Premium Corner Accents */}
          <div className="absolute top-2 left-2 w-6 h-6 bg-gradient-to-br from-title-accent/20 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-gradient-to-tl from-title-glow/20 to-transparent rounded-full opacity-60" />
        </motion.div>
      </motion.div>
    </motion.div>;
}