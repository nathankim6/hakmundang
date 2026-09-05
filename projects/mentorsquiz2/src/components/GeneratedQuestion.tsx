import { useState } from "react";
import { DefaultQuestion } from "./question-types/DefaultQuestion";
import { WeekendClinicQuestion } from "./question-types/WeekendClinicQuestion";
import { TrueFalseQuestion } from "./question-types/TrueFalseQuestion";
import { SummaryBlankQuestion } from "./question-types/SummaryBlankQuestion";
import { OrderWritingQuestion } from "./question-types/OrderWritingQuestion";
import { ConditionWritingQuestion } from "./question-types/ConditionWritingQuestion";
import { GrammarQuestion } from "./question-types/GrammarQuestion";
import { RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";
import { generateQuestion } from "@/lib/claude";
import { useToast } from "@/hooks/use-toast";
interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
  originalText?: string;
  showVocabButton?: boolean;
  onRefresh?: (newContent: string) => void;
  questionType?: string;
}
export const GeneratedQuestion = ({
  content,
  questionNumber,
  originalText,
  showVocabButton = true,
  onRefresh,
  questionType
}: GeneratedQuestionProps) => {
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    toast
  } = useToast();
  const handleRefresh = async () => {
    if (!originalText || !questionType || !onRefresh) return;
    setIsRefreshing(true);
    try {
      const result = await generateQuestion({
        id: questionType,
        name: ""
      }, originalText, "1");
      onRefresh(result);
      toast({
        title: "문제 재생성 완료",
        description: "문제가 성공적으로 재생성되었습니다."
      });
    } catch (error) {
      toast({
        title: "문제 재생성 실패",
        description: "문제 재생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  const RefreshButton = () => <Button variant="outline" size="sm" className="absolute top-4 right-4" onClick={handleRefresh} disabled={isRefreshing || !originalText}>
      <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
    </Button>;

  // Display original output as-is
  return <div className="relative">
      <RefreshButton />
      <div className="bg-white rounded-lg p-6 shadow-sm border mx-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            문제 {questionNumber}
          </h3>
        </div>
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {content.replace(/\[OUTPUT\]/g, '').replace(/\n+(다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오\.)/g, '$1').replace(/(다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오\.)\n\n/g, '$1\n').replace(/\n\n+(다음 글의.*?것은\?)/g, '\n$1').replace(/(다음 글의.*?것은\?)\n\n/g, '$1\n').replace(/(\[정답\].*?)\n\n(\[해설\])/g, '$1\n$2').replace(/(\[정답\].*?)\n(\[해설\])/g, '$1\n$2').replace(/(다음의 내용과 일치.*?것을 고르시오\.)\n\n([A-Z])/g, '$1\n$2').replace(/(\?)\n\n([A-Z])/g, '$1\n$2').replace(/\*\*(다음 중 어법상 적절하지 않은 것은\?)\*\*/g, '$1').replace(/(다음 중 어법상 적절하지 않은 것은\?)\n\n/g, '$1\n').replace(/다음 중 어법상 적절하지 않은 것은\?\n(?=다음)/g, '').replace(/(?<!문맥상 낱말의 쓰임이 적절하지 않은 것은\?[\s\S]*?)\d+\) [①-⑤]\n/g, '').replace(/1\) ①\n2\) ②\n3\) ③\n4\) ④\n5\) ⑤\n?/g, '').replace(/\d+\) [A-Za-z]+(?:\d+\) [A-Za-z]+)*/g, '').replace(/([A-Za-z]+\s*→\s*[A-Za-z]+\s*\([①-⑤]\):.*?\n)+/g, '').replace(/\n\n(다음 글의 빈 칸에)/g, '\n$1').replace(/\[선지\]/g, '').replace(/(\[정답\])\s*([①-⑤])\s*\n(\[해설\])/g, '$1 $2\n$3').replace(/\n\n+(\[정답\])/g, '\n\n$1').replace(/(\?)\n\n+(\[선지\]\s*)?([①-⑤])/g, '$1\n$3').replace(/\[어휘\][\s\S]*?(?=\n\n|$)/g, '').replace(/원문의 빈칸 표현:.*?$/gm, '').replace(/\*\*/g, '').replace(/(다음 중 문맥 상 알맞은 단어를 고르시오\.)\n\n/g, '$1\n').replace(/(\[서답형\] 다음 글을 읽고, 물음에 답하시오\.)\n\n/g, '$1\n').replace(/(다음 글의 내용과 일치하도록.*?쓰시오\.)\n\n/g, '$1\n') // Remove extra line break after summaryBlank Korean question
        }
        </div>
      </div>
    </div>;
};