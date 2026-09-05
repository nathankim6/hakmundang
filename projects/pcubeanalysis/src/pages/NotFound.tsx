
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    console.error(
      "404 에러: 존재하지 않는 경로에 접근 시도:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50/30 to-violet-50/20">
      <div className="text-center p-6">
        <h1 className="text-6xl font-bold mb-4 text-report-primary">404</h1>
        <p className="text-xl text-gray-600 mb-6">페이지를 찾을 수 없습니다</p>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나, 이동되었거나, 접근 권한이 없습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate("/")}
            className="bg-report-primary hover:bg-report-secondary px-6 py-2 flex items-center gap-2 justify-center"
          >
            <Home className="h-4 w-4" />
            홈으로 돌아가기
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="px-6 py-2"
          >
            이전 페이지로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
