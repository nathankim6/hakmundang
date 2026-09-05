import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import orunLogo from "@/assets/orun-academy-logo.jpg";

const ExamComplete = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center shadow-xl">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="mb-6">
            <img 
              src={orunLogo} 
              alt="오른 로고" 
              className="w-20 h-20 mx-auto rounded-full object-cover shadow-md"
            />
          </div>
          
          <div className="mb-6">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              수고하셨습니다!
            </h1>
            <p className="text-gray-600">
              시험이 성공적으로 제출되었습니다.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/result")}
              className="w-full gap-2"
              size="lg"
            >
              <FileSearch className="w-5 h-5" />
              시험 결과 조회하기
            </Button>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="w-full"
              size="lg"
              variant="outline"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamComplete;
