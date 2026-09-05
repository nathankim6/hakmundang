import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CardSet } from "@/types/study";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, Clock, Target, Edit, Trash2, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isStudentLoggedIn } from "@/utils/student-auth";
interface CardSetGridProps {
  cardSets: CardSet[];
  onCardSetDeleted?: () => void;
}
export function CardSetGrid({
  cardSets,
  onCardSetDeleted
}: CardSetGridProps) {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'study' | 'practice'>('study');
  const [selectedCardSetId, setSelectedCardSetId] = useState<string>('');
  const [selectedTestType, setSelectedTestType] = useState<'meaning' | 'reverse' | 'spelling' | 'sentence' | 'definition'>('meaning');

  // 모달 열기 함수
  const openModal = (type: 'study' | 'practice', cardSetId: string) => {
    setModalType(type);
    setSelectedCardSetId(cardSetId);
    setIsModalOpen(true);
  };

  // 시험 시작 함수
  const startTest = () => {
    const url = modalType === 'study' ? `/study/${selectedCardSetId}?type=${selectedTestType}` : `/practice/${selectedCardSetId}?type=${selectedTestType}`;
    navigate(url);
    setIsModalOpen(false);
  };
  const calculateProgress = (cardSet: CardSet) => {
    const totalCards = cardSet.cards.length;
    const masteredCards = cardSet.cards.filter(card => card.correctCount >= 3 && card.correctCount > card.incorrectCount * 2).length;
    return totalCards > 0 ? masteredCards / totalCards * 100 : 0;
  };
  const getAccuracy = (cardSet: CardSet) => {
    const totalAttempts = cardSet.cards.reduce((sum, card) => sum + card.correctCount + card.incorrectCount, 0);
    const correctAttempts = cardSet.cards.reduce((sum, card) => sum + card.correctCount, 0);
    return totalAttempts > 0 ? Math.round(correctAttempts / totalAttempts * 100) : 0;
  };
  const handleEdit = (e: React.MouseEvent, cardSetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit/${cardSetId}`);
  };
  const handleDelete = async (e: React.MouseEvent, cardSetId: string, cardSetTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    const result = window.confirm(`⚠️ 정말로 "${cardSetTitle}" 단어장을 완전히 삭제하시겠습니까?\n\n삭제된 단어장은 복구할 수 없습니다.`);
    if (!result) {
      return;
    }
    try {
      console.log('Attempting to delete card set:', cardSetId);
      const {
        error
      } = await supabase.from('card_sets').delete().eq('id', cardSetId);
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Card set deleted successfully');
      toast({
        title: "삭제 완료",
        description: `"${cardSetTitle}" 단어장이 성공적으로 삭제되었습니다.`
      });
      if (onCardSetDeleted) {
        onCardSetDeleted();
      }
    } catch (error) {
      console.error('Error deleting card set:', error);
      toast({
        title: "삭제 실패",
        description: "단어장 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };
  return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
      {cardSets.map((cardSet, index) => {
      const progress = calculateProgress(cardSet);
      const accuracy = getAccuracy(cardSet);
      return <div key={cardSet.id} className="group relative animate-slide-up" style={{
        animationDelay: `${index * 0.1}s`
      }}>
            {/* Premium Metallic Card with Slate Design */}
            <div className="relative overflow-hidden rounded-3xl
              bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
              border-2 border-slate-600/40 hover:border-slate-500/60
              shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]
              hover:shadow-[0_25px_50px_-12px_rgba(148,163,184,0.3)]
              transition-all duration-700 hover:scale-[1.02] aspect-[4/5]
              hover:-translate-y-1
              before:absolute before:inset-0 before:bg-gradient-to-br before:from-slate-400/[0.05] before:via-transparent before:to-slate-600/[0.08]
              after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-slate-700/20 after:to-transparent
              hover:before:from-slate-300/[0.08] hover:before:to-slate-500/[0.12]
            ">
              
              {/* Metallic background pattern */}
              <div className="absolute inset-0 transition-all duration-700
                bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-800/80
                before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_30%,_rgba(148,163,184,0.1)_0%,_transparent_50%)]
                after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_70%_70%,_rgba(71,85,105,0.15)_0%,_transparent_50%)]
                group-hover:from-slate-700/85 group-hover:via-slate-800/95 group-hover:to-slate-700/85
              "></div>
              
              {/* Premium metallic shine effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -inset-10 bg-gradient-to-r from-transparent via-slate-400/10 to-transparent
                  transform rotate-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </div>
              
              {/* Floating metallic particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-8 right-16 w-2 h-2 bg-slate-400/30 rounded-full
                  shadow-[0_0_10px_rgba(148,163,184,0.3)] animate-pulse
                  group-hover:bg-slate-300/50 group-hover:scale-150 group-hover:shadow-[0_0_15px_rgba(148,163,184,0.5)]
                  transition-all duration-1000"></div>
                <div className="absolute bottom-12 left-12 w-1.5 h-1.5 bg-slate-500/40 rounded-full
                  shadow-[0_0_8px_rgba(71,85,105,0.4)] animate-pulse delay-300
                  group-hover:bg-slate-400/60 group-hover:scale-125 group-hover:shadow-[0_0_12px_rgba(71,85,105,0.6)]
                  transition-all duration-1000"></div>
                <div className="absolute top-1/3 left-8 w-1 h-1 bg-slate-600/30 rounded-full
                  shadow-[0_0_6px_rgba(51,65,85,0.3)] animate-pulse delay-700
                  group-hover:bg-slate-500/50 group-hover:scale-150 group-hover:shadow-[0_0_10px_rgba(51,65,85,0.5)]
                  transition-all duration-1000"></div>
              </div>
              
              {/* Card Content */}
              <div className="relative h-full flex flex-col p-3 sm:p-4 z-10">
                {/* Header with word count badge */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400/40 animate-pulse"></div>
                    <div className="w-1 h-1 rounded-full bg-slate-500/30"></div>
                  </div>
                  <div className="relative flex items-center gap-1 px-2 py-1 rounded-full
                    bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-xl
                    border border-slate-500/50
                    shadow-sm group-hover:border-slate-400/60
                    transition-all duration-500">
                    <div className="relative w-1.5 h-1.5 rounded-full bg-slate-300/60 animate-pulse"></div>
                    <span className="relative text-[10px] sm:text-xs font-extrabold text-slate-100">{cardSet.cards.length}</span>
                    <span className="relative text-[9px] sm:text-[10px] text-slate-300 font-semibold">단어</span>
                  </div>
                </div>

                {/* Logo/Image Section */}
                <div className="flex-1 flex items-center justify-center mb-2">
                  {cardSet.imageUrl ? (
                    <button 
                      className="relative group/logo w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18
                        focus:outline-none focus:ring-2 focus:ring-slate-400/50 rounded-xl
                        transition-all duration-300 focus:scale-95"
                      onClick={e => {
                        e.stopPropagation();
                        openModal('study', cardSet.id);
                      }}
                    >
                      <div className="w-full h-full rounded-xl overflow-hidden
                        shadow-md border border-slate-500/40
                        group-hover/logo:border-slate-400/60 group-hover/logo:scale-[1.08]
                        transition-all duration-500
                        bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm">
                        <img 
                          src={cardSet.imageUrl} 
                          alt={`${cardSet.title} logo`}
                          className="w-full h-full object-contain object-center p-1.5
                            group-hover/logo:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </button>
                  ) : (
                    <button 
                      className="relative group/logo w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18
                        focus:outline-none focus:ring-2 focus:ring-slate-400/50 rounded-xl
                        transition-all duration-300 focus:scale-95"
                      onClick={e => {
                        e.stopPropagation();
                        openModal('study', cardSet.id);
                      }}
                    >
                      <div className="w-full h-full rounded-xl
                        bg-gradient-to-br from-slate-700 to-slate-600
                        flex items-center justify-center
                        shadow-md group-hover/logo:shadow-lg
                        group-hover/logo:scale-[1.08] transition-all duration-500
                        border border-slate-500/40 group-hover/logo:border-slate-400/60">
                        <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-slate-200
                          drop-shadow-md group-hover/logo:rotate-12 transition-all duration-500" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Title Section */}
                <div className="text-center mb-2 px-1">
                  <h3 className="text-[11px] sm:text-xs font-extrabold text-slate-100 mb-0.5 line-clamp-1 leading-tight tracking-tight
                    group-hover:text-white transition-all duration-500 drop-shadow-md">
                    {cardSet.title}
                  </h3>
                  {cardSet.description && (
                    <p className="text-[9px] sm:text-[10px] text-slate-300 line-clamp-1 leading-snug font-medium">
                      {cardSet.description}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5">
                  <Button 
                    onClick={() => openModal('study', cardSet.id)}
                    className="relative overflow-hidden
                      bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700
                      hover:from-slate-600 hover:via-slate-500 hover:to-slate-600
                      text-slate-100 font-bold py-1.5 px-2 rounded-lg
                      shadow-md shadow-slate-900/50
                      hover:shadow-lg
                      transition-all duration-500 hover:scale-[1.04]
                      group/btn border border-slate-500/50 hover:border-slate-400/60"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-1">
                      <Target className="w-3 h-3" />
                      <span className="text-[10px] sm:text-xs font-bold">시험</span>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => navigate(`/practice/${cardSet.id}?type=meaning`)}
                    className="relative overflow-hidden
                      bg-slate-800/50 backdrop-blur-xl
                      border border-slate-500/50 hover:border-slate-400/60
                      hover:bg-slate-700/50
                      text-slate-200 hover:text-slate-100 font-bold py-1.5 px-2 rounded-lg
                      shadow-sm hover:shadow-md
                      transition-all duration-500 hover:scale-[1.04]
                      group/btn"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      <span className="text-[10px] sm:text-xs font-bold">연습</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Floating Management Buttons - Only show for admin users */}
              {!isStudentLoggedIn() && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100
                  transition-all duration-500 transform translate-y-[-12px] group-hover:translate-y-0 z-20">
                  <Button 
                    size="sm"
                    onClick={e => handleEdit(e, cardSet.id)}
                    className="w-9 h-9 p-0 rounded-full
                      bg-slate-800/90 hover:bg-slate-700 backdrop-blur-2xl
                      border-2 border-slate-500/60 hover:border-slate-400/80
                      shadow-md hover:shadow-lg
                      transition-all duration-300 hover:scale-[1.15] group/edit"
                  >
                    <Edit className="w-4 h-4 text-slate-300 group-hover/edit:text-slate-100
                      group-hover/edit:rotate-12 transition-all duration-300" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={e => handleDelete(e, cardSet.id, cardSet.title)}
                    className="w-9 h-9 p-0 rounded-full
                      bg-slate-800/90 hover:bg-red-900/50 backdrop-blur-2xl
                      border-2 border-slate-500/60 hover:border-red-500/60
                      shadow-md hover:shadow-lg
                      transition-all duration-300 hover:scale-[1.15] group/delete"
                  >
                    <Trash2 className="w-4 h-4 text-slate-300 group-hover/delete:text-red-400
                      group-hover/delete:rotate-12 transition-all duration-300" />
                  </Button>
                </div>
              )}

              {/* Bottom Accent Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5
                bg-gradient-to-r from-slate-600/60 via-slate-500/80 to-slate-600/60
                opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:h-2"></div>
            </div>
          </div>;
    })}

     {/* 획기적으로 개선된 시험 유형 선택 모달 */}
     <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
       <DialogContent className="sm:max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-0 overflow-hidden bg-gradient-to-br from-background via-background to-background/95 border-0 shadow-2xl">
         {/* 헤더 섹션 */}
          <div className="relative p-4 sm:p-8 pb-4 sm:pb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="relative z-10">
             <div className="flex items-center justify-center mb-4">
               <div className="p-3 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg">
                 <span className="text-2xl">🎯</span>
               </div>
             </div>
             <DialogHeader>
               <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                 {modalType === 'study' ? '📝 시험 보기' : '🏃‍♂️ 연습하기'}
               </DialogTitle>
               <DialogDescription className="text-center text-muted-foreground mt-2 text-sm">
                 학습 스타일에 맞는 시험 유형을 선택해주세요
               </DialogDescription>
             </DialogHeader>
           </div>
         </div>

         {/* 시험 유형 선택 섹션 */}
         <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
           <div className="grid grid-cols-1 gap-4">
             {/* 뜻쓰기 */}
             <div className={`group relative p-5 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${selectedTestType === 'meaning' ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary shadow-lg shadow-primary/20' : 'bg-card border border-border hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent'}`} onClick={() => setSelectedTestType('meaning')}>
               <div className="flex items-start space-x-4">
                 <div className="flex-shrink-0">
                   <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selectedTestType === 'meaning' ? 'border-primary bg-primary text-primary-foreground shadow-lg' : 'border-border bg-background group-hover:border-primary/50'}`}>
                     <span className="text-xl">💭</span>
                   </div>
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                     뜻쓰기
                     {selectedTestType === 'meaning' && <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">선택됨</span>}
                   </h3>
                   <p className="text-muted-foreground text-sm leading-relaxed">
                     영어 단어를 보고 올바른 뜻을 선택하는 객관식 시험
                   </p>
                 </div>
               </div>
               {selectedTestType === 'meaning' && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent pointer-events-none animate-pulse"></div>}
             </div>

             {/* 철자쓰기 */}
             <div className={`group relative p-5 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${selectedTestType === 'reverse' ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary shadow-lg shadow-primary/20' : 'bg-card border border-border hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent'}`} onClick={() => setSelectedTestType('reverse')}>
               <div className="flex items-start space-x-4">
                 <div className="flex-shrink-0">
                   <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selectedTestType === 'reverse' ? 'border-primary bg-primary text-primary-foreground shadow-lg' : 'border-border bg-background group-hover:border-primary/50'}`}>
                     <span className="text-xl">✍️</span>
                   </div>
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                     철자쓰기
                     {selectedTestType === 'reverse' && <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">선택됨</span>}
                   </h3>
                   <p className="text-muted-foreground text-sm leading-relaxed">
                     한글 뜻을 보고 영어 단어 철자를 직접 입력하는 주관식 시험
                   </p>
                 </div>
               </div>
               {selectedTestType === 'reverse' && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent pointer-events-none animate-pulse"></div>}
             </div>


              {/* 영영풀이 */}
              <div className={`group relative p-5 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${selectedTestType === 'definition' ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary shadow-lg shadow-primary/20' : 'bg-card border border-border hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent'}`} onClick={() => setSelectedTestType('definition')}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selectedTestType === 'definition' ? 'border-primary bg-primary text-primary-foreground shadow-lg' : 'border-border bg-background group-hover:border-primary/50'}`}>
                      <span className="text-xl">🔍</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                      영영풀이
                      {selectedTestType === 'definition' && <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">선택됨</span>}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      영영사전 정의를 보고 첫 글자 힌트로 해당 단어를 맞추는 주관식 시험
                    </p>
                  </div>
                </div>
                {selectedTestType === 'definition' && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent pointer-events-none animate-pulse"></div>}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-border/50 px-2 sm:px-0">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 sm:h-12 text-sm sm:text-base font-medium border-border/50 hover:bg-muted/50 transition-all duration-300 min-h-[44px]">
                취소
              </Button>
              <Button onClick={startTest} disabled={!selectedTestType} className="flex-1 h-12 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none min-h-[44px]">
                {selectedTestType ? '🚀 시작하기' : '유형을 선택해주세요'}
              </Button>
            </div>
         </div>
       </DialogContent>
     </Dialog>
    </div>;
}