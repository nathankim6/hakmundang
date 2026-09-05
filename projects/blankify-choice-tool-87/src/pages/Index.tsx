import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Footer from '@/components/Footer';
import WorkbookPreviewModal from '@/components/WorkbookPreviewModal';
import VocabularyPreviewModal from '@/components/VocabularyPreviewModal';
import KillshotPreviewModal from '@/components/KillshotPreviewModal';
import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import ProductShowcase from '@/components/home/ProductShowcase';
const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};
const itemVariants = {
  hidden: {
    y: 20,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};
const Index = () => {
  const [showWorkbookPreview, setShowWorkbookPreview] = useState(false);
  const [showVocabularyPreview, setShowVocabularyPreview] = useState(false);
  const [showKillshotPreview, setShowKillshotPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // 초기 로딩 효과
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-700 animate-pulse">NEW VERITAS 로딩 중...</p>
        </div>
      </div>;
  }
  return <ProtectedRoute>
      <div className="min-h-screen flex flex-col ancient-wisdom-bg relative overflow-hidden">
        {/* Ancient Truth Discovery Decorative Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Sacred geometry base layer */}
          <div className="absolute inset-0 bg-sacred-geometry bg-pattern-lg opacity-20"></div>
          
          {/* Mystical diamonds pattern */}
          <div className="absolute inset-0 mystical-pattern opacity-30"></div>
          
          {/* Celestial objects */}
          <div className="absolute inset-0 cosmic-knowledge opacity-40"></div>
          
          {/* Golden accents */}
          <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-amber-100 blur-3xl opacity-20 mix-blend-soft-light"></div>
          <div className="absolute bottom-40 right-1/4 w-96 h-96 rounded-full bg-blue-100 blur-3xl opacity-20 mix-blend-soft-light"></div>
          
          {/* Truth symbols */}
          <div className="absolute top-1/4 right-1/5 w-72 h-72 truth-seeker opacity-30 rotate-12"></div>
          <div className="absolute bottom-1/3 left-1/5 w-48 h-48 truth-seeker opacity-30 -rotate-12"></div>
          
          {/* Ancient knowledge symbols */}
          <div className="absolute top-1/3 left-1/4 w-32 h-32 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500"></circle>
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500"></circle>
              <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M50,10 L50,90 M10,50 L90,50" className="text-indigo-500"></path>
              <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M20,20 L80,80 M20,80 L80,20" className="text-indigo-500"></path>
            </svg>
          </div>
          
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M50,10 L90,50 L50,90 L10,50 Z" className="text-blue-500"></path>
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-500"></circle>
              <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-500"></circle>
              <circle cx="50" cy="25" r="4" fill="currentColor" className="text-blue-500 opacity-50"></circle>
              <circle cx="50" cy="75" r="4" fill="currentColor" className="text-blue-500 opacity-50"></circle>
              <circle cx="25" cy="50" r="4" fill="currentColor" className="text-blue-500 opacity-50"></circle>
              <circle cx="75" cy="50" r="4" fill="currentColor" className="text-blue-500 opacity-50"></circle>
            </svg>
          </div>
          
          <div className="absolute top-2/3 left-1/3 w-24 h-24 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-500"></circle>
              <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M20,50 C20,30 35,20 50,20 C65,20 80,30 80,50 C80,70 65,80 50,80 C35,80 20,70 20,50 Z" className="text-purple-500"></path>
              <circle cx="35" cy="40" r="5" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-500"></circle>
              <circle cx="65" cy="40" r="5" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-500"></circle>
            </svg>
          </div>
        </div>

        <Header />

        <main className="container mx-auto px-4 py-12 flex-grow relative z-10">
          <motion.div className="max-w-6xl mx-auto space-y-24" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <Hero />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-3xl blur-xl transform rotate-1 scale-105 -z-10"></div>
                <div className="absolute inset-0 bg-truth-circles opacity-30 rounded-3xl -z-5"></div>
                <div className="glass-effect rounded-2xl p-8 border border-indigo-100/40 shadow-2xl backdrop-blur-xl bg-white/70 relative overflow-hidden">
                  {/* 장식적 요소 추가 */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80"></div>
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-300/20 rounded-full blur-3xl"></div>
                  
                  {/* 타이틀 섹션 추가 */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gradient-blue">NEW VERITAS 주요 기능</h2>
                    <p className="text-slate-600 mt-2 text-base">AI로 간편하게, 사람의 손길로 완성도 있게, 쉽고  빠른 워크북 제작</p>
                  </div>
                  
                  <Features />
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <ProductShowcase onShowWorkbookPreview={() => setShowWorkbookPreview(true)} onShowVocabularyPreview={() => setShowVocabularyPreview(true)} onShowKillshotPreview={() => setShowKillshotPreview(true)} />
            </motion.div>
          </motion.div>
        </main>

        <div className="w-full mt-auto bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 text-white">
          <Footer />
        </div>
        
        <WorkbookPreviewModal isOpen={showWorkbookPreview} onClose={() => setShowWorkbookPreview(false)} />
        
        <VocabularyPreviewModal isOpen={showVocabularyPreview} onClose={() => setShowVocabularyPreview(false)} />
        
        <KillshotPreviewModal isOpen={showKillshotPreview} onClose={() => setShowKillshotPreview(false)} />
      </div>
    </ProtectedRoute>;
};
export default Index;