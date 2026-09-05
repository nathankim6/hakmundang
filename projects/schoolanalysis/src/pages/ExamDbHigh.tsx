import { Header } from "@/components/Header";

const ExamDbHigh = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <iframe
          src="https://oruntestdb.lovable.app"
          className="w-full h-[calc(100vh-56px)]"
          title="기출DB(고등)"
        />
      </main>
    </div>
  );
};

export default ExamDbHigh;
