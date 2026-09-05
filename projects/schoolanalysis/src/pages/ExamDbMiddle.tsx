import { Header } from "@/components/Header";

const ExamDbMiddle = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <iframe
          src="https://orunmtestdb.lovable.app/"
          className="w-full h-[calc(100vh-56px)]"
          title="기출DB(중등)"
        />
      </main>
    </div>
  );
};

export default ExamDbMiddle;
