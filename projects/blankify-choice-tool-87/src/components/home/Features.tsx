
import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Settings, Book, FileText, MessagesSquare, Image } from 'lucide-react';
import FeatureCard from './FeatureCard';

const Features: React.FC = () => {
  const features = [
    {
      path: "/passages",
      icon: Database,
      title: "지문 데이터베이스",
      description: "영어 지문을 저장, 검색하고 관리합니다.",
      bulletPoints: ["Excel 파일 지문 업로드", "키워드 검색 및 필터링", "지문 선택 및 내보내기"],
      colorClass: "purple",
      hoverColorClass: "bg-purple-50"
    },
    {
      path: "/analysis",
      icon: Settings,
      title: "STEP 1. 분석지",
      description: "영어 지문과 한글 번역을 분리하고 주요 어구를 추출합니다.",
      bulletPoints: ["영한 분리 작업", "한 줄 해석 워크북 생성", "핵심 단어&표현 추출"],
      colorClass: "blue",
      hoverColorClass: "bg-blue-50"
    },
    {
      path: "/understanding",
      icon: Book,
      title: "STEP 2. 내용이해",
      description: "주제문, 요약문, True or False 문제 등 내용 이해를 돕는 자료를 생성합니다.",
      bulletPoints: ["주제문 생성", "요약문 및 제목 생성", "T/F 문제 생성"],
      colorClass: "green",
      hoverColorClass: "bg-green-50"
    },
    {
      path: "/worksheet",
      icon: FileText,
      title: "STEP 3. 선택/배열/영작",
      description: "다양한 유형의 문제를 생성하고 워크시트 형태로 구성합니다.",
      bulletPoints: ["선택형/빈칸/배열 워크북 생성", "사용자가 직접 문제화", "정답 및 해설 자동 생성"],
      colorClass: "indigo",
      hoverColorClass: "bg-indigo-50"
    },
    {
      path: "/synonyms",
      icon: MessagesSquare,
      title: "STEP 4. 동의어/반의어",
      description: "핵심 단어와 표현의 유의어, 관련 표현을 생성합니다.",
      bulletPoints: ["핵심 단어 유의어 생성", "어휘 변형 대비", "단어장 변환"],
      colorClass: "amber",
      hoverColorClass: "bg-amber-50"
    },
    {
      path: "/illustration",
      icon: Image,
      title: "STEP 5. 삽화",
      description: "지문 내용을 시각화한 삽화를 생성합니다.",
      bulletPoints: ["지문 기반 삽화 생성", "핵심 장면 시각화", "삽화 편집 및 관리"],
      colorClass: "rose",
      hoverColorClass: "bg-rose-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
      {/* 데코레이션 라인 */}
      <div className="absolute hidden lg:block top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
      <div className="absolute hidden lg:block top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
      
      {/* 히든 스크롤 양식 (반응형으로 작은 화면에서는 스크롤 가능하게) */}
      <div className="absolute -inset-4 lg:hidden bg-gradient-to-r from-white via-transparent to-white z-10 pointer-events-none"></div>
      
      {features.map((feature, index) => (
        <Link key={index} to={feature.path} className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
          <FeatureCard
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            bulletPoints={feature.bulletPoints}
            colorClass={feature.colorClass}
            hoverColorClass={feature.hoverColorClass}
          />
        </Link>
      ))}
    </div>
  );
};

export default Features;
