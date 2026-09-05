
import React from 'react';
import { BookOpen, MessageSquare, Image, Clock, Camera, FileText } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags?: string[];
}

const FeatureCard = ({ icon, title, description, tags = [] }: FeatureCardProps) => {
  return (
    <div className="card-highlight">
      <div className="h-12 w-12 rounded-full bg-oracle-lightGray flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-white/70 mb-4">{description}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag, idx) => (
            <span key={idx} className="tag-pill">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-oracle-green" />,
      title: "학습 도움",
      description: "어려운 영어 문제나 단어, 문법 질문에 상세한 설명을 제공합니다.",
      tags: ["문법", "어휘", "문제풀이"]
    },
    {
      icon: <Camera className="h-6 w-6 text-oracle-green" />,
      title: "이미지 인식",
      description: "문제지나 교재를 사진으로 찍어 올리면 AI가 분석하고 답변합니다.",
      tags: ["문제 사진", "OCR"]
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-oracle-green" />,
      title: "친절한 설명",
      description: "복잡한 개념도 이해하기 쉽게 단계별로 설명해 드립니다.",
      tags: ["맞춤형", "쉬운 설명"]
    },
    {
      icon: <FileText className="h-6 w-6 text-oracle-green" />,
      title: "PDF 분석",
      description: "영어 교재나 워크북 PDF를 업로드하여 필요한 부분을 분석받으세요.",
      tags: ["PDF 지원", "교재 분석"]
    },
  ];

  return (
    <section className="py-16 px-6 bg-oracle-navy">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          <span className="text-oracle-green">AI 조교</span> 기능
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              tags={feature.tags}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
