import { FileBarChart, Target, TrendingUp, Users } from "lucide-react";
const FeaturesSection = () => {
  const features = [{
    icon: Target,
    title: "정기고사 시스템",
    description: "주기적인 테스트를 통해 학습 현황을 체계적으로 점검합니다."
  }, {
    icon: FileBarChart,
    title: "개별 리포트",
    description: "각 시험 후 상세한 분석 리포트를 제공하여 취약점을 파악합니다."
  }, {
    icon: TrendingUp,
    title: "누적 리포트",
    description: "장기간 학습 데이터를 분석하여 성장 추이를 한눈에 확인합니다."
  }, {
    icon: Users,
    title: "학생 관리",
    description: "클래스별 학생 현황과 성적을 효율적으로 관리할 수 있습니다."
  }];
  return <section id="features" className="py-24 bg-accent/30">
      
    </section>;
};
export default FeaturesSection;