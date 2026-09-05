import { motion } from 'framer-motion';
import orunLogo from '@/assets/orun-logo.jpg';
import MenuCard from '@/components/MenuCard';

import quizMakerIcon from '@/assets/icons/quiz-maker-icon.png';
import workbookMakerIcon from '@/assets/icons/workbook-maker-icon.png';
import vocaIcon from '@/assets/icons/voca-icon.png';
import syntaxIcon from '@/assets/icons/syntax-icon.png';
import readingIcon from '@/assets/icons/reading-icon.png';
import careIcon from '@/assets/icons/care-icon.png';
import analysisIcon from '@/assets/icons/analysis-icon.png';
import grammarIcon from '@/assets/icons/grammar-icon.png';

const menuItems = [
  {
    title: 'ORUN TEST',
    description: '옳은영어 표준 시험 솔루션',
    iconImage: readingIcon,
    accentColor: '#8b5cf6',
    glowColor: '#f3e8ff',
    href: 'https://omr-quiz-scan.lovable.app/',
  },
  {
    title: 'ORUN VOCA',
    description: '옳은영어 단어 학습 플랫폼',
    iconImage: vocaIcon,
    accentColor: '#10b981',
    glowColor: '#d1fae5',
    href: 'https://orunvoca.lovable.app',
  },
  {
    title: 'QUIZ MAKER',
    description: '맞춤형 변형문제 생성 도구',
    iconImage: quizMakerIcon,
    accentColor: '#6366f1',
    glowColor: '#e0e7ff',
    href: 'https://orunquiz.lovable.app',
  },
  {
    title: 'WORKBOOK MAKER',
    description: '옳은영어 워크북 자동 생성 도구',
    iconImage: workbookMakerIcon,
    accentColor: '#ec4899',
    glowColor: '#fce7f3',
    href: 'https://orunworkbook.lovable.app',
  },
  {
    title: 'ORUN SYNTAX',
    description: '영어 구문 분석 학습 플랫폼',
    iconImage: syntaxIcon,
    accentColor: '#f59e0b',
    glowColor: '#fef3c7',
    href: 'https://orunsyntax.lovable.app',
  },
  {
    title: 'ORUN GRAMMAR',
    description: '영문법 개념과 문제풀이 학습',
    iconImage: grammarIcon,
    accentColor: '#3b82f6',
    glowColor: '#dbeafe',
  },
  {
    title: 'ORUN HOMEWORK',
    description: '학생별 숙제 관리 및 피드백',
    iconImage: careIcon,
    accentColor: '#f43f5e',
    glowColor: '#ffe4e6',
    href: 'https://orunhomework.com',
  },
  {
    title: 'SCHOOL ANALYSIS',
    description: '3개년 학교별 기출 분석 아카이브',
    iconImage: analysisIcon,
    accentColor: '#0ea5e9',
    glowColor: '#e0f2fe',
    href: 'https://schoolanalysis.lovable.app',
  },
];

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa]">
      <div className="relative z-10 flex min-h-screen flex-col items-center px-6 py-20">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <img src={orunLogo} alt="ORUN Academy" className="h-20 w-auto object-contain rounded-2xl" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-center leading-none"
          style={{
            fontFamily: '"Orbitron", "Inter", sans-serif',
            background: 'linear-gradient(90deg, #c9a14a 0%, #8b6914 35%, #1a1a1a 70%, #0a0a0a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 30px rgba(201,161,74,0.15))',
          }}
        >
          ORUN STUDIO
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-xl md:text-2xl font-semibold text-gray-800"
        >
          옳은영어 통합 학습 플랫폼
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-3 text-base text-gray-400 tracking-wide"
        >
          퀴즈 제작 <span className="mx-2">·</span> 학습 관리 <span className="mx-2">·</span> 학교 분석
        </motion.p>

        {/* Cards grid */}
        <div className="mt-20 w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <MenuCard
                title={item.title}
                description={item.description}
                iconImage={item.iconImage}
                gradient=""
                glowColor={item.glowColor}
                accentColor={item.accentColor}
                href={item.href}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-24 text-center"
        >
          <p className="text-sm text-gray-400">© 2026 ORUN ENGLISH. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
