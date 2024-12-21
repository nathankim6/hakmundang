import { QuestionGenerator } from "@/components/QuestionGenerator";
import { APIConfig } from "@/components/APIConfig";

const Index = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-background z-0" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent animate-pulse" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <div className="text-center relative">
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute w-[600px] h-[600px] bg-primary/10 rounded-full blur-[80px] animate-pulse delay-300" />
            <div className="absolute w-[400px] h-[400px] bg-primary/15 rounded-full blur-[60px] animate-pulse delay-700" />
          </div>
          
          <h1 className="text-7xl font-bold tracking-wider mb-6 relative group">
            <span className="inline-block transform transition-transform group-hover:scale-105 duration-300 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-primary to-purple-600 drop-shadow-[0_0_10px_rgba(155,135,245,0.8)]">
              ORUN AI QUIZ MAKER
            </span>
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          </h1>
          
          <div className="relative h-1 max-w-2xl mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
        
        <div className="relative z-10 transform hover:scale-[1.01] transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-2xl -z-10" />
          <div className="metallic-border rounded-xl p-6 backdrop-blur-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <APIConfig />
          </div>
        </div>

        <div className="relative z-10 transform hover:scale-[1.01] transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-2xl -z-10" />
          <div className="metallic-border rounded-xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <QuestionGenerator />
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center relative z-10">
        <p className="text-sm text-muted-foreground/60 hover:text-muted-foreground/80 transition-colors">
          © 2024 ORUN AI QUIZ MAKER. All rights reserved by 웅은아 컴퍼니
        </p>
      </footer>
    </div>
  );
};

export default Index;