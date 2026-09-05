
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
    <div className="orun-stage flex items-center justify-center">
      <div className="orun-glass text-center p-10 max-w-lg mx-4">
        <h1 className="text-6xl font-bold mb-4 text-[#F5C64F]">404</h1>
        <p className="text-xl text-slate-700 mb-6">페이지를 찾을 수 없습니다</p>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나, 이동되었거나, 접근 권한이 없습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate("/")} className="orun-gold-btn !h-11 px-6 text-sm">
            <Home className="h-4 w-4" />
            홈으로 돌아가기
          </button>
          <button onClick={() => navigate(-1)} className="orun-ghost-btn !h-11 px-6 text-sm">
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
