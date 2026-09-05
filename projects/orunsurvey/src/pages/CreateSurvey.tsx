import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { Plus, Trash2, ArrowLeft, GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TimeRangeSlider } from "@/components/TimeRangeSlider";

interface TimeSettings {
  weekdays: {
    enabled: boolean;
    startHour: number;
    endHour: number;
  };
  weekends: {
    enabled: boolean;
    startHour: number;
    endHour: number;
  };
  instructions?: {
    line1: string;
    line2: string;
    line3: string;
  };
}

interface BasicField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
}

interface Question {
  id?: string;
  question_text: string;
  question_type: string;
  options: string[];
  is_required: boolean;
  question_order: number;
  media_url?: string;
  media_file?: File;
  time_settings?: TimeSettings;
}

const CreateSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [introText, setIntroText] = useState("");
  const [slug, setSlug] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [bulkAddCount, setBulkAddCount] = useState<string>("");
  const [basicFields, setBasicFields] = useState<BasicField[]>([
    { id: "school", label: "학교", type: "text", required: true, placeholder: "학교명을 입력하세요" },
    { id: "name", label: "이름", type: "text", required: true, placeholder: "이름을 입력하세요" }
  ]);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      navigate("/auth");
      return;
    }

    if (id) {
      fetchSurvey();
    }
  }, [navigate, id]);

  const fetchSurvey = async () => {
    if (!id) return;

    const { data: surveyData, error: surveyError } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", id)
      .single();

    if (surveyError) {
      toast.error("설문조사를 불러오는데 실패했습니다.");
      navigate("/dashboard");
      return;
    }

    setTitle(surveyData.title);
    setDescription(surveyData.description || "");
    setIntroText(surveyData.intro_text || "");
    setSlug(surveyData.slug);
    if (surveyData.basic_fields && Array.isArray(surveyData.basic_fields)) {
      setBasicFields(surveyData.basic_fields as unknown as BasicField[]);
    }

    const { data: questionsData, error: questionsError } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", id)
      .order("question_order");

    if (!questionsError && questionsData) {
      const loadedQuestions = questionsData.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: Array.isArray(q.options) ? q.options.map(o => String(o)) : [],
        is_required: q.is_required,
        question_order: q.question_order,
        media_url: q.media_url || undefined,
        time_settings: q.time_settings ? q.time_settings as unknown as TimeSettings : {
          weekdays: { enabled: true, startHour: 13, endHour: 22 },
          weekends: { enabled: true, startHour: 9, endHour: 22 },
          instructions: {
            line1: "✓ 클릭 또는 드래그하여 시간 범위를 선택하세요",
            line2: "✓ 가능한 시간범위를 최대한으로 체크해주세요.",
            line3: "*여러 시간대를 자유롭게 추가할 수 있습니다 (ex: 오전 9시 ~ 오후 1시, 오후 5시 ~ 오후 7시)"
          }
        }
      }));
      setQuestions(loadedQuestions);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!id) {
      setSlug(generateSlug(value));
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "text",
        options: [],
        is_required: true,
        question_order: questions.length,
        media_url: undefined,
        time_settings: {
          weekdays: { enabled: true, startHour: 9, endHour: 22 },
          weekends: { enabled: true, startHour: 9, endHour: 22 },
          instructions: {
            line1: "✓ 클릭 또는 드래그하여 시간 범위를 선택하세요",
            line2: "✓ 가능한 시간범위를 최대한으로 체크해주세요.",
            line3: "*여러 시간대를 자유롭게 추가할 수 있습니다 (ex: 오전 9시 ~ 오후 1시, 오후 5시 ~ 오후 7시)"
          }
        }
      }
    ]);
  };

  const addMultipleQuestions = () => {
    const count = parseInt(bulkAddCount);
    if (isNaN(count) || count < 1 || count > 50) {
      toast.error("1~50 사이의 숫자를 입력해주세요.");
      return;
    }

    const newQuestions = Array.from({ length: count }, (_, i) => ({
      question_text: "",
      question_type: "text",
      options: [],
      is_required: true,
      question_order: questions.length + i,
      media_url: undefined,
      time_settings: {
        weekdays: { enabled: true, startHour: 9, endHour: 22 },
        weekends: { enabled: true, startHour: 9, endHour: 22 },
        instructions: {
          line1: "✓ 클릭 또는 드래그하여 시간 범위를 선택하세요",
          line2: "✓ 가능한 시간범위를 최대한으로 체크해주세요.",
          line3: "*여러 시간대를 자유롭게 추가할 수 있습니다 (ex: 오전 9시 ~ 오후 1시, 오후 5시 ~ 오후 7시)"
        }
      }
    }));

    setQuestions([...questions, ...newQuestions]);
    setBulkAddCount("");
    toast.success(`${count}개의 질문이 추가되었습니다.`);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    
    // Initialize time_settings when switching to time_range type
    if (field === "question_type" && value === "time_range" && !newQuestions[index].time_settings) {
      newQuestions[index].time_settings = {
        weekdays: { enabled: true, startHour: 9, endHour: 22 },
        weekends: { enabled: true, startHour: 9, endHour: 22 }
      };
    }
    
    // Initialize options array when switching to checkbox type
    if (field === "question_type" && value === "checkbox") {
      if (!newQuestions[index].options || newQuestions[index].options.length === 0) {
        newQuestions[index].options = [""];
      }
    }
    
    setQuestions(newQuestions);
  };

  const updateTimeSettings = (index: number, period: 'weekdays' | 'weekends', field: 'enabled' | 'startHour' | 'endHour', value: any) => {
    const newQuestions = [...questions];
    if (!newQuestions[index].time_settings) {
      newQuestions[index].time_settings = {
        weekdays: { enabled: true, startHour: 13, endHour: 22 },
        weekends: { enabled: true, startHour: 9, endHour: 22 }
      };
    }
    newQuestions[index].time_settings = {
      ...newQuestions[index].time_settings!,
      [period]: {
        ...newQuestions[index].time_settings![period],
        [field]: value
      }
    };
    setQuestions(newQuestions);
  };

  const handleFileUpload = async (index: number, file: File | null) => {
    if (!file) {
      updateQuestion(index, "media_url", undefined);
      updateQuestion(index, "media_file", undefined);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error("JPG, PNG, GIF, WEBP, MP4, WEBM 파일만 업로드 가능합니다.");
      return;
    }

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("파일 크기는 20MB를 초과할 수 없습니다.");
      return;
    }

    updateQuestion(index, "media_file", file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    updateQuestion(index, "media_url", previewUrl);
  };

  const generateRandomSlug = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (questions.length === 0) {
      toast.error("최소 1개의 질문을 추가해주세요.");
      return;
    }

    setLoading(true);

    try {
      let surveyId = id;
      const finalSlug = slug || generateRandomSlug();

      if (id) {
        // Update existing survey
        const { error: updateError } = await supabase
          .from("surveys")
          .update({
            title,
            description,
            intro_text: introText,
            slug: finalSlug,
            basic_fields: basicFields as any,
          })
          .eq("id", id);

        if (updateError) throw updateError;

        // Delete old questions
        await supabase.from("survey_questions").delete().eq("survey_id", id);
      } else {
        // Create new survey with auto-generated slug
        const { data: surveyData, error: surveyError } = await supabase
          .from("surveys")
          .insert({
            title,
            description,
            intro_text: introText,
            slug: finalSlug,
            basic_fields: basicFields as any,
            created_by: null,
          })
          .select()
          .single();

        if (surveyError) throw surveyError;
        surveyId = surveyData.id;
        
        // Update the slug state with the generated one
        setSlug(finalSlug);
      }

      // Upload media files and insert questions
      const questionsToInsert = await Promise.all(
        questions.map(async (q, index) => {
          let mediaUrl = q.media_url;

          // Upload new media file if exists
          if (q.media_file) {
            const fileExt = q.media_file.name.split('.').pop();
            const fileName = `${surveyId}/${Date.now()}_${index}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('survey-media')
              .upload(fileName, q.media_file);

            if (uploadError) {
              console.error('Upload error:', uploadError);
              toast.error(`파일 업로드 실패: ${q.media_file.name}`);
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('survey-media')
                .getPublicUrl(fileName);
              mediaUrl = publicUrl;
            }
          }

          return {
            survey_id: surveyId,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options,
            is_required: q.is_required,
            question_order: index,
            media_url: mediaUrl,
            time_settings: q.time_settings as any
          };
        })
      );

      const { error: questionsError } = await supabase
        .from("survey_questions")
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast.success(id ? "설문조사가 수정되었습니다." : "설문조사가 생성되었습니다.");
      navigate("/dashboard");
    } catch (error: any) {
      if (error.message?.includes("duplicate key")) {
        toast.error("이미 사용 중인 URL입니다.");
      } else {
        toast.error("저장에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            대시보드로 돌아가기
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Edit Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{id ? "설문조사 편집" : "새 설문조사 만들기"}</CardTitle>
              </CardHeader>
              <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">설문조사 제목 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="설문조사 제목을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="설문조사에 대한 간단한 설명"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="introText">소개 텍스트</Label>
                <Textarea
                  id="introText"
                  value={introText}
                  onChange={(e) => setIntroText(e.target.value)}
                  placeholder="설문조사 시작 전 응답자에게 보여줄 소개 텍스트"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>기본 정보 필드</Label>
                <p className="text-xs text-muted-foreground mb-3">응답자가 입력할 기본 정보 필드를 설정하세요 (예: 학교, 이름)</p>
                <div className="space-y-3">
                  {basicFields.map((field, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">필드 ID</Label>
                          <Input
                            value={field.id}
                            onChange={(e) => {
                              const newFields = [...basicFields];
                              newFields[index].id = e.target.value;
                              setBasicFields(newFields);
                            }}
                            placeholder="예: school"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">라벨</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...basicFields];
                              newFields[index].label = e.target.value;
                              setBasicFields(newFields);
                            }}
                            placeholder="예: 학교"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">플레이스홀더</Label>
                        <Input
                          value={field.placeholder}
                          onChange={(e) => {
                            const newFields = [...basicFields];
                            newFields[index].placeholder = e.target.value;
                            setBasicFields(newFields);
                          }}
                          placeholder="예: 학교명을 입력하세요"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={field.required}
                            onCheckedChange={(checked) => {
                              const newFields = [...basicFields];
                              newFields[index].required = checked as boolean;
                              setBasicFields(newFields);
                            }}
                          />
                          <Label className="text-xs">필수 항목</Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFields = basicFields.filter((_, i) => i !== index);
                            setBasicFields(newFields);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBasicFields([
                        ...basicFields,
                        { id: "", label: "", type: "text", required: false, placeholder: "" }
                      ]);
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    필드 추가
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">질문</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button type="button" onClick={addQuestion} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      질문 1개 추가
                    </Button>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={bulkAddCount}
                        onChange={(e) => setBulkAddCount(e.target.value)}
                        placeholder="개수"
                        className="w-20"
                      />
                      <Button 
                        type="button" 
                        onClick={addMultipleQuestions} 
                        size="sm"
                      >
                        한번에 추가
                      </Button>
                      <span className="text-xs text-muted-foreground">(최대 50개)</span>
                    </div>
                  </div>
                </div>

                {questions.map((question, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                        <div className="flex-1 space-y-4">
                          <div>
                            <Label>질문 {index + 1}</Label>
                            <Input
                              value={question.question_text}
                              onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                              placeholder="질문을 입력하세요"
                              required
                            />
                          </div>

                          <div>
                            <Label>질문 유형</Label>
                            <Select
                              value={question.question_type}
                              onValueChange={(value) => updateQuestion(index, "question_type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">주관식</SelectItem>
                                <SelectItem value="checkbox">객관식 (복수 선택 가능)</SelectItem>
                                <SelectItem value="time_range">시간대 선택</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {(question.question_type === "checkbox") && (
                            <div className="space-y-3">
                              <Label>선택지</Label>
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...question.options];
                                        newOptions[optionIndex] = e.target.value;
                                        updateQuestion(index, "options", newOptions);
                                      }}
                                      placeholder={`선택지 ${optionIndex + 1}`}
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const newOptions = question.options.filter((_, i) => i !== optionIndex);
                                        updateQuestion(index, "options", newOptions);
                                      }}
                                      className="shrink-0"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    updateQuestion(index, "options", [...question.options, ""]);
                                  }}
                                  className="w-full"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  선택지 추가
                                </Button>
                              </div>
                            </div>
                          )}

                          {question.question_type === "time_range" && (
                            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                              {/* Weekdays (월~금) */}
                              <div className="space-y-3 p-3 bg-background rounded border">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-semibold">평일 (월~금)</Label>
                                  <Checkbox
                                    checked={question.time_settings?.weekdays.enabled}
                                    onCheckedChange={(checked) => updateTimeSettings(index, 'weekdays', 'enabled', checked)}
                                  />
                                </div>
                                {question.time_settings?.weekdays.enabled && (
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs">시작 시간</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={9}
                                        disabled
                                        className="mt-1"
                                      />
                                      <span className="text-xs text-muted-foreground">09:00 고정</span>
                                    </div>
                                    <div>
                                      <Label className="text-xs">종료 시간</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={22}
                                        disabled
                                        className="mt-1"
                                      />
                                      <span className="text-xs text-muted-foreground">22:00 고정</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Weekends (토, 일) */}
                              <div className="space-y-3 p-3 bg-background rounded border">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-semibold">주말 (토, 일)</Label>
                                  <Checkbox
                                    checked={question.time_settings?.weekends.enabled}
                                    onCheckedChange={(checked) => updateTimeSettings(index, 'weekends', 'enabled', checked)}
                                  />
                                </div>
                                {question.time_settings?.weekends.enabled && (
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs">시작 시간</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={9}
                                        disabled
                                        className="mt-1"
                                      />
                                      <span className="text-xs text-muted-foreground">09:00 고정</span>
                                    </div>
                                    <div>
                                      <Label className="text-xs">종료 시간</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={22}
                                        disabled
                                        className="mt-1"
                                      />
                                      <span className="text-xs text-muted-foreground">22:00 고정</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Instructions */}
                              <div className="space-y-3 p-3 bg-background rounded border">
                                <Label className="text-sm font-semibold">안내 텍스트</Label>
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-xs">첫 번째 줄</Label>
                                    <Input
                                      value={question.time_settings?.instructions?.line1 || "✓ 드래그하여 시간 범위를 선택하세요"}
                                      onChange={(e) => {
                                        const newSettings = {
                                          ...question.time_settings,
                                          instructions: {
                                            line1: e.target.value,
                                            line2: question.time_settings?.instructions?.line2 || "✓ 가능한 시간범위를 최대한으로 체크해주세요.",
                                            line3: question.time_settings?.instructions?.line3 || "*여러 시간대를 자유롭게 추가할 수 있습니다 (ex: 오전 9시 ~ 오후 1시, 오후 5시 ~ 오후 7시)"
                                          }
                                        } as TimeSettings;
                                        updateQuestion(index, "time_settings", newSettings);
                                      }}
                                      placeholder="첫 번째 안내 문구"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">두 번째 줄</Label>
                                    <Input
                                      value={question.time_settings?.instructions?.line2 || "✓ 가능한 시간범위를 최대한으로 체크해주세요."}
                                      onChange={(e) => {
                                        const newSettings = {
                                          ...question.time_settings,
                                          instructions: {
                                            line1: question.time_settings?.instructions?.line1 || "✓ 드래그하여 시간 범위를 선택하세요",
                                            line2: e.target.value,
                                            line3: question.time_settings?.instructions?.line3 || "*여러 시간대를 자유롭게 추가할 수 있습니다 (ex: 오전 9시 ~ 오후 1시, 오후 5시 ~ 오후 7시)"
                                          }
                                        } as TimeSettings;
                                        updateQuestion(index, "time_settings", newSettings);
                                      }}
                                      placeholder="두 번째 안내 문구"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">세 번째 줄</Label>
                                    <Input
                                      value={question.time_settings?.instructions?.line3 || "*여러 시간대를 자유롭게 추가할 수 있습니다 (ex: 오전 9시 ~ 오후 1시, 오후 5시 ~ 오후 7시)"}
                                      onChange={(e) => {
                                        const newSettings = {
                                          ...question.time_settings,
                                          instructions: {
                                            line1: question.time_settings?.instructions?.line1 || "✓ 드래그하여 시간 범위를 선택하세요",
                                            line2: question.time_settings?.instructions?.line2 || "✓ 가능한 시간범위를 최대한으로 체크해주세요.",
                                            line3: e.target.value
                                          }
                                        } as TimeSettings;
                                        updateQuestion(index, "time_settings", newSettings);
                                      }}
                                      placeholder="세 번째 안내 문구"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                평일과 주말 시간대가 고정되어 있습니다.
                              </p>
                            </div>
                          )}

                          <div>
                            <Label>이미지/동영상 첨부 (선택사항)</Label>
                            <Input
                              type="file"
                              accept="image/*,video/*"
                              onChange={(e) => handleFileUpload(index, e.target.files?.[0] || null)}
                            />
                            {question.media_url && (
                              <div className="mt-2">
                                {question.media_url.includes('video') || question.media_file?.type.startsWith('video') ? (
                                  <video src={question.media_url} controls className="max-w-full h-auto max-h-48 rounded" />
                                ) : (
                                  <img src={question.media_url} alt="미리보기" className="max-w-full h-auto max-h-48 rounded" />
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`required-${index}`}
                              checked={question.is_required}
                              onCheckedChange={(checked) => updateQuestion(index, "is_required", checked)}
                            />
                            <Label htmlFor={`required-${index}`} className="text-sm font-normal">
                              필수 질문
                            </Label>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  취소
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "저장 중..." : id ? "수정하기" : "생성하기"}
                </Button>
              </div>
            </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Card className="border-2 border-dashed">
              <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground">
                <CardTitle className="text-center">미리보기</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Survey Title Preview */}
                <div className="text-center pb-4 border-b">
                  <h2 className="text-2xl font-bold mb-2">
                    {title || "설문조사 제목"}
                  </h2>
                  {description && (
                    <p className="text-muted-foreground">{description}</p>
                  )}
                </div>

                {/* Intro Text Preview */}
                {introText && (
                  <Card className="p-4 mb-4 border-l-4 border-accent animate-fade-in">
                    <div className="text-muted-foreground leading-relaxed">
                      {introText.split('\n').map((line, index) => (
                        <p key={index} className={index > 0 ? 'mt-2' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Basic Fields Preview */}
                {basicFields.length > 0 && (
                  <Card className="bg-muted/30 mb-4">
                    <CardContent className="p-4 space-y-3">
                      {basicFields.map((field, index) => (
                        <div key={index} className="space-y-2">
                          <Label>
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                          <Input placeholder={field.placeholder} disabled />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Questions Preview */}
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>질문을 추가하면 여기에 미리보기가 표시됩니다</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <Card key={index} className="bg-muted/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-start gap-2">
                            <span className="text-primary">{index + 1}.</span>
                            <span className="flex-1">
                              {question.question_text || "질문 내용을 입력하세요"}
                              {question.is_required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </span>
                          </CardTitle>
                          {question.media_url && (
                            <div className="mt-2">
                              {question.media_url.includes('video') || question.media_file?.type.startsWith('video') ? (
                                <video src={question.media_url} controls className="max-w-full h-auto max-h-32 rounded" />
                              ) : (
                                <img src={question.media_url} alt="미리보기" className="max-w-full h-auto max-h-32 rounded" />
                              )}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent>
                          {question.question_type === "text" && (
                            <Textarea placeholder="텍스트 입력" disabled rows={3} />
                          )}
                          {question.question_type === "checkbox" && (
                            <div className="space-y-2">
                              {question.options.length > 0 ? (
                                question.options.map((option, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded border-2 border-primary" />
                                    <span className="text-sm">{option}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">선택지를 추가하세요</p>
                              )}
                            </div>
                          )}
                          {question.question_type === "time_range" && (
                            <div className="space-y-3">
                              {question.time_settings?.instructions && (
                                <div className="bg-accent/10 border-l-4 border-accent rounded-lg p-4 mb-4">
                                  <p className="text-sm text-foreground font-medium">
                                    {question.time_settings.instructions.line1}
                                  </p>
                                  <p className="text-sm text-foreground font-medium mt-2">
                                    {question.time_settings.instructions.line2}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {question.time_settings.instructions.line3}
                                  </p>
                                </div>
                              )}
                              {question.time_settings?.weekdays.enabled && (
                                <>
                                  {["월요일", "화요일", "수요일", "목요일", "금요일"].map((day) => (
                                    <TimeRangeSlider
                                      key={day}
                                      day={day}
                                      selectedRanges={[]}
                                      onChange={() => {}}
                                      minHour={13}
                                      maxHour={22}
                                    />
                                  ))}
                                </>
                              )}
                              {question.time_settings?.weekends.enabled && (
                                <>
                                  {["토요일", "일요일"].map((day) => (
                                    <TimeRangeSlider
                                      key={day}
                                      day={day}
                                      selectedRanges={[]}
                                      onChange={() => {}}
                                      minHour={9}
                                      maxHour={22}
                                    />
                                  ))}
                                </>
                              )}
                              {!question.time_settings?.weekdays.enabled && !question.time_settings?.weekends.enabled && (
                                <div className="bg-muted p-3 rounded text-sm text-muted-foreground">
                                  평일 또는 주말을 선택하세요
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Submit Button Preview */}
                {questions.length > 0 && (
                  <div className="pt-4">
                    <Button className="w-full" size="lg" disabled>
                      설문 제출하기
                    </Button>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      설문에 응해 주셔서 감사합니다!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateSurvey;
