
import React from 'react';
import { Heart } from 'lucide-react';
import ProductCard from './ProductCard';
import StatsCard from './StatsCard';
interface ProductShowcaseProps {
  onShowWorkbookPreview: () => void;
  onShowVocabularyPreview: () => void;
  onShowKillshotPreview: () => void;
}
const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  onShowWorkbookPreview,
  onShowVocabularyPreview,
  onShowKillshotPreview
}) => {
  const products = [{
    image: "/lovable-uploads/c9409b36-da98-4299-9ca9-d5805fe0f1cb.png",
    badge: "전용 단어장",
    badgeColor: "blue",
    title: "뉴베리타스 단어장",
    description: "시험대비 유반어 단어장",
    buttonColor: "from-blue-600 to-purple-600",
    onButtonClick: onShowVocabularyPreview
  }, {
    image: "/lovable-uploads/b8706d47-89fa-45a7-9a19-24e926697eb7.png",
    badge: "종합 워크북",
    badgeColor: "pink",
    title: "뉴베리타스 워크북",
    description: "분석부터 서술형 대비까지: 6단계 워크시트",
    buttonColor: "from-pink-500 to-purple-600",
    onButtonClick: onShowWorkbookPreview
  }, {
    image: "/lovable-uploads/ebd6df27-1f1d-41cf-bf98-90496f80591a.png",
    badge: "실전변형문제",
    badgeColor: "amber",
    title: "킬샷 유형서",
    description: "핵심 유형 집중 훈련",
    buttonColor: "from-amber-500 to-orange-600",
    onButtonClick: onShowKillshotPreview
  }];
  const stats = [{
    label: "EASY",
    subLabel: "교재완성",
    icon: "easy",
    description: "간편하고 직관적인 방식으로 고품질 교재를 쉽게 제작하세요"
  }, {
    label: "AUTO",
    subLabel: "AI 자동화",
    icon: "auto",
    description: "AI가 자동으로 분석하고 최적화된 학습 자료를 생성합니다"
  }, {
    label: "FINE",
    subLabel: "교재 제작",
    icon: "fine",
    description: "맞춤형 옵션으로 학생들에게 최적화된 교재를 제작하세요"
  }];
  return <div className="py-8 px-4">
      <div className="relative mx-auto max-w-5xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/40 to-purple-200/40 rounded-3xl blur-3xl transform -rotate-3 scale-105 -z-10"></div>
        
        <div className="overflow-hidden border border-blue-100 shadow-xl bg-gradient-to-br from-white via-blue-50 to-indigo-100 p-8 py-[21px] rounded-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-2 shadow-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-indigo-900">2025 옳은영어 내신대비 교재 라인업</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product, index) => <ProductCard key={index} image={product.image} badge={product.badge} badgeColor={product.badgeColor} title={product.title} description={product.description} buttonColor={product.buttonColor} onButtonClick={product.onButtonClick} />)}
          </div>
          
          <div className="flex items-center justify-center mt-8 hidden">
            <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full shadow-lg">
              <span className="font-medium">옳은영어 내신대비 교재 라인업</span>
            </div>
          </div>
          
          <div className="mt-10 flex justify-center">
            <div className="grid grid-cols-3 gap-6 max-w-lg">
              {stats.map((stat, index) => <StatsCard key={index} label={stat.label} subLabel={stat.subLabel} icon={stat.icon as "easy" | "auto" | "fine"} description={stat.description} />)}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default ProductShowcase;
