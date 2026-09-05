import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import GradeSection from "@/components/GradeSection";
import ReportSection from "@/components/ReportSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <GradeSection />
        <ReportSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
