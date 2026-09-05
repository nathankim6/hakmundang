import { Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";
  return <header className="relative bg-gradient-to-br from-[hsl(var(--header-navy-start))] via-[hsl(var(--header-navy-mid))] to-[hsl(var(--header-navy-end))] text-primary-foreground overflow-hidden shadow-2xl">
      {/* Animated background elements */}
      {/* Layered depth effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20" />
      
      {/* Sophisticated grid pattern with depth */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
      backgroundImage: 'linear-gradient(hsl(var(--header-accent)) 1.5px, transparent 1.5px), linear-gradient(90deg, hsl(var(--header-accent)) 1.5px, transparent 1.5px)',
      backgroundSize: '40px 40px',
      transform: 'perspective(1000px) rotateX(60deg) scale(2)',
      transformOrigin: 'center top'
    }} />
      
      {/* Enhanced glow effects with multiple layers */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[hsl(var(--header-accent))]/15 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-white/8 rounded-full blur-[140px]" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[hsl(var(--header-accent))]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      
      {/* Top accent line with glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--header-accent))]/50 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--header-accent))]/40 via-white/30 to-white/20 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-[hsl(var(--header-accent))]/20 rounded-full animate-pulse" />
              <div className="relative bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-md p-2 rounded-full border-2 border-white/30 shadow-2xl group-hover:scale-110 group-hover:border-white/50 transition-all duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-sm" />
                  <img src={logo} alt="Orun Academy Logo" className="relative w-12 h-12 object-cover rounded-full" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-lg font-display">옳은영어 중학교 내신 대표문항&amp;서답형 DB</h1>
              <p className="text-sm text-white/95 font-semibold tracking-wide">Orun English Middle School Signature&amp;Narrative Questions Database</p>
            </div>
          </div>
          
          {!isAdminPage && <Button onClick={() => navigate("/admin")} className="bg-gradient-to-r from-white/15 to-white/10 hover:from-white/25 hover:to-white/20 text-primary-foreground border border-white/25 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-6 py-3 h-auto">
              <Settings className="w-5 h-5 mr-2" />
              <span className="font-semibold">문제 관리</span>
            </Button>}
        </div>
      </div>
      
      {/* Bottom accent line with depth */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-[3px] bg-gradient-to-r from-transparent via-[hsl(var(--header-accent))]/60 to-transparent shadow-[0_4px_20px_rgba(255,255,255,0.2)]" />
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent -mt-[1px]" />
      </div>
    </header>;
};
export default Header;