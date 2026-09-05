import { Header } from "@/components/Header";

const IntegratedAnalysis = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <iframe
          src="https://achieve-sparkle-viz.lovable.app"
          className="w-full h-[calc(100vh-56px)]"
          title="통합분석"
        />
      </main>
    </div>
  );
};

export default IntegratedAnalysis;
