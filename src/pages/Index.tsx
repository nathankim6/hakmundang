import { QuestionGenerator } from "@/components/QuestionGenerator";
import { APIConfig } from "@/components/APIConfig";

const Index = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-0" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-6">
          <img 
            src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png" 
            alt="ORUN ACADEMY Logo" 
            className="w-32 h-32 object-contain animate-pulse"
          />
          
          <h1 className="text-7xl font-bold animate-title tracking-wider mb-6 relative group">
            <span className="inline-block transform transition-transform group-hover:scale-105 duration-300">
              ORUN AI QUIZ MAKER
            </span>
          </h1>
          
          <div className="relative h-1 max-w-2xl mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DAA520] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent animate-pulse" />
          </div>
        </div>

        <div className="metallic-border rounded-xl p-6 backdrop-blur-lg">
          <APIConfig />
        </div>
        
        <div className="metallic-border rounded-xl p-8">
          <QuestionGenerator />
        </div>
      </div>

      <footer className="mt-16 text-center relative z-10">
        <p className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          © 2024 ORUN AI QUIZ MAKER. All rights reserved by 웅은아 컴퍼니
        </p>
      </footer>
    </div>
  );
};

export default Index;