import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trophy, Users, TrendingUp, Flame, BookOpen, Zap } from "lucide-react";
import { FullPageLoading } from "@/components/ui/loading-spinner";

import rankingBanner from "@/assets/ranking-banner.png";
import goldMedal from "@/assets/rank-gold-medal.png";
import silverMedal from "@/assets/rank-silver-medal.png";
import bronzeMedal from "@/assets/rank-bronze-medal.png";
import rankingTrophy from "@/assets/ranking-trophy.png";

interface StudentRankingData {
  student_id: string;
  student_name: string;
  class_name: string | null;
  completed_assignments: number;
  total_words_studied: number;
  average_score: number;
  total_score: number;
  rank: number;
}

type TabType = "score" | "words";

export default function StudentRanking() {
  const { toast } = useToast();
  const [rankings, setRankings] = useState<StudentRankingData[]>([]);
  const [wordRankings, setWordRankings] = useState<StudentRankingData[]>([]);
  const [scoreRankings, setScoreRankings] = useState<StudentRankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStudentName, setCurrentStudentName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("score");

  useEffect(() => {
    const storedData = sessionStorage.getItem('studentData');
    if (storedData) {
      const student = JSON.parse(storedData);
      setCurrentStudentName(student.name);
    }
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const { data, error } = await supabase
        .from('card_assignments')
        .select(`
          *,
          students!inner(
            id,
            name,
            classes(
              name
            )
          ),
          card_sets(
            word_data
          )
        `)
        .eq('completed', true)
        .not('score', 'is', null);

      if (error) throw error;

      const studentStats: { [key: string]: StudentRankingData } = {};

      data?.forEach((assignment) => {
        const student = assignment.students;
        const studentId = student.id;
        const studentName = student.name;
        const className = student.classes?.name || null;
        const score = assignment.score || 0;
        const wordData = assignment.card_sets?.word_data || [];
        const wordsInSet = Array.isArray(wordData) ? wordData.length : 0;

        if (!studentStats[studentId]) {
          studentStats[studentId] = {
            student_id: studentId,
            student_name: studentName,
            class_name: className,
            completed_assignments: 0,
            total_words_studied: 0,
            average_score: 0,
            total_score: 0,
            rank: 0
          };
        }

        studentStats[studentId].completed_assignments += 1;
        studentStats[studentId].total_words_studied += wordsInSet;
        studentStats[studentId].total_score += score;
      });

      const studentArray = Object.values(studentStats).map(student => ({
        ...student,
        average_score: student.completed_assignments > 0
          ? student.total_score / student.completed_assignments
          : 0
      }));

      const wordRankedData = [...studentArray]
        .sort((a, b) => b.total_words_studied - a.total_words_studied)
        .map((student, index) => ({ ...student, rank: index + 1 }));

      const scoreRankedData = [...studentArray]
        .sort((a, b) => b.average_score - a.average_score)
        .map((student, index) => ({ ...student, rank: index + 1 }));

      setRankings(scoreRankedData);
      setWordRankings(wordRankedData);
      setScoreRankings(scoreRankedData);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      toast({
        title: "오류",
        description: "랭킹을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isCurrentStudent = (studentName: string) => studentName === currentStudentName;

  const currentRankings = activeTab === "score" ? scoreRankings : wordRankings;
  const top3 = currentRankings.slice(0, 3);
  const restRankings = currentRankings.slice(3);

  const getMedalImage = (rank: number) => {
    if (rank === 1) return goldMedal;
    if (rank === 2) return silverMedal;
    if (rank === 3) return bronzeMedal;
    return null;
  };

  const getScoreBarWidth = (student: StudentRankingData) => {
    const max = currentRankings[0]
      ? (activeTab === "score" ? currentRankings[0].average_score : currentRankings[0].total_words_studied)
      : 1;
    const val = activeTab === "score" ? student.average_score : student.total_words_studied;
    return Math.max((val / max) * 100, 8);
  };

  const getScoreBarColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-amber-500";
    if (rank === 2) return "bg-gradient-to-r from-slate-300 to-slate-400";
    if (rank === 3) return "bg-gradient-to-r from-amber-600 to-orange-500";
    return "bg-gradient-to-r from-blue-400 to-indigo-500";
  };

  if (loading) {
    return <FullPageLoading message="랭킹을 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col hide-scrollbar overflow-auto">
      {/* Banner Header */}
      <div className="relative w-full h-36 sm:h-44 overflow-hidden">
        <img
          src={rankingBanner}
          alt="Ranking Banner"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 to-slate-950" />
        <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link to="/student-dashboard">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-lg">
                🏆 RANKING
              </h1>
              <p className="text-xs sm:text-sm text-yellow-300/80 font-medium">
                최고의 학습자가 되어보세요!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3 py-1 text-xs font-bold">
              <Users className="w-3 h-3 mr-1" />
              {rankings.length}명
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 sm:px-6 pb-6 max-w-4xl mx-auto w-full -mt-2">

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-5 bg-slate-900/80 rounded-xl p-1.5 border border-slate-700/50">
          <button
            onClick={() => setActiveTab("score")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === "score"
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            평균 점수
          </button>
          <button
            onClick={() => setActiveTab("words")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === "words"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            단어 학습량
          </button>
        </div>

        {/* Podium - Top 3 */}
        {top3.length > 0 && (
          <div className="mb-6">
            {/* Podium Layout: 2nd, 1st, 3rd */}
            <div className="flex items-end justify-center gap-2 sm:gap-4">
              {/* 2nd Place */}
              {top3[1] && (
                <PodiumCard
                  student={top3[1]}
                  medalImg={silverMedal}
                  podiumHeight="h-28 sm:h-32"
                  podiumColor="from-slate-500 to-slate-600"
                  isCurrentStudent={isCurrentStudent(top3[1].student_name)}
                  activeTab={activeTab}
                />
              )}
              {/* 1st Place */}
              {top3[0] && (
                <div className="flex flex-col items-center -mt-4">
                  <img src={rankingTrophy} alt="Trophy" className="w-10 h-10 sm:w-14 sm:h-14 mb-1 animate-float drop-shadow-lg" />
                  <PodiumCard
                    student={top3[0]}
                    medalImg={goldMedal}
                    podiumHeight="h-36 sm:h-40"
                    podiumColor="from-yellow-500 to-amber-600"
                    isCurrentStudent={isCurrentStudent(top3[0].student_name)}
                    isFirst
                    activeTab={activeTab}
                  />
                </div>
              )}
              {/* 3rd Place */}
              {top3[2] && (
                <PodiumCard
                  student={top3[2]}
                  medalImg={bronzeMedal}
                  podiumHeight="h-24 sm:h-28"
                  podiumColor="from-amber-700 to-orange-700"
                  isCurrentStudent={isCurrentStudent(top3[2].student_name)}
                  activeTab={activeTab}
                />
              )}
            </div>
          </div>
        )}

        {/* Rest of Rankings */}
        <div className="space-y-2">
          {restRankings.length > 0 && (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-700/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/40 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-slate-300">전체 순위</span>
              </div>
              <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto">
                {restRankings.map((student) => (
                  <div
                    key={`rest-${student.student_id}`}
                    className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                      isCurrentStudent(student.student_name)
                        ? "bg-blue-500/10 border-l-2 border-l-blue-400"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Rank Number */}
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 text-sm font-black shrink-0">
                      {student.rank}
                    </div>

                    {/* Student Info + Bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-bold truncate ${
                          isCurrentStudent(student.student_name) ? "text-blue-300" : "text-white"
                        }`}>
                          {student.student_name}
                          {isCurrentStudent(student.student_name) && (
                            <span className="text-[10px] text-blue-400 ml-1">(나)</span>
                          )}
                        </span>
                        {student.class_name && (
                          <span className="text-[10px] text-slate-500 truncate">{student.class_name}</span>
                        )}
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(student.rank)}`}
                          style={{ width: `${getScoreBarWidth(student)}%` }}
                        />
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-black ${
                        activeTab === "score" ? "text-emerald-400" : "text-blue-400"
                      }`}>
                        {activeTab === "score"
                          ? `${student.average_score.toFixed(1)}점`
                          : `${student.total_words_studied}개`}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {student.completed_assignments}개 완료
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentRankings.length === 0 && (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-700/40">
              <img src={rankingTrophy} alt="Trophy" className="w-20 h-20 mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-bold text-slate-400 mb-2">
                아직 랭킹 데이터가 없습니다
              </h3>
              <p className="text-sm text-slate-500">
                과제를 완료하면 랭킹에 표시됩니다!
              </p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/student-profile">
            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-sm">
              <Trophy className="w-4 h-4 mr-1.5" />
              내 성과
            </Button>
          </Link>
          <Link to="/student-dashboard">
            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-sm">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              대시보드
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* Podium Card Component */
function PodiumCard({
  student,
  medalImg,
  podiumHeight,
  podiumColor,
  isCurrentStudent,
  isFirst = false,
  activeTab,
}: {
  student: StudentRankingData;
  medalImg: string;
  podiumHeight: string;
  podiumColor: string;
  isCurrentStudent: boolean;
  isFirst?: boolean;
  activeTab: TabType;
}) {
  return (
    <div className={`flex flex-col items-center ${isFirst ? "w-28 sm:w-36" : "w-24 sm:w-32"}`}>
      {/* Medal */}
      <img
        src={medalImg}
        alt={`Rank ${student.rank}`}
        className={`${isFirst ? "w-14 h-14 sm:w-16 sm:h-16" : "w-10 h-10 sm:w-12 sm:h-12"} mb-1 drop-shadow-lg`}
      />

      {/* Student Name */}
      <div className={`text-center mb-2 ${isFirst ? "" : ""}`}>
        <p className={`font-black truncate max-w-full ${
          isFirst ? "text-sm sm:text-base" : "text-xs sm:text-sm"
        } ${isCurrentStudent ? "text-blue-300" : "text-white"}`}>
          {student.student_name}
          {isCurrentStudent && <span className="text-[9px] text-blue-400 ml-0.5">(나)</span>}
        </p>
        {student.class_name && (
          <p className="text-[10px] text-slate-400 truncate">{student.class_name}</p>
        )}
      </div>

      {/* Podium Block */}
      <div className={`w-full ${podiumHeight} bg-gradient-to-t ${podiumColor} rounded-t-xl flex flex-col items-center justify-start pt-3 relative overflow-hidden`}>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className={`font-black ${isFirst ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"} text-white drop-shadow-md`}>
          {activeTab === "score"
            ? `${student.average_score.toFixed(1)}`
            : student.total_words_studied}
        </div>
        <div className="text-[10px] text-white/70 font-medium">
          {activeTab === "score" ? "점" : "단어"}
        </div>
        <div className="text-[9px] text-white/50 mt-1">
          {student.completed_assignments}개 완료
        </div>
      </div>
    </div>
  );
}
