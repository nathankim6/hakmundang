import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, Plus, Trash2, StopCircle, Pencil, Check, X, BookOpen, ClipboardList, Sparkles, Zap, Target, Award, ChevronRight, Clock, LayoutGrid, CheckCircle2, Download } from "lucide-react";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import PageHeader from "@/components/PageHeader";
import examListIcon from "@/assets/page-icons/exam-list-icon.png";
import premiumExamIcon from "@/assets/premium-exam-icon.png";
import vocathonBanner from "@/assets/vocathon-banner.png";
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, ShadingType } from "docx";
import { saveAs } from "file-saver";
interface Exam {
  id: string;
  title: string;
  created_at: string;
  total_questions: number;
  multiple_choice_count: number;
  spelling_count: number;
  synonym_antonym_count?: number;
  is_ended?: boolean;
  selected_days?: string[];
  card_sets?: {
    title: string;
    image_url?: string | null;
  };
}

// 선지 표시용 정리 함수 - 괄호 내용 제거 (답을 유추하는 힌트가 될 수 있음)
const cleanChoiceForDisplay = (text: string): string => {
  if (!text || text.trim().length === 0) return text;
  let cleaned = text.trim();

  // 1. 품사 마커 제거 [명], [동], [형], [부]
  cleaned = cleaned.replace(/\[([명동형부])\]\s*/g, '');
  cleaned = cleaned.replace(/\s*\[([명동형부])\]\s*/g, ' ');

  // 2. 소괄호와 그 내용 제거 (예: "(상품의) 소매점" -> "소매점")
  cleaned = cleaned.replace(/\([^)]*\)/g, '');

  // 3. 대괄호와 그 내용 제거 (예: "신입 사원[회원]" -> "신입 사원")
  cleaned = cleaned.replace(/\[[^\]]*\]/g, '');

  // 4. 연속된 공백 정리 및 앞뒤 공백 제거
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
};
const ExamList = () => {
  const {
    toast
  } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [typeCounts, setTypeCounts] = useState<Record<string, {
    multiple_choice: number;
    spelling: number;
    example: number;
    definition: number;
    synonym_antonym: number;
  }>>({});
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [downloadingExamId, setDownloadingExamId] = useState<string | null>(null);

  // Word 시험지 다운로드 함수
  const handleDownloadWord = async (examId: string, examTitle: string) => {
    setDownloadingExamId(examId);
    try {
      // 시험 문제 가져오기
      const {
        data: questionsData,
        error: questionsError
      } = await supabase.from("exam_questions").select("*").eq("exam_id", examId).order("question_number", {
        ascending: true
      });
      if (questionsError) throw questionsError;
      if (!questionsData || questionsData.length === 0) {
        toast({
          title: "다운로드 실패",
          description: "문제가 없는 시험입니다.",
          variant: "destructive"
        });
        return;
      }

      // 폰트 설정 (8pt = 16 half-points)
      const FONT_SIZE = 16;
      const FONT_SIZE_SMALL = 14;
      const FONT_SIZE_TITLE = 20;
      const FONT_SIZE_HEADER = 24;
      const FONT_NAME = "맑은 고딕";
      const getChoiceLabel = (idx: number) => `${idx + 1})`;

      // 정답 배열 가져오기 (객관식 복수정답)
      const getCorrectAnswersArray = (question: any): string[] => {
        try {
          const parsed = JSON.parse(question.correct_answer);
          if (Array.isArray(parsed)) return parsed;
          return [question.correct_answer];
        } catch {
          return [question.correct_answer];
        }
      };

      // 문제 단락 생성
      const createQuestionParagraphs = () => {
        const paragraphs: any[] = [];
        questionsData.forEach((question: any) => {
          let questionText = "";
          let typeLabel = "";
          let correctAnswerCount = 0;
          if (question.question_type === "multiple_choice") {
            questionText = question.word;
            typeLabel = "뜻";
            // 정답 개수 계산
            const correctAnswers = getCorrectAnswersArray(question);
            correctAnswerCount = correctAnswers.length;
          } else if (question.question_type === "spelling") {
            questionText = question.meaning;
            typeLabel = "철자";
          } else if (question.question_type === "spelling_choice") {
            questionText = question.meaning;
            typeLabel = "철자(객)";
          } else if (question.question_type === "definition") {
            questionText = question.english_definition || question.word;
            typeLabel = "영영";
          } else {
            questionText = question.meaning;
            typeLabel = "예문";
          }

          // 문제 번호와 유형, 내용
          const textRuns: any[] = [new TextRun({
            text: `${question.question_number}. `,
            bold: true,
            size: FONT_SIZE,
            font: FONT_NAME
          }), new TextRun({
            text: `[${typeLabel}] `,
            size: FONT_SIZE_SMALL,
            font: FONT_NAME,
            color: "888888"
          }), new TextRun({
            text: questionText,
            size: FONT_SIZE,
            font: FONT_NAME
          })];

          // 객관식 문제에 정답 개수 표시
          if (question.question_type === "multiple_choice" && correctAnswerCount > 0) {
            textRuns.push(new TextRun({
              text: ` (${correctAnswerCount}개)`,
              size: FONT_SIZE_SMALL,
              font: FONT_NAME,
              color: "0066CC",
              bold: true
            }));
          }
          paragraphs.push(new Paragraph({
            children: textRuns,
            spacing: {
              before: 80,
              after: 30
            }
          }));

          // 예문완성의 경우 예문 추가
          if (question.question_type === "example" && question.example_sentence) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({
                text: `   → ${question.example_sentence}`,
                size: FONT_SIZE_SMALL,
                font: FONT_NAME,
                italics: true,
                color: "555555"
              })],
              spacing: {
                after: 30
              }
            }));
          }

          // 선택지 (객관식, 영영풀이, 예문완성)
          if ((question.question_type === "multiple_choice" || question.question_type === "definition" || question.question_type === "example" || question.question_type === "spelling_choice") && question.choices) {
            const choiceText = question.choices.map((choice: string, idx: number) => `${getChoiceLabel(idx)} ${cleanChoiceForDisplay(choice)}`).join("  ");
            paragraphs.push(new Paragraph({
              children: [new TextRun({
                text: `   ${choiceText}`,
                size: FONT_SIZE_SMALL,
                font: FONT_NAME
              })],
              spacing: {
                after: 40
              }
            }));
          }

          // 철자쓰기 답안란
          if (question.question_type === "spelling") {
            const cleanWord = question.correct_answer.replace(/^\d+\.\s*/, '').trim();
            const firstLetter = cleanWord[0] || "";
            paragraphs.push(new Paragraph({
              children: [new TextRun({
                text: `   [${firstLetter}`,
                size: FONT_SIZE,
                font: FONT_NAME,
                bold: true
              }), new TextRun({
                text: "_".repeat(15),
                size: FONT_SIZE,
                font: FONT_NAME,
                color: "AAAAAA"
              }), new TextRun({
                text: "]",
                size: FONT_SIZE,
                font: FONT_NAME,
                bold: true
              })],
              spacing: {
                after: 40
              }
            }));
          }

          // 문제 사이 빈 줄
          paragraphs.push(new Paragraph({
            text: "",
            spacing: {
              after: 80
            }
          }));
        });
        return paragraphs;
      };

      // 정답 단락 생성
      const createAnswerParagraphs = () => {
        const paragraphs: any[] = [];
        questionsData.forEach((question: any) => {
          let answerText = "";
          if (question.question_type === "multiple_choice" || question.question_type === "definition" || question.question_type === "example") {
            const answerToFind = question.question_type === "definition" ? question.meaning : question.correct_answer;
            const correctIndex = question.choices?.indexOf(answerToFind) ?? -1;
            answerText = correctIndex >= 0 ? `${getChoiceLabel(correctIndex)} ${answerToFind}` : answerToFind;
          } else if (question.question_type === "spelling_choice") {
            const cleanAns = question.correct_answer.replace(/^\d+\.\s*/, '').trim();
            const correctIndex = question.choices?.findIndex((c: string) => cleanChoiceForDisplay(c) === cleanAns) ?? -1;
            answerText = correctIndex >= 0 ? `${getChoiceLabel(correctIndex)} ${cleanAns}` : cleanAns;
          } else {
            answerText = question.correct_answer.replace(/^\d+\.\s*/, '').trim();
          }
          paragraphs.push(new Paragraph({
            children: [new TextRun({
              text: `${question.question_number}. ${answerText}`,
              size: FONT_SIZE,
              font: FONT_NAME
            })],
            spacing: {
              before: 20,
              after: 20
            }
          }));
        });
        return paragraphs;
      };
      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                font: FONT_NAME,
                size: FONT_SIZE
              }
            }
          }
        },
        sections: [
        // 시험지 섹션 (2단)
        {
          properties: {
            page: {
              margin: {
                top: 567,
                right: 567,
                bottom: 567,
                left: 567
              }
            },
            column: {
              space: 400,
              count: 2
            }
          },
          children: [
          // 헤더
          new Paragraph({
            children: [new TextRun({
              text: "ORUN ENGLISH",
              bold: true,
              size: FONT_SIZE_HEADER,
              font: FONT_NAME
            }), new TextRun({
              text: "  |  ",
              size: FONT_SIZE,
              font: FONT_NAME,
              color: "CCCCCC"
            }), new TextRun({
              text: examTitle,
              bold: true,
              size: FONT_SIZE_TITLE,
              font: FONT_NAME
            }), new TextRun({
              text: ` (${questionsData.length}문항)`,
              size: FONT_SIZE_SMALL,
              font: FONT_NAME,
              color: "888888"
            })],
            spacing: {
              after: 60
            },
            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                size: 12,
                color: "333333"
              }
            }
          }),
          // 이름 입력란
          new Paragraph({
            children: [new TextRun({
              text: "이름: _______________     점수: _____ / " + questionsData.length,
              size: FONT_SIZE,
              font: FONT_NAME
            })],
            alignment: AlignmentType.RIGHT,
            spacing: {
              before: 80,
              after: 150
            }
          }),
          // 문제들
          ...createQuestionParagraphs()]
        },
        // 정답표 섹션 (2단)
        {
          properties: {
            page: {
              margin: {
                top: 567,
                right: 567,
                bottom: 567,
                left: 567
              }
            },
            column: {
              space: 400,
              count: 2
            }
          },
          children: [new Paragraph({
            children: [new TextRun({
              text: "정 답 표",
              bold: true,
              size: FONT_SIZE_HEADER,
              font: FONT_NAME
            }), new TextRun({
              text: `  |  ${examTitle}`,
              size: FONT_SIZE,
              font: FONT_NAME,
              color: "888888"
            })],
            spacing: {
              after: 100
            },
            border: {
              bottom: {
                style: BorderStyle.DOUBLE,
                size: 6,
                color: "333333"
              }
            }
          }), new Paragraph({
            text: "",
            spacing: {
              after: 150
            }
          }), ...createAnswerParagraphs(), new Paragraph({
            text: "",
            spacing: {
              after: 200
            }
          }), new Paragraph({
            children: [new TextRun({
              text: `© ${new Date().getFullYear()} ORUN ENGLISH`,
              size: FONT_SIZE_SMALL,
              font: FONT_NAME,
              color: "AAAAAA"
            })],
            alignment: AlignmentType.CENTER
          })]
        }]
      });
      const blob = await Packer.toBlob(doc);
      const fileName = `${examTitle}_시험지_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '-')}.docx`;
      saveAs(blob, fileName);
      toast({
        title: "다운로드 완료",
        description: "시험지가 Word 파일로 저장되었습니다."
      });
    } catch (error) {
      console.error("Word 생성 오류:", error);
      toast({
        title: "다운로드 실패",
        description: "Word 파일 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setDownloadingExamId(null);
    }
  };
  useEffect(() => {
    const adminStatus = sessionStorage.getItem("adminLoggedIn") === "true";
    const accessCode = sessionStorage.getItem("accessCode");
    setIsAdmin(adminStatus || accessCode === "101100" || accessCode === "admin" || accessCode === "orun0088");
    fetchExams();
  }, []);
  
  const fetchExams = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("exams").select(`
        *,
        card_sets (
          title,
          image_url
        )
      `).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      
      let filteredExams = data || [];
      
      // 학생인 경우 접근 가능한 시험만 필터링
      const adminStatus = sessionStorage.getItem("adminLoggedIn") === "true";
      const accessCode = sessionStorage.getItem("accessCode");
      const isUserAdmin = adminStatus || accessCode === "101100" || accessCode === "admin";
      
      if (!isUserAdmin) {
        // 학생 데이터에서 access_code_id 가져오기
        const studentDataStr = sessionStorage.getItem('studentData');
        if (studentDataStr) {
          try {
            const studentData = JSON.parse(studentDataStr);
            // 해당 액세스 코드에 할당된 시험 ID 가져오기
            const { data: allowedExams } = await supabase
              .from('access_code_exams')
              .select('exam_id')
              .eq('access_code_id', studentData.id);
            
            if (allowedExams && allowedExams.length > 0) {
              // 할당된 시험이 있으면 해당 시험만 표시
              const allowedIds = allowedExams.map(item => item.exam_id);
              filteredExams = filteredExams.filter(exam => allowedIds.includes(exam.id));
            }
            // 할당된 시험이 없으면 모든 시험 표시 (기본 동작)
          } catch (e) {
            console.error('Error parsing student data:', e);
          }
        }
      }
      
      // CSV로 수동 등록된 시험 제외 (모든 문제 유형 수가 0인 시험)
      filteredExams = filteredExams.filter((exam: any) => {
        const hasQuestions = (exam.multiple_choice_count || 0) + (exam.spelling_count || 0) + 
          (exam.definition_count || 0) + (exam.example_count || 0) + (exam.synonym_antonym_count || 0) > 0;
        return hasQuestions;
      });
      
      setExams(filteredExams);
      
      if (filteredExams && filteredExams.length > 0) {
        const examIds = filteredExams.map((e: any) => e.id);
        const {
          data: qRows,
          error: qError
        } = await supabase.from("exam_questions").select("exam_id, question_type").in("exam_id", examIds);
        if (!qError && qRows) {
          const map: Record<string, {
            multiple_choice: number;
            spelling: number;
            example: number;
            definition: number;
            synonym_antonym: number;
          }> = {};
          (qRows as any[]).forEach(row => {
            const eid = row.exam_id as string;
            const qt = row.question_type as 'multiple_choice' | 'spelling' | 'example' | 'definition' | 'synonym_antonym';
            if (!map[eid]) map[eid] = {
              multiple_choice: 0,
              spelling: 0,
              example: 0,
              definition: 0,
              synonym_antonym: 0
            };
            if (qt in map[eid]) (map[eid] as any)[qt] += 1;
          });
          setTypeCounts(map);
        }
      }
    } catch (error: any) {
      console.error("Error fetching exams:", error);
      toast({
        title: "오류",
        description: "시험 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (examId: string) => {
    if (!confirm("이 시험을 삭제하시겠습니까? (시험 결과는 유지됩니다)")) return;
    try {
      const {
        error
      } = await supabase.from("exams").delete().eq("id", examId);
      if (error) throw error;
      toast({
        title: "삭제 완료",
        description: "시험이 삭제되었습니다. 시험 결과는 보존됩니다."
      });
      fetchExams();
    } catch (error: any) {
      console.error("Error deleting exam:", error);
      toast({
        title: "삭제 실패",
        description: error.message || "시험 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  const handleEndExam = async (examId: string) => {
    if (!confirm("이 시험을 종료하시겠습니까?")) return;
    try {
      const {
        error
      } = await supabase.from("exams").update({
        is_ended: true
      } as any).eq("id", examId);
      if (error) throw error;
      toast({
        title: "시험 종료",
        description: "시험이 종료되었습니다."
      });
      fetchExams();
    } catch (error: any) {
      console.error("Error ending exam:", error);
      toast({
        title: "종료 실패",
        description: error.message || "시험 종료 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  const handleStartEdit = (examId: string, currentTitle: string) => {
    setEditingExamId(examId);
    setEditingTitle(currentTitle);
  };
  const handleCancelEdit = () => {
    setEditingExamId(null);
    setEditingTitle("");
  };
  const handleSaveTitle = async (examId: string) => {
    if (!editingTitle.trim()) {
      toast({
        title: "오류",
        description: "시험명을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        error: examError
      } = await supabase.from("exams").update({
        title: editingTitle.trim()
      }).eq("id", examId);
      if (examError) throw examError;
      // Fetch all exam_results and filter client-side for those containing this exam_id
      const {
        data: allResults,
        error: fetchError
      } = await supabase.from("exam_results").select("id, exam_history");
      if (fetchError) throw fetchError;

      // Filter results that contain this exam_id in their history
      const examResults = allResults?.filter(result => {
        const history = result.exam_history as any[];
        return Array.isArray(history) && history.some((exam: any) => exam.exam_id === examId);
      }) || [];
      if (examResults && examResults.length > 0) {
        const updatePromises = examResults.map(async result => {
          const updatedHistory = (result.exam_history as any[]).map((exam: any) => {
            if (exam.exam_id === examId) {
              return {
                ...exam,
                exam_title: editingTitle.trim()
              };
            }
            return exam;
          });
          return supabase.from("exam_results").update({
            exam_history: updatedHistory
          }).eq("id", result.id);
        });
        await Promise.all(updatePromises);
      }
      toast({
        title: "수정 완료",
        description: "시험명이 수정되었습니다. 모든 기록에 반영되었습니다."
      });
      setEditingExamId(null);
      setEditingTitle("");
      fetchExams();
    } catch (error: any) {
      console.error("Error updating exam title:", error);
      toast({
        title: "수정 실패",
        description: error.message || "시험명 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <FullPageLoading message="시험 목록 로딩 중" subMessage="잠시만 기다려주세요..." />;
  }
  const activeExams = exams.filter(exam => !exam.is_ended);
  const endedExams = exams.filter(exam => exam.is_ended);
  // 단어장 이름별 고유 색상
  const cardSetColorMap: Record<string, string> = {};
  const cardSetColors = [
    "bg-cyan-50 text-cyan-700 border-cyan-200",
    "bg-rose-50 text-rose-700 border-rose-200", 
    "bg-lime-50 text-lime-700 border-lime-200",
    "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    "bg-orange-50 text-orange-700 border-orange-200",
    "bg-teal-50 text-teal-700 border-teal-200",
    "bg-sky-50 text-sky-700 border-sky-200",
    "bg-yellow-50 text-yellow-700 border-yellow-200",
    "bg-indigo-50 text-indigo-700 border-indigo-200",
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  ];
  let colorIndex = 0;
  exams.forEach(exam => {
    const title = exam.card_sets?.title;
    if (title && !(title in cardSetColorMap)) {
      cardSetColorMap[title] = cardSetColors[colorIndex % cardSetColors.length];
      colorIndex++;
    }
  });

  const renderExamCard = (exam: Exam, index: number) => {
    const statusColor = exam.is_ended
      ? "bg-slate-100 text-slate-600 border-slate-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
    const accentColor = exam.is_ended
      ? "from-slate-300 to-slate-400"
      : "from-amber-400 to-amber-500";
    const cardSetTitle = exam.card_sets?.title || "ORUN VOCA Premium";
    const setColorClass = cardSetColorMap[cardSetTitle] || "bg-stone-50 text-stone-600 border-stone-200";
    return <div key={exam.id} className="group animate-fade-in" style={{
      animationDelay: `${index * 0.05}s`
    }}>
      <div className="relative h-full bg-white border border-[#94a3b8]/30 p-6 md:p-8 transition-all duration-500 hover:border-[#334155] hover:shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12)] flex flex-col rounded-xl overflow-hidden">
        {/* Top accent gradient */}
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentColor}`} />
        
        {/* Status & Date */}
        <div className="flex justify-between items-start mb-8">
          <span className={`text-[10px] tracking-[0.2em] uppercase py-1.5 px-3 font-medium rounded-full border ${statusColor}`}>
            {exam.is_ended ? "종료됨" : "진행중"}
          </span>
          <span className="text-[#334155]/40 text-xs tabular-nums">
            {new Date(exam.created_at).toLocaleDateString("ko-KR")}
          </span>
        </div>

        {/* Title */}
        <div className="mb-2">
          {editingExamId === exam.id ? <div className="flex items-center gap-2">
              <Input value={editingTitle} onChange={e => setEditingTitle(e.target.value)} onKeyDown={e => {
            if (e.key === "Enter") handleSaveTitle(exam.id);else if (e.key === "Escape") handleCancelEdit();
          }} className="flex-1 h-9 bg-[#f8fafc] border-[#94a3b8]/40 rounded-lg text-sm focus-visible:ring-2 focus-visible:ring-[#94a3b8]/50" autoFocus />
              <Button size="icon" variant="ghost" onClick={() => handleSaveTitle(exam.id)} className="h-8 w-8 hover:bg-[#f1f5f9] rounded-lg">
                <Check className="w-4 h-4 text-emerald-600" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 hover:bg-red-50 rounded-lg">
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div> : <h3 className="text-xl md:text-[22px] font-semibold text-[#334155] leading-snug" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {exam.title}
            </h3>}
        </div>
        
        {/* Subtitle / Book */}
        <p className="mb-8 min-h-[1.25rem]">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${setColorClass}`}>
            <BookOpen className="w-3 h-3" />
            {cardSetTitle}
          </span>
        </p>
        
        {/* Meta Rows */}
        <div className="space-y-4 border-t border-[#f1f5f9] pt-6 mb-8">
          <div className="flex justify-between items-center text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#94a3b8] uppercase tracking-wider font-medium">
              <Target className="w-3.5 h-3.5 text-amber-500/70" />
              문제 수
            </span>
            <span className="text-[#334155] font-medium tabular-nums">{exam.total_questions}문제</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#94a3b8] uppercase tracking-wider font-medium">
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-500/70" />
              Day 범위
            </span>
            <span className="text-[#334155] font-medium tabular-nums">
              {exam.selected_days && exam.selected_days.length > 0 ? `Day ${(() => {
                const days = exam.selected_days.map((d: string) => {
                  const match = d.match(/(\d+)/);
                  return match ? parseInt(match[1], 10) : 0;
                }).filter((n: number) => n > 0).sort((a: number, b: number) => a - b);
                if (days.length === 0) return '-';
                if (days.length === 1) return String(days[0]).padStart(2, '0');
                return `${String(days[0]).padStart(2, '0')} - ${String(days[days.length - 1]).padStart(2, '0')}`;
              })()}` : "Full Catalog"}
            </span>
          </div>
          <div className="flex justify-between items-start text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#94a3b8] uppercase tracking-wider font-medium">
              <ClipboardList className="w-3.5 h-3.5 text-indigo-500/70" />
              유형
            </span>
            <span className="text-[#334155] font-medium text-right leading-relaxed">
              {[
                exam.multiple_choice_count > 0 && `${exam.multiple_choice_count}객관`,
                exam.spelling_count > 0 && `${exam.spelling_count}철자`,
                (typeCounts[exam.id]?.example ?? 0) > 0 && `${typeCounts[exam.id]?.example}예문`,
                (typeCounts[exam.id]?.definition ?? 0) > 0 && `${typeCounts[exam.id]?.definition}영영`,
                ((typeCounts[exam.id]?.synonym_antonym ?? exam.synonym_antonym_count ?? 0) > 0) && `${typeCounts[exam.id]?.synonym_antonym ?? exam.synonym_antonym_count}동반의어`
              ].filter(Boolean).join(" / ") || "복합 유형"}
            </span>
          </div>
        </div>

        {/* Admin Actions Row */}
        {isAdmin && editingExamId !== exam.id && <div className="flex items-center justify-end gap-1 mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" onClick={() => handleDownloadWord(exam.id, exam.title)} disabled={downloadingExamId === exam.id} className="h-8 w-8 hover:bg-[#f1f5f9] rounded-lg" title="시험지 다운로드">
              {downloadingExamId === exam.id ? <Loader2 className="w-3.5 h-3.5 text-[#334155] animate-spin" /> : <Download className="w-3.5 h-3.5 text-[#334155]" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => handleStartEdit(exam.id, exam.title)} className="h-8 w-8 hover:bg-[#f1f5f9] rounded-lg" title="시험명 수정">
              <Pencil className="w-3.5 h-3.5 text-[#334155]" />
            </Button>
            {!exam.is_ended && <Button variant="ghost" size="icon" onClick={() => handleEndExam(exam.id)} title="시험 종료" className="h-8 w-8 rounded-lg text-[#334155]/60 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                <StopCircle className="w-4 h-4" />
              </Button>}
            <Button variant="ghost" size="icon" onClick={() => handleDelete(exam.id)} className="h-8 w-8 rounded-lg text-[#334155]/60 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>}
        
        {/* Main CTA */}
        <div className="mt-auto pt-4 border-t border-[#f1f5f9]">
          <Link to={`/take-exam?examId=${exam.id}`} className="block">
            <Button className="w-full h-12 text-xs tracking-[0.2em] uppercase font-bold text-white rounded-lg transition-all active:scale-[0.98] bg-gradient-to-r from-[#0f172a] via-[#334155] to-[#0f172a] hover:from-[#020617] hover:via-[#1e293b] hover:to-[#020617] shadow-[0_4px_16px_-4px_rgba(15,23,42,0.45)] hover:shadow-[0_6px_22px_-4px_rgba(15,23,42,0.55)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {exam.is_ended ? "결과 보기" : "Participate"}
            </Button>
          </Link>
        </div>
      </div>
    </div>;
  };
  return <div className="min-h-screen bg-[#f8fafc] flex flex-col overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Subtle warm background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#94a3b8]/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#f1f5f9]/50 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {exams.length === 0 ? <div className="relative overflow-hidden border border-[#94a3b8]/30 bg-white px-6 py-24 sm:py-28 text-center">
              <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-[#94a3b8]/50 to-transparent" />

              <div className="relative">
                <div className="relative mx-auto mb-8 w-16 h-16 border border-[#94a3b8]/40 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-[#334155]" strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl sm:text-3xl font-light text-[#334155] leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  아직 생성된 시험이 없습니다
                </h3>
                <p className="mt-3 text-sm text-[#334155]/60 max-w-md mx-auto">
                  단어장을 선택하고 첫 번째 시험을 만들어보세요.
                </p>

                {isAdmin && <Link to="/create-exam" className="inline-block mt-10">
                    <Button className="group h-11 px-7 bg-gradient-to-r from-[#334155] to-amber-600 hover:from-[#020617] hover:to-amber-700 text-white text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 border-0 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.35)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      <span>첫 시험 생성하기</span>
                      <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-0.5">›</span>
                    </Button>
                  </Link>}
              </div>
            </div> : <Tabs defaultValue="active" className="w-full animate-fade-in overflow-hidden" style={{
        animationDelay: '0.1s'
      }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-[#f1f5f9] p-1.5 shadow-sm border border-[#94a3b8]/20">
              <TabsTrigger value="active" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-white data-[state=active]:to-amber-50/80 data-[state=active]:text-amber-700 data-[state=active]:shadow-sm data-[state=inactive]:text-[#334155]/70 data-[state=inactive]:hover:text-[#334155]">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 data-[state=active]:text-amber-500" />
                  진행중
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{activeExams.length}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="ended" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-white data-[state=active]:to-slate-50/80 data-[state=active]:text-slate-600 data-[state=active]:shadow-sm data-[state=inactive]:text-[#334155]/70 data-[state=inactive]:hover:text-[#334155]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 data-[state=active]:text-emerald-500" />
                  종료됨
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-600">{endedExams.length}</span>
                </div>
              </TabsTrigger>
            </TabsList>
            {isAdmin && <Link to="/create-exam">
              <Button className="h-12 px-6 rounded-xl text-xs tracking-[0.2em] uppercase font-bold text-white bg-gradient-to-r from-[#0f172a] via-[#334155] to-[#0f172a] hover:from-[#020617] hover:via-[#1e293b] hover:to-[#020617] shadow-[0_4px_16px_-4px_rgba(15,23,42,0.45)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                <Plus className="w-4 h-4 mr-2" /> 시험 생성
              </Button>
            </Link>}
            </div>
            
            <TabsContent value="active" className="mt-6 w-full overflow-hidden">
              {activeExams.length === 0 ? <div className="bg-white rounded-2xl border border-[#94a3b8]/30 shadow-sm p-12 text-center">
                  <div className="relative inline-flex mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#f8fafc] border border-[#94a3b8]/30 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-[#334155]" />
                    </div>
                  </div>
                  <p className="text-base font-medium text-[#334155]/70">진행중인 시험이 없습니다</p>
                </div> : <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 w-full">
                  {activeExams.map((exam, index) => renderExamCard(exam, index))}
                </div>}
            </TabsContent>
            
            <TabsContent value="ended" className="mt-6 w-full overflow-hidden">
              {endedExams.length === 0 ? <div className="bg-white rounded-2xl border border-[#94a3b8]/30 shadow-sm p-12 text-center">
                  <div className="relative inline-flex mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#f8fafc] border border-[#94a3b8]/30 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-[#334155]" />
                    </div>
                  </div>
                  <p className="text-base font-medium text-[#334155]/70">종료된 시험이 없습니다</p>
                </div> : <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 w-full">
                  {endedExams.map((exam, index) => renderExamCard(exam, index))}
                </div>}
            </TabsContent>
          </Tabs>}
      </div>
    </div>;
};
export default ExamList;