import { QuestionGenerator } from "@/components/QuestionGenerator";
import { APIConfig } from "@/components/APIConfig";

const Index = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary animate-sparkle tracking-wider mb-4">
            ORUN AI QUIZ MAKER
          </h1>
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent max-w-2xl mx-auto" />
        </div>
        <div className="mb-8">
          <APIConfig />
        </div>
        <QuestionGenerator />
      </div>
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>© 2024 ORUN AI QUIZ MAKER. All rights reserved by 웅은아 컴퍼니</p>
      </footer>
    </div>
  );
};

export default Index;