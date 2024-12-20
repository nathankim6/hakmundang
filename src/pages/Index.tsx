import { QuestionGenerator } from "@/components/QuestionGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          AI 문제 생성기
        </h1>
        <QuestionGenerator />
      </div>
    </div>
  );
};

export default Index;