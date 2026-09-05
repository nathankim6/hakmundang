import { Header } from "@/components/Header";

const InternalReport = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <iframe
          src="https://oruntestreport.lovable.app"
          className="w-full h-[calc(100vh-56px)]"
          title="내신 리포트"
        />
      </main>
    </div>
  );
};

export default InternalReport;
