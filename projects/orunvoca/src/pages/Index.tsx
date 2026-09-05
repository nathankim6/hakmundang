import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardSetGrid } from "@/components/CardSetGrid";
import { supabase } from "@/integrations/supabase/client";
import { Plus, BookOpen, Target, TrendingUp, UserPlus, ClipboardList, Key, Users, LogOut, BookMarked, Home, Settings, User, Edit3, Check, X, Trash2, FileText, BarChart3, Upload, Image, FileSpreadsheet, ChevronRight, ChevronDown, Sparkles, FileSearch, Download, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";
import { ExcelAnalyzer } from "@/utils/excel-analyzer";
import { useToast } from "@/hooks/use-toast";
import runnerIcon from "@/assets/runner-icon-new.png";
import orunPenguinMascot from "@/assets/orun-penguin-mascot.png";
import orunAcademyLogo from "@/assets/orun-academy-logo.png";
import { vocaLiteSeriesTableData, vocaMainSeriesTableData } from "@/data/vocaLevelData";
import dictionaryIcon from "@/assets/orun-academy-lighthouse-logo.jpg";
import BookCard from "@/components/BookCard";
import meaningQuizIcon from "@/assets/exam-icons/meaning-quiz-icon.png";
import spellingQuizIcon from "@/assets/exam-icons/spelling-quiz-icon.png";
import exampleQuizIcon from "@/assets/exam-icons/example-quiz-icon.png";
import definitionQuizIcon from "@/assets/exam-icons/definition-quiz-icon.png";
interface DatabaseCardSet {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  test_type: string;
  word_data: any;
  selected_days: string[];
  image_url: string | null;
}
const Index = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [cardSets, setCardSets] = useState<DatabaseCardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) => setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  const [selectedCardSet, setSelectedCardSet] = useState<any>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<string>("");
  const [availableTestModes, setAvailableTestModes] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCardSet, setEditingCardSet] = useState<DatabaseCardSet | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [editWordData, setEditWordData] = useState<any[]>([]);
  const [editAvailableDays, setEditAvailableDays] = useState<string[]>([]);
  const [isExcelUploading, setIsExcelUploading] = useState(false);
  // 단어장 카테고리 분류
  const getCardSetCategory = (title: string) => {
    const isVocaSeries = (title.includes('ORUN') || title.includes('Ultimate')) && title.includes('VOCA');
    const isNeungyul = title.includes('능률') && !isVocaSeries;
    if (isVocaSeries) return 'voca';
    if (isNeungyul) return 'neungyul';
    return 'other';
  };
  // 기타 단어장에서는 예문/동반의어 모드 제외
  useEffect(() => {
    if (!selectedCardSet) return;
    const category = getCardSetCategory(selectedCardSet.title || '');
    if (category !== 'other') return;
    if (selectedTestType === 'example' || selectedTestType === 'synonym_antonym') {
      setSelectedTestType('');
    }
  }, [selectedCardSet, selectedTestType]);
  // 초기 상태를 sessionStorage에서 바로 읽어오기 (렌더링 지연 방지)
  const getInitialAdminState = () => {
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    const accessCode = sessionStorage.getItem('accessCode');
    return adminLoggedIn || accessCode === 'admin' || accessCode === '101100' || accessCode === 'orun0088';
  };
  const getInitialRestrictedState = () => {
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    const accessCode = sessionStorage.getItem('accessCode');
    const studentData = sessionStorage.getItem('studentData');
    const isAdminUser = adminLoggedIn || accessCode === 'admin' || accessCode === '101100';
    return !isAdminUser && !!studentData;
  };
  const [isAdmin, setIsAdmin] = useState(getInitialAdminState);
  const [isRestrictedUser, setIsRestrictedUser] = useState(getInitialRestrictedState);
  const [neungyulOpen, setNeungyulOpen] = useState(true);
  const [otherCategoryOpen, setOtherCategoryOpen] = useState(true);
  useEffect(() => {
    // 컴포넌트 마운트 시 상태 재확인 (혹시 모를 상황 대비)
    setIsAdmin(getInitialAdminState());
    setIsRestrictedUser(getInitialRestrictedState());
  }, []);
  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('accessCode');
    sessionStorage.removeItem('studentData');
    sessionStorage.removeItem('user_session_id');
    toast({
      title: "로그아웃 완료",
      description: "안전하게 로그아웃되었습니다."
    });
    navigate('/');
  };
  useEffect(() => {
    fetchCardSets();
  }, []);
  const fetchCardSets = async () => {
    try {
      const isAdmin = sessionStorage.getItem('adminLoggedIn') === 'true';
      const studentDataStr = sessionStorage.getItem('studentData');
      const studentData = studentDataStr ? JSON.parse(studentDataStr) : null;
      const {
        data,
        error
      } = await supabase.from('card_sets').select(`
          *,
          card_assignments!left(card_set_id)
        `).order('title', {
        ascending: true
      });
      if (error) throw error;
      let filteredData = data || [];
      if (isAdmin) {
        // 관리자: 과제 단어장만 제외하고 모든 단어장 표시
        filteredData = data?.filter((set) => !set.card_assignments || set.card_assignments.length === 0) || [];
      } else if (studentData) {
        // 학생: 해당 액세스 코드에 할당된 단어장만 표시
        const {
          data: allowedCardSets
        } = await supabase.from('access_code_card_sets').select('card_set_id').eq('access_code_id', studentData.id);
        if (allowedCardSets && allowedCardSets.length > 0) {
          // 할당된 단어장이 있으면 해당 단어장만 표시
          const allowedIds = allowedCardSets.map((item) => item.card_set_id);
          filteredData = data?.filter((set) => allowedIds.includes(set.id)) || [];
        } else {
          // 할당된 단어장이 없으면 모든 공개 단어장 표시 (과제 제외)
          filteredData = data?.filter((set) => !set.card_assignments || set.card_assignments.length === 0) || [];
        }
      } else {
        // 비로그인: 모든 단어장 표시
        filteredData = data || [];
      }
      setCardSets(filteredData);
    } catch (error) {
      console.error('Error fetching card sets:', error);
    } finally {
      setLoading(false);
    }
  };
  const convertedCardSets = cardSets.map((set) => {
    const wordData = Array.isArray(set.word_data) ? set.word_data : [];
    // DAY 비교를 포맷 차이에 상관없이 동작하도록 정규화
    const normalizeDay = (val: any) => {
      if (!val) return '';
      const str = val.toString();
      const m = str.match(/(\d+)/);
      return m ? m[1].padStart(2, '0') : str.trim().toLowerCase();
    };
    const selected = Array.isArray(set.selected_days) ? set.selected_days.map(normalizeDay) : [];
    // selected_days가 비어있으면 전체 단어를 포함
    const filteredWords = selected.length > 0 ? wordData.filter((word: any) => selected.includes(normalizeDay(word.day))) : wordData;
    return {
      id: set.id,
      title: set.title,
      description: set.description || "",
      totalStudyTime: filteredWords.length * 2,
      createdAt: new Date(set.created_at),
      updatedAt: new Date(set.updated_at),
      imageUrl: set.image_url,
      cards: filteredWords.map((word: any, index: number) => ({
        id: `${set.id}-${index}`,
        front: set.test_type === 'meaning' ? word.word : word.meaning,
        back: set.test_type === 'meaning' ? word.meaning : word.word,
        difficulty: "medium" as const,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: new Date(set.created_at)
      }))
    };
  }).sort((a, b) => {
    // ORUN VOCA 시리즈 우선 정렬
    const aIsOrunVoca = a.title.includes('ORUN VOCA');
    const bIsOrunVoca = b.title.includes('ORUN VOCA');

    // Ultimate은 항상 맨뒤
    const aIsUltimate = a.title.includes('Ultimate');
    const bIsUltimate = b.title.includes('Ultimate');

    if (aIsUltimate && !bIsUltimate) return 1;
    if (!aIsUltimate && bIsUltimate) return -1;

    // ORUN VOCA 시리즈끼리 숫자로 정렬
    if (aIsOrunVoca && bIsOrunVoca) {
      const aNum = parseInt(a.title.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b.title.match(/\d+/)?.[0] || '0');
      return aNum - bNum;
    }

    // ORUN VOCA는 앞으로
    if (aIsOrunVoca && !bIsOrunVoca) return -1;
    if (!aIsOrunVoca && bIsOrunVoca) return 1;

    // 나머지는 제목순
    return a.title.localeCompare(b.title);
  });
  const totalCards = convertedCardSets.reduce((sum, set) => sum + set.cards.length, 0);
  const totalStudyTime = convertedCardSets.reduce((sum, set) => sum + set.totalStudyTime, 0);
  const handleTestButtonClick = async (cardSet: any, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // 선택된 단어장의 available_test_modes 가져오기
    try {
      const {
        data,
        error
      } = await supabase.from('card_sets').select('available_test_modes').eq('id', cardSet.id).single();
      if (error) throw error;
      const modes = data?.available_test_modes || ['meaning', 'reverse', 'example', 'definition'];
      setAvailableTestModes(modes);
    } catch (error) {
      console.error('Error fetching test modes:', error);
      setAvailableTestModes(['meaning', 'reverse', 'example', 'definition']);
    }
    setSelectedCardSet(cardSet);
    setIsTestModalOpen(true);
  };
  const handleStartTest = () => {
    if (selectedCardSet && selectedTestType) {
      navigate(`/study/${selectedCardSet.id}?mode=${selectedTestType}`);
      setIsTestModalOpen(false);
      setSelectedTestType("");
    }
  };
  const handlePracticeButtonClick = (cardSet: any, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedCardSet(cardSet);
    setIsPracticeModalOpen(true);
  };
  const handleEditCardSet = (cardSet: DatabaseCardSet, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const originalCardSet = cardSets.find((cs) => cs.id === cardSet.id);
    if (originalCardSet) {
      setEditingCardSet(originalCardSet);
      setEditTitle(originalCardSet.title);
      setEditDescription(originalCardSet.description || "");
      setEditImageUrl(originalCardSet.image_url);
      setEditImageFile(null);
      // 기존 word_data 설정
      const existingWordData = Array.isArray(originalCardSet.word_data) ? originalCardSet.word_data : [];
      setEditWordData(existingWordData);
      const days = [...new Set(existingWordData.map((w: any) => w.day))].filter(Boolean) as string[];
      setEditAvailableDays(days.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      }));
      setIsEditModalOpen(true);
    }
  };
  const handleExcelFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsExcelUploading(true);
    try {
      const cellToText = (value: any) => {
        if (value === undefined || value === null) return '';
        if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
        return String(value).trim();
      };
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, {
        type: 'array'
      });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1
      }) as any[][];
      const analysis = ExcelAnalyzer.analyzeExcelStructure(jsonData);
      const {
        columnMapping,
        rowStartIndex
      } = analysis;
      const newWordData: any[] = [];
      for (let i = rowStartIndex; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        const dayValue = columnMapping.day !== undefined ? cellToText(row[columnMapping.day]) : '';
        const wordValue = columnMapping.word !== undefined ? cellToText(row[columnMapping.word]) : '';
        const meaningValue = columnMapping.meaning !== undefined ? cellToText(row[columnMapping.meaning]) : '';
        const exampleValue = columnMapping.example !== undefined ? cellToText(row[columnMapping.example]) : '';
        const englishDefinitionValue = columnMapping.englishDefinition !== undefined ? cellToText(row[columnMapping.englishDefinition]) : '';
        const numberValue = columnMapping.number !== undefined ? cellToText(row[columnMapping.number]) : '';
        if (!wordValue || !meaningValue) continue;
        newWordData.push({
          day: dayValue,
          number: numberValue,
          word: wordValue,
          meaning: meaningValue,
          example: exampleValue,
          englishDefinition: englishDefinitionValue
        });
      }
      if (newWordData.length === 0) {
        toast({
          title: "업로드 실패",
          description: "유효한 단어 데이터를 찾을 수 없습니다.",
          variant: "destructive"
        });
        return;
      }
      setEditWordData(newWordData);
      const days = [...new Set(newWordData.map((w) => w.day))].filter(Boolean) as string[];
      setEditAvailableDays(days.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      }));
      toast({
        title: "엑셀 업로드 완료",
        description: `${newWordData.length}개의 단어가 로드되었습니다.`
      });
    } catch (error) {
      console.error('Excel parsing error:', error);
      toast({
        title: "파일 처리 오류",
        description: "엑셀 파일을 읽는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsExcelUploading(false);
      event.target.value = '';
    }
  };
  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB 제한
        toast({
          title: "파일 크기 초과",
          description: "이미지 파일은 5MB 이하여야 합니다.",
          variant: "destructive"
        });
        return;
      }
      setEditImageFile(file);
      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setEditImageUrl(previewUrl);
    }
  };
  const handleSaveEdit = async () => {
    if (!editingCardSet) return;
    try {
      setIsUploadingImage(true);
      let imageUrl = editImageUrl;

      // 새로운 이미지 파일이 선택된 경우 업로드
      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${editingCardSet.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const {
          error: uploadError
        } = await supabase.storage.from('card-set-images').upload(filePath, editImageFile, {
          cacheControl: '3600',
          upsert: true
        });
        if (uploadError) throw uploadError;

        // 업로드된 이미지의 공개 URL 가져오기
        const {
          data: {
            publicUrl
          }
        } = supabase.storage.from('card-set-images').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }
      // word_data가 변경되었는지 확인
      const originalWordData = Array.isArray(editingCardSet.word_data) ? editingCardSet.word_data : [];
      const isWordDataChanged = JSON.stringify(originalWordData) !== JSON.stringify(editWordData);
      const updateData: any = {
        title: editTitle,
        description: editDescription,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      };

      // word_data가 변경된 경우에만 업데이트
      if (isWordDataChanged && editWordData.length > 0) {
        updateData.word_data = editWordData;
        updateData.selected_days = editAvailableDays;
      }
      const {
        error
      } = await supabase.from('card_sets').update(updateData).eq('id', editingCardSet.id);
      if (error) throw error;
      toast({
        title: "수정 완료",
        description: "단어장 정보가 성공적으로 수정되었습니다."
      });
      setIsEditModalOpen(false);
      setIsDeleteConfirming(false);
      setEditImageFile(null);
      fetchCardSets();
    } catch (error) {
      console.error('Error updating card set:', error);
      toast({
        title: "수정 실패",
        description: "단어장 정보 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
    }
  };
  const handleDeleteCardSet = async () => {
    if (!editingCardSet) return;
    try {
      const {
        error
      } = await supabase.from('card_sets').delete().eq('id', editingCardSet.id);
      if (error) throw error;
      toast({
        title: "삭제 완료",
        description: "단어장이 성공적으로 삭제되었습니다."
      });

      // 카드 목록 새로고침
      await fetchCardSets();
      setIsEditModalOpen(false);
      setEditingCardSet(null);
      setEditTitle("");
      setEditDescription("");
      setIsDeleteConfirming(false);
    } catch (error) {
      console.error('Error deleting card set:', error);
      toast({
        title: "삭제 실패",
        description: "단어장 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  const handleQuickDelete = async (cardSet: DatabaseCardSet, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm(`"${cardSet.title}" 단어장을 삭제하시겠습니까?`)) {
      return;
    }
    try {
      const {
        error
      } = await supabase.from('card_sets').delete().eq('id', cardSet.id);
      if (error) throw error;
      toast({
        title: "삭제 완료",
        description: "단어장이 성공적으로 삭제되었습니다."
      });
      await fetchCardSets();
    } catch (error) {
      console.error('Error deleting card set:', error);
      toast({
        title: "삭제 실패",
        description: "단어장 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  return <div className="lg:h-full min-h-screen lg:min-h-0 apple-canvas flex flex-col overflow-auto lg:overflow-hidden font-['Noto_Sans_KR',sans-serif]">




      {/* 메인 — Warm Editorial Grid: 좌 단어장 / 우 레벨 표 */}
      <main className="flex-1 min-h-0 w-full max-w-[1680px] mx-auto px-5 md:px-8 pt-3 pb-3 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 lg:overflow-hidden">

        {/* ── 좌: 단어장 리스트 ── */}
        <section className="lg:col-span-6 xl:col-span-5 flex flex-col min-h-0">



          {isRestrictedUser && <div className="grid grid-cols-2 gap-2 mb-4 lg:hidden">
              <button onClick={() => navigate('/exam-list')} className="apple-btn !py-2.5">Vocathon 참여</button>
              <button onClick={() => navigate('/result')} className="apple-btn-quiet w-full py-2.5">시험 결과 조회</button>
            </div>}

          <div className="flex-1 min-h-0 lg:overflow-y-auto pr-1">
            {loading ? <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="animate-pulse">
                    <div className="w-full aspect-[3/4] bg-[#f0ebe3]"></div>
                    <div className="mt-2 h-2.5 w-16 mx-auto bg-[#f0ebe3]"></div>
                  </div>)}
              </div> : convertedCardSets.length === 0 ? <div className="ed-surface text-center py-16">
                <BookOpen className="w-8 h-8 mx-auto text-[#c9b99a]" strokeWidth={1.5} />
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8b7355]">No wordbook found</p>
                <Link to="/create-cardset" className="inline-block mt-4">
                  <span className="apple-btn-quiet inline-flex items-center gap-1.5 px-5 py-2">
                    <Plus className="w-3.5 h-3.5" /> Create new
                  </span>
                </Link>
              </div> : (() => {
                const vocaSets = convertedCardSets.filter((cs) =>
                  (cs.title.includes('ORUN') || cs.title.includes('Ultimate')) && cs.title.includes('VOCA'));
                const neungyulSets = convertedCardSets.filter((cs) =>
                  cs.title.includes('능률') && !((cs.title.includes('ORUN') || cs.title.includes('Ultimate')) && cs.title.includes('VOCA')));
                const otherSets = convertedCardSets.filter((cs) =>
                  !((cs.title.includes('ORUN') || cs.title.includes('Ultimate')) && cs.title.includes('VOCA')) && !cs.title.includes('능률'));

                const renderCard = (cardSet: typeof convertedCardSets[0]) => {
                  const originalCardSet = cardSets.find((cs) => cs.id === cardSet.id);
                  return <BookCard key={cardSet.id} compact id={cardSet.id} title={cardSet.title} wordCount={cardSet.cards.length} dayCount={originalCardSet?.selected_days?.length || 0} imageUrl={cardSet.imageUrl} isAdmin={isAdmin} onTestClick={(e) => handleTestButtonClick(cardSet, e)} onPracticeClick={(e) => handlePracticeButtonClick(cardSet, e)} onEditClick={isAdmin && originalCardSet ? (e) => handleEditCardSet(originalCardSet, e) : undefined} onDeleteClick={isAdmin && originalCardSet ? (e) => handleQuickDelete(originalCardSet, e) : undefined} />;
                };

                const Section = ({ label, count, children }: { label: string; count: number; children: React.ReactNode }) => {
                  const collapsed = !!collapsedSections[label];
                  return (
                    <div className="mb-3 last:mb-0">
                      <button
                        type="button"
                        onClick={() => toggleSection(label)}
                        aria-expanded={!collapsed}
                        className="w-full flex items-baseline gap-3 mb-2.5 group text-left"
                      >
                        <ChevronDown
                          className={`w-3 h-3 self-center shrink-0 text-[#8b7355] transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
                          strokeWidth={2.5}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8b7355] whitespace-nowrap group-hover:text-[#2b241c] transition-colors">{label}</span>
                        <span className="ed-dotline" />
                        <span className="text-[10px] font-bold text-[#c9b99a]">{String(count).padStart(2, '0')}</span>
                      </button>
                      {!collapsed && children}
                    </div>
                  );
                };


                return <div className="animate-fade-in">
                    {vocaSets.length > 0 && <Section label="ORUN / Ultimate VOCA" count={vocaSets.length}>
                        <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-3">
                          {vocaSets.map(renderCard)}
                        </div>
                      </Section>}

                    {neungyulSets.length > 0 && <Section label="능률보카 시리즈" count={neungyulSets.length}>
                        <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-3">
                          {neungyulSets.map(renderCard)}
                        </div>
                      </Section>}

                    {otherSets.length > 0 && <Section label="기타 단어장" count={otherSets.length}>
                        <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-3">
                          {otherSets.map(renderCard)}
                        </div>
                      </Section>}
                  </div>;
              })()}
          </div>
        </section>

        {/* ── 우: V-Level 표 ── */}
        <aside className="lg:col-span-6 xl:col-span-7 flex flex-col min-h-0 gap-4">
          {[
            { key: 'lite', title: 'ORUN VOCA LITE', desc: '옳은보카 Lite (보카0~2) · 초등~예비중', rows: vocaLiteSeriesTableData },
            { key: 'main', title: 'ORUN VOCA SERIES', desc: '옳은보카 (보카3~Ultimate) · 중등~고등', rows: vocaMainSeriesTableData },
          ].map((tbl) => (
            <div key={tbl.key} className="ed-surface bg-white flex flex-col min-h-0">
              <div className="px-4 py-1.5 border-b border-[#3d3328] bg-[#201a14] flex items-baseline gap-2 flex-wrap">
                <h3 className="text-[10px] tracking-[0.18em] text-white leading-tight" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>{tbl.title}</h3>
                <p className="text-[9px] text-[#bfae94] leading-tight">{tbl.desc}</p>
              </div>




              <div className="min-h-0 lg:overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-[9px] uppercase tracking-[0.14em] text-[#8b7355]">
                      <th className="text-left font-bold px-3 py-2 border-b border-[#c9b99a]/60">단계</th>
                      <th className="text-right font-bold px-2 py-2 border-b border-[#c9b99a]/60 w-[74px]">어휘량</th>
                      <th className="text-center font-bold px-2 py-2 border-b border-[#c9b99a]/60 w-[46px]">CEFR</th>
                      <th className="text-center font-bold px-2 py-2 border-b border-[#c9b99a]/60 w-[46px]">V-Lv</th>
                      <th className="text-left font-bold px-3 py-2 border-b border-[#c9b99a]/60 lg:table-cell">학년기준</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tbl.rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#f0ebe3] last:border-0 hover:bg-[#faf8f5] transition-colors">
                        <td className="px-3 py-[9px] font-medium text-[#1a1a1a] whitespace-nowrap">{row.level}</td>
                        <td className="px-2 py-[9px] text-right font-bold text-[#8b7355] tabular-nums">{row.vocab}</td>
                        <td className="px-2 py-[9px] text-center text-[#8b7355]">{row.cefr}</td>
                        <td className="px-2 py-[9px] text-center font-bold text-[#1a1a1a]">{row.vlevel}</td>
                        <td className="px-3 py-[9px] text-[10px] text-[#8b7355]/85 leading-snug break-keep lg:table-cell">{row.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between gap-4 text-[10px] text-[#8b7355] border-t border-[#c9b99a] pt-2.5 shrink-0">
            <div className="inline-flex items-stretch overflow-hidden rounded-full border border-[#c9b99a] bg-white shadow-[0_1px_2px_rgba(43,36,28,0.06)]">
              <span
                className="flex items-center bg-[#201a14] px-2.5 py-[3px] text-[8.5px] font-bold uppercase tracking-[0.18em] text-[#e8cf9a]"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                V-Level
              </span>
              <span className="flex items-center px-2.5 py-[3px] text-[10px] leading-none text-[#5c5142] break-keep">
                CEFR 기준으로 어휘량·난이도를 시각화한 옳은영어 진단 지표입니다.
              </span>
            </div>
            <span className="whitespace-nowrap font-medium">© 2026 ORUN ENGLISH</span>
          </div>

        </aside>
      </main>



      {/* 시험 모드 모달 - Professional Noto Sans Design */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="max-w-sm p-0 gap-0 bg-white border border-slate-200/70 overflow-hidden font-['Noto_Sans_KR',_sans-serif] shadow-[0_20px_60px_-20px_rgba(15,23,42,0.25),0_8px_20px_-12px_rgba(15,23,42,0.15)] rounded-3xl">
          {/* Header */}
          <div className="px-6 pt-6 pb-5 text-center">
            <div className="mx-auto w-11 h-11 rounded-2xl overflow-hidden ring-1 ring-slate-900/5 shadow-[0_4px_12px_-4px_rgba(15,23,42,0.2)] mb-3">
              <img src={orunAcademyLogo} alt="ORUN Academy" className="w-full h-full object-contain bg-white" />
            </div>
            <DialogTitle className="text-[17px] font-semibold text-slate-900 tracking-[-0.02em] font-['Noto_Sans_KR',sans-serif]">
              학습 모드 선택
            </DialogTitle>
            <p className="text-[12px] text-slate-500 mt-1 tracking-tight">원하는 학습 방식을 선택하세요</p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Mode list */}
          <div className="px-3 py-3">
            <div className="flex flex-col gap-1">
              {[
                { id: 'meaning', label: '뜻 맞추기', sub: 'EN → KR', path: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' },
                { id: 'reverse', label: '철자 쓰기', sub: 'KR → EN', path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                { id: 'example', label: '예문 완성', sub: 'Context', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { id: 'definition', label: '영영 풀이', sub: 'EN → EN', path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                { id: 'synonym_antonym', label: '동/반의어 찾기', sub: 'Syn / Ant', path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              ].filter(m => {
                if (!availableTestModes.includes(m.id as any)) return false;
                const category = selectedCardSet ? getCardSetCategory(selectedCardSet.title || '') : 'other';
                if (category === 'other' && (m.id === 'example' || m.id === 'synonym_antonym')) return false;
                return true;
              }).map(m => {
                const active = selectedTestType === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedTestType(m.id as any)}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      active
            ? 'bg-slate-50 ring-1 ring-slate-900/10 shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
            : 'hover:bg-slate-50/70 '
                    }`}
                  >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      active
                        ? 'bg-gradient-to-br from-slate-900 to-slate-700   ring-1 ring-white/10 shadow-[0_4px_10px_-4px_rgba(15,23,42,0.5)]'
            : 'bg-slate-100 '
                    }`}>
           <svg className={`w-4 h-4 ${active ? 'text-white ' : 'text-slate-500 '}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={m.path} />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
           <div className={`text-[14px] font-semibold tracking-[-0.01em] ${active ? 'text-slate-900 ' : 'text-slate-700 '}`}>
                        {m.label}
                      </div>
           <div className={`text-[11px] mt-0.5 tracking-tight tabular-nums ${active ? 'text-slate-500 ' : 'text-slate-400 '}`}>
                        {m.sub}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      active
            ? 'bg-slate-900 scale-100'
            : 'bg-transparent ring-1 ring-slate-200 scale-90'
                    }`}>
                      {active && (
            <svg className="w-3 h-3 text-white " fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l3 3 7-7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 ">
            <div className="flex items-center justify-between w-full gap-2">
       <Button variant="ghost" size="sm" onClick={() => setIsTestModalOpen(false)} className="h-9 px-4 text-[13px] text-slate-600 hover:bg-slate-100 font-medium rounded-lg">
                취소
              </Button>
              <Button
                onClick={handleStartTest}
                disabled={!selectedTestType}
                size="sm"
   className="h-9 px-5 text-[13px] bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-[0_4px_12px_-4px_rgba(15,23,42,0.4)] disabled:opacity-30 disabled:shadow-none transition-all tracking-tight"
              >
                {selectedTestType ? '시작하기' : '모드를 선택하세요'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 연습 모드 선택 모달 */}
      <Dialog open={isPracticeModalOpen} onOpenChange={setIsPracticeModalOpen}>
        <DialogContent className="practice-mode-dialog max-w-sm p-0 gap-0 bg-white dark:bg-white border border-slate-200/70 dark:border-slate-200/70 overflow-hidden font-['Noto_Sans_KR',_sans-serif] shadow-[0_20px_60px_-20px_rgba(15,23,42,0.25),0_8px_20px_-12px_rgba(15,23,42,0.15)] rounded-3xl">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center ring-1 ring-slate-900/5 shadow-[0_4px_12px_-4px_rgba(15,23,42,0.4)]">
              <img src={orunPenguinMascot} alt="ORUN Mascot" className="w-7 h-7 object-cover rounded-lg" />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <DialogTitle className="text-[17px] font-semibold !text-slate-900 tracking-tight font-['Noto_Sans_KR',sans-serif]">
                연습 모드
              </DialogTitle>
              <span className="text-[12px] !text-slate-500 tracking-tight">학습 방식을 선택하세요</span>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Options */}
          <div className="p-4 space-y-2">
            <button
              onClick={() => {
                if (selectedCardSet) {
                  navigate(`/practice/${selectedCardSet.id}`);
                  setIsPracticeModalOpen(false);
                }
              }}
              className="group w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-50 dark:hover:bg-slate-100/80 ring-1 ring-slate-900/5 hover:ring-slate-900/10 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.3)]">
                <RotateCcw className="w-4 h-4 !text-white" />
              </div>
              <div className="text-left flex-1">
                <span className="block text-[14px] font-semibold !text-slate-900 tracking-tight">카드 플립</span>
                <span className="block text-[11.5px] !text-slate-500 tracking-tight">뒤집기 · 앞뒤 암기</span>
              </div>
            </button>

            {selectedCardSet && getCardSetCategory(selectedCardSet.title || '') !== 'other' && (
              <button
                onClick={() => {
                  if (selectedCardSet) {
                    navigate(`/study/${selectedCardSet.id}?mode=card`);
                    setIsPracticeModalOpen(false);
                  }
                }}
                className="group w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-50 dark:hover:bg-slate-100/80 ring-1 ring-slate-900/5 hover:ring-slate-900/10 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.3)]">
                  <svg className="w-4 h-4 !text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <span className="block text-[14px] font-semibold !text-slate-900 tracking-tight">비주얼 스와이프</span>
                  <span className="block text-[11.5px] !text-slate-500 tracking-tight">AI 이미지 · 스와이프 암기</span>
                </div>
              </button>
            )}
          </div>

          <div className="px-4 pb-4 pt-3 bg-slate-50/60 dark:bg-slate-50/60 border-t border-slate-200/60">
            <Button variant="ghost" size="sm" onClick={() => setIsPracticeModalOpen(false)} className="w-full h-9 text-[12.5px] !text-slate-600 hover:!bg-slate-100 hover:!text-slate-900 rounded-xl tracking-tight">
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              단어장 정보 수정
            </DialogTitle>
            <DialogDescription>
              단어장의 제목, 설명, 단어 데이터를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">제목</Label>
              <Input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="단어장 제목을 입력하세요" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">설명</Label>
              <Textarea id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="단어장에 대한 설명을 입력하세요 (선택사항)" rows={3} />
            </div>

            {/* Excel 파일 업로드 섹션 */}
            <div className="space-y-2">
              <Label htmlFor="edit-excel">단어 데이터 (Excel)</Label>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">현재 단어 수</span>
                    <span className="text-sm text-primary font-bold">{editWordData.length}개</span>
                  </div>
                  {editAvailableDays.length > 0 && <div className="text-xs text-muted-foreground">
                      Day: {editAvailableDays.join(', ')}
                    </div>}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => document.getElementById('edit-excel-input')?.click()} className="flex-1" disabled={isExcelUploading}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    {isExcelUploading ? "업로드 중..." : "새 엑셀 파일로 변경"}
                  </Button>
                  <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (editWordData.length === 0) {
                      toast({ title: "다운로드 실패", description: "다운로드할 단어 데이터가 없습니다.", variant: "destructive" });
                      return;
                    }
                    const worksheetData = editWordData.map((word: any) => ({
                      'Day': word.day || '',
                      'Word': word.word || '',
                      'Meaning': word.meaning || '',
                      'Derivatives': word.derivatives || '',
                      'Synonym': word.synonym || '',
                      'Antonym': word.antonym || '',
                      'English Definition': word.englishDefinition || '',
                      'Example Sentence': word.exampleSentence || ''
                    }));
                    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Words');
                    XLSX.writeFile(workbook, `${editTitle || 'wordbook'}_words.xlsx`);
                    toast({ title: "다운로드 완료", description: "엑셀 파일이 다운로드되었습니다." });
                  }}
                  disabled={editWordData.length === 0}
                  title="현재 단어 데이터를 엑셀로 다운로드">
                  
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <input id="edit-excel-input" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelFileChange} />
                <p className="text-xs text-muted-foreground">
                  새 엑셀 파일을 업로드하면 기존 단어 데이터가 교체됩니다.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">로고 이미지</Label>
              <div className="space-y-3">
                {editImageUrl && <div className="relative w-full h-40 rounded-lg border border-border overflow-hidden bg-muted">
                    <img src={editImageUrl} alt="미리보기" className="w-full h-full object-contain" />
                  </div>}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => document.getElementById('edit-image-input')?.click()} className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    {editImageUrl ? "이미지 변경" : "이미지 업로드"}
                  </Button>
                  {editImageUrl && <Button type="button" variant="outline" onClick={() => {
                  setEditImageUrl(null);
                  setEditImageFile(null);
                }}>
                      <X className="w-4 h-4" />
                    </Button>}
                </div>
                <input id="edit-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                <p className="text-xs text-muted-foreground">
                  권장: 정사각형 이미지, 최대 5MB
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-4">
            {/* 삭제 확인 영역 */}
            {isDeleteConfirming && <div className="w-full p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <p className="text-sm font-medium text-destructive">정말로 삭제하시겠습니까?</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  이 작업은 되돌릴 수 없습니다. 단어장과 관련된 모든 데이터가 삭제됩니다.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsDeleteConfirming(false)}>
                    취소
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteCardSet}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    삭제
                  </Button>
                </div>
              </div>}
            
            {/* 기본 버튼들 */}
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setIsDeleteConfirming(true)} className="border-destructive text-destructive hover:bg-destructive/10" disabled={isDeleteConfirming}>
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                setIsEditModalOpen(false);
                setIsDeleteConfirming(false);
              }}>
                  취소
                </Button>
                <Button onClick={handleSaveEdit} disabled={!editTitle.trim() || isUploadingImage}>
                  <Check className="w-4 h-4 mr-2" />
                  {isUploadingImage ? "저장 중..." : "저장"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Index;