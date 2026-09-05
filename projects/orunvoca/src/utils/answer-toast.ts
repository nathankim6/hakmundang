import { toast } from 'sonner';

/**
 * 모든 시험 모드에서 공통으로 사용하는 정답/오답 팝업.
 */
export const showAnswerToast = (correct: boolean, correctAnswer?: string) => {
  if (correct) {
    toast.success('정답입니다!', {
      duration: 2200,
      className: 'font-semibold',
    });
  } else {
    toast.error('오답입니다', {
      description: correctAnswer ? `정답: ${correctAnswer}` : undefined,
      duration: 3800,
      className: 'font-semibold',
    });
  }
};
