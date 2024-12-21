import { QuestionGenerator } from "@/components/QuestionGenerator";
import { APIConfig } from "@/components/APIConfig";

const Index = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center relative">
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold animate-title tracking-wider mb-4">
            ORUN AI QUIZ MAKER
          </h1>
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent max-w-2xl mx-auto" />
        </div>
        
        <div className="relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-2xl -z-10" />
          <div className="metallic-border rounded-xl p-6 backdrop-blur-lg">
            <APIConfig />
          </div>
        </div>

        <div className="relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-2xl -z-10" />
          <div className="metallic-border rounded-xl p-8">
            <QuestionGenerator />
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center">
        <p className="text-sm text-muted-foreground/60">
          © 2024 ORUN AI QUIZ MAKER. All rights reserved by 웅은아 컴퍼니
        </p>
      </footer>
    </div>
  );
};

export default Index;