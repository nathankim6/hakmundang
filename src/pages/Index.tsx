import { QuestionGenerator } from "@/components/QuestionGenerator";
import { APIConfig } from "@/components/APIConfig";

const Index = () => {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-background z-0" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div className="text-center relative mb-12">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-6 relative group">
            <span className="inline-block transform transition-transform group-hover:scale-105 duration-300 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-primary to-purple-600 drop-shadow-[0_0_3px_rgba(155,135,245,0.8)]">
              ORUN AI QUIZ MAKER
            </span>
          </h1>
          
          <div className="relative h-0.5 max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </div>
        </div>

        <div className="grid gap-8 relative z-10">
          <div className="metallic-border rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-end mb-4">
              <APIConfig />
            </div>
            <QuestionGenerator />
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center relative z-10">
        <p className="text-sm font-medium text-muted-foreground/70 hover:text-muted-foreground/90 transition-colors">
          © 2024 ORUN AI QUIZ MAKER. All rights reserved by 웅은아 컴퍼니
        </p>
      </footer>
    </div>
  );
};

export default Index;