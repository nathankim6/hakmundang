import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";
import { TimeRangeSlider } from "@/components/TimeRangeSlider";
import { X } from "lucide-react";

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
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  is_required: boolean;
  question_order: number;
  media_url?: string;
  time_settings?: TimeSettings;
}

interface Survey {
  id: string;
  title: string;
  description: string | null;
  intro_text: string | null;
  basic_fields: BasicField[];
}

interface SurveyResponseProps {
  previewMode?: boolean;
  previewSlug?: string;
}

const SurveyResponse = ({ previewMode = false, previewSlug }: SurveyResponseProps) => {
  const { slug: urlSlug } = useParams();
  const slug = previewMode ? previewSlug : urlSlug;
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchSurvey();
  }, [slug]);

  const fetchSurvey = async () => {
    if (!slug) return;

    const { data: surveyData, error: surveyError } = await supabase
      .from("surveys")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (surveyError || !surveyData) {
      toast.error("설문조사를 찾을 수 없습니다.");
      navigate("/");
      return;
    }

    setSurvey({
      ...surveyData,
      basic_fields: (surveyData.basic_fields as unknown as BasicField[]) || []
    });

    const { data: questionsData, error: questionsError } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", surveyData.id)
      .order("question_order");

    if (!questionsError && questionsData) {
      setQuestions(questionsData.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: Array.isArray(q.options) ? q.options.map(o => String(o)) : [],
        is_required: q.is_required,
        question_order: q.question_order,
        media_url: q.media_url || undefined,
        time_settings: q.time_settings ? q.time_settings as unknown as TimeSettings : undefined
      })));
    }

    setLoading(false);
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (previewMode) {
      toast.info("미리보기 모드에서는 제출이 비활성화되어 있습니다.");
      return;
    }

    // Validate required questions
    for (const question of questions) {
      if (question.is_required) {
        if (question.question_type === "time_range") {
          // For time_range questions, check if at least one day has selections
          const days = [
            ...(question.time_settings?.weekdays.enabled ? ["월요일", "화요일", "수요일", "목요일", "금요일"] : []),
            ...(question.time_settings?.weekends.enabled ? ["토요일", "일요일"] : [])
          ];
          
          const hasAnySelection = days.some(day => {
            const ranges = answers[`${question.id}_${day}`];
            return ranges && Array.isArray(ranges) && ranges.length > 0;
          });
          
          if (!hasAnySelection) {
            toast.error(`"${question.question_text}" 질문은 필수입니다.`);
            return;
          }
        } else if (question.question_type === "checkbox") {
          // For checkbox questions, check if at least one option is selected
          const selected = answers[question.id];
          if (!selected || !Array.isArray(selected) || selected.length === 0) {
            toast.error(`"${question.question_text}" 질문은 필수입니다.`);
            return;
          }
        } else {
          // For other question types, check if answer exists
          if (!answers[question.id]) {
            toast.error(`"${question.question_text}" 질문은 필수입니다.`);
            return;
          }
        }
      }
    }

    if (!survey) return;

    setSubmitting(true);

    try {
      // Prepare response data with only fixed schema columns
      const responseData: any = {
        survey_id: survey.id,
        name: answers.name || "익명",
        school: answers.school || "",
        join_class: "",
        join_class_other: "",
        exam_type: "",
        time_slots: [],
        additional_comments: ""
      };

      // Map question answers to fixed columns
      questions.forEach((question) => {
        const answer = answers[question.id];
        
        if (question.question_type === "time_range") {
          // Collect all time ranges from all days for time_slots column
          const days = [
            ...(question.time_settings?.weekdays.enabled ? ["월요일", "화요일", "수요일", "목요일", "금요일"] : []),
            ...(question.time_settings?.weekends.enabled ? ["토요일", "일요일"] : [])
          ];
          
          const allTimeSlots = days.flatMap(day => {
            const ranges = answers[`${question.id}_${day}`];
            if (ranges && Array.isArray(ranges)) {
              return ranges.map(range => ({
                day,
                start: range.start,
                end: range.end
              }));
            }
            return [];
          });
          
          responseData.time_slots = allTimeSlots;
        } else if (question.question_type === "checkbox") {
          // For checkbox, join array values
          const value = Array.isArray(answer) ? answer.join(", ") : (answer || "");
          
          // Map to appropriate column based on question content
          if (question.question_text.includes("합류")) {
            responseData.join_class = value;
          } else if (question.question_text.includes("전형")) {
            responseData.exam_type = value;
          }
        } else if (question.question_type === "text") {
          // Text questions go to additional_comments
          responseData.additional_comments = answer || "";
        }
      });

      console.log("Submitting data:", responseData);
      
      const { error } = await supabase.from("survey_responses").insert(responseData);

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      toast.success("설문조사가 제출되었습니다!");
      setAnswers({});
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(`제출에 실패했습니다: ${error?.message || "알 수 없는 오류"}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <div className={`min-h-screen ${previewMode ? '' : 'bg-gradient-to-br from-primary/20 via-background to-accent/20'}`}>
      {!previewMode && (
        <header className="bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground py-6 shadow-lg">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="h-12 w-12 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold">{survey.title}</h1>
                {survey.description && (
                  <p className="text-primary-foreground/90">{survey.description}</p>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {previewMode && survey && (
        <div className="mb-4 p-4 bg-primary/10 rounded-lg">
          <h2 className="text-xl font-bold">{survey.title}</h2>
          {survey.description && (
            <p className="text-muted-foreground">{survey.description}</p>
          )}
        </div>
      )}

      <main className={`${previewMode ? '' : 'container mx-auto px-4 py-8'} max-w-4xl`}>
        {/* Intro Text Card */}
        {survey.intro_text && (
          <Card className="mb-6 border-l-4 border-accent animate-fade-in">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {survey.intro_text}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Basic Fields Form */}
        {survey.basic_fields && survey.basic_fields.length > 0 && (
          <Card className="mb-6 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {survey.basic_fields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.id}
                    value={answers[field.id] || ""}
                    onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id} className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">
                  {question.question_text}
                  {question.is_required && <span className="text-destructive ml-1">*</span>}
                </CardTitle>
                {question.media_url && (
                  <div className="mt-4">
                    {question.media_url.includes('.mp4') || question.media_url.includes('.webm') || question.media_url.includes('video') ? (
                      <video src={question.media_url} controls className="max-w-full h-auto max-h-96 rounded-lg" />
                    ) : (
                      <img 
                        src={question.media_url} 
                        alt="질문 이미지" 
                        className="max-w-full h-auto max-h-96 rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                        onClick={() => setEnlargedImage(question.media_url!)}
                      />
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {question.question_type === "text" && (
                  <Textarea
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    required={question.is_required}
                    rows={4}
                    placeholder="답변을 입력하세요"
                  />
                )}

                {question.question_type === "checkbox" && (
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.id}-${index}`}
                          checked={(answers[question.id] || []).includes(option)}
                          onCheckedChange={(checked) => {
                            const current = answers[question.id] || [];
                            if (checked) {
                              handleAnswerChange(question.id, [...current, option]);
                            } else {
                              handleAnswerChange(question.id, current.filter((v: string) => v !== option));
                            }
                          }}
                        />
                        <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </div>
                )}

                {question.question_type === "time_range" && (
                  <div className="space-y-4">
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
                            selectedRanges={answers[`${question.id}_${day}`] || []}
                            onChange={(ranges) => handleAnswerChange(`${question.id}_${day}`, ranges)}
                            minHour={9}
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
                            selectedRanges={answers[`${question.id}_${day}`] || []}
                            onChange={(ranges) => handleAnswerChange(`${question.id}_${day}`, ranges)}
                            minHour={9}
                            maxHour={22}
                          />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button type="submit" className="w-full" size="lg" disabled={submitting || previewMode}>
            {previewMode ? "미리보기 모드" : submitting ? "제출 중..." : "제출하기"}
          </Button>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-6 py-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 ORUN ENGLISH. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Image Enlargement Dialog */}
      <Dialog open={!!enlargedImage} onOpenChange={(open) => !open && setEnlargedImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
              onClick={() => setEnlargedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {enlargedImage && (
              <img
                src={enlargedImage}
                alt="확대된 이미지"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SurveyResponse;
