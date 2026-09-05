import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, BookOpen, FileSpreadsheet, Camera, Target, PenTool, MessageSquare, Book, X, CheckCircle2, Layers, Users, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import createCardsetIcon from "@/assets/page-icons/create-cardset-icon.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { ExcelAnalyzer } from '@/utils/excel-analyzer';


interface WordData {
  day: string;
  number: number;
  word: string;
  meaning: string;
  example?: string;
  englishDefinition?: string;
  synonyms?: Array<{ word: string; meaning: string }>;
  antonyms?: Array<{ word: string; meaning: string }>;
  isDerivative?: boolean;
  wordType?: string;
}

const TEST_MODES = [{
  id: 'meaning',
  name: '뜻 맞추기',
  description: '한국어 뜻을 보고 영어 단어 선택',
  icon: Target,
  theme: { from: '#8b7355', to: '#6f5942', soft: 'from-[#f5f1e8] to-[#efe8db]', ring: 'ring-[#e3d9c8]', text: 'text-[#8b7355]', dot: 'bg-[#8b7355]' }
}, {
  id: 'reverse',
  name: '철자 쓰기',
  description: '영어 단어를 보고 한국어 뜻 입력',
  icon: PenTool,
  theme: { from: '#8b7355', to: '#6f5942', soft: 'from-[#f5f1e8] to-[#efe8db]', ring: 'ring-[#e3d9c8]', text: 'text-[#8b7355]', dot: 'bg-[#8b7355]' }
}, {
  id: 'example',
  name: '예문 완성',
  description: '예문의 빈칸에 들어갈 단어 찾기',
  icon: MessageSquare,
  theme: { from: '#8b7355', to: '#6f5942', soft: 'from-[#f5f1e8] to-[#efe8db]', ring: 'ring-[#e3d9c8]', text: 'text-[#8b7355]', dot: 'bg-[#8b7355]' }
}, {
  id: 'definition',
  name: '영영 풀이',
  description: '영영사전 정의를 보고 단어 찾기',
  icon: Book,
  theme: { from: '#8b7355', to: '#6f5942', soft: 'from-[#f5f1e8] to-[#efe8db]', ring: 'ring-[#e3d9c8]', text: 'text-[#8b7355]', dot: 'bg-[#8b7355]' }
}, {
  id: 'synonym_antonym',
  name: '동/반의어 찾기',
  description: '동의어/반의어가 아닌 단어 찾기',
  icon: Users,
  theme: { from: '#8b7355', to: '#6f5942', soft: 'from-[#f5f1e8] to-[#efe8db]', ring: 'ring-[#e3d9c8]', text: 'text-[#8b7355]', dot: 'bg-[#8b7355]' }
}];

export default function CreateCardSet() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [wordData, setWordData] = useState<WordData[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPresetLogo, setSelectedPresetLogo] = useState<string | null>(null);
  const [includeDerivatives, setIncludeDerivatives] = useState(true);
  const [availableTestModes, setAvailableTestModes] = useState<string[]>(['meaning', 'reverse', 'example', 'definition', 'synonym_antonym']);
  const [analysisResult, setAnalysisResult] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const cellToText = (value: any) => {
      if (value === undefined || value === null) return '';
      if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
      return value.toString().trim();
    };
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const allWords: WordData[] = [];
        const allDays = new Set<string>();
        let totalSheets = workbook.SheetNames.length;
        let processedSheets = 0;
        let analysisResults: string[] = [];

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (!jsonData || jsonData.length === 0) continue;

          const analysis = ExcelAnalyzer.analyzeExcelStructure(jsonData as any[][]);
          const actualData = (jsonData as any[][]).slice(analysis.rowStartIndex);
          let sheetWordCount = 0;

          for (let i = 0; i < actualData.length; i++) {
            const row = actualData[i];
            if (!row || row.length === 0) continue;

            const wordCol = analysis.columnMapping.word;
            const meaningCol = analysis.columnMapping.meaning;
            if (wordCol === undefined || meaningCol === undefined) continue;

            const word = row[wordCol];
            const meaning = row[meaningCol];

            const hasKorean = (s: string) => /[가-힣]/.test(s);
            const looksLikeDay = (s: string) => /^day\s*\d+/i.test(s);
            let finalWord = cellToText(word);
            let finalMeaning = cellToText(meaning);

            if (finalWord && looksLikeDay(finalWord) && finalMeaning && !hasKorean(finalMeaning)) {
              finalWord = finalMeaning;
              const krCell = row.find((cell: any) => cell && hasKorean(cell.toString()));
              if (krCell) finalMeaning = krCell.toString().trim();
            }

            if (!hasKorean(finalMeaning)) {
              const krCell = row.find((cell: any) => cell && hasKorean(cell.toString()));
              if (krCell) finalMeaning = krCell.toString().trim();
            }

            if (finalWord && finalMeaning) {
              const dayCol = analysis.columnMapping.day;
              const exampleCol = analysis.columnMapping.example;
              const numberCol = analysis.columnMapping.number;
              const englishDefCol = analysis.columnMapping.englishDefinition;
              
              const dayValue = dayCol !== undefined ? row[dayCol] : '';
              const exampleValue = exampleCol !== undefined ? row[exampleCol] : undefined;
              const numberValue = numberCol !== undefined ? row[numberCol] : allWords.length + 1;
              const englishDefValue = englishDefCol !== undefined ? row[englishDefCol] : undefined;
              
              // 예문 추출 - CSV에서 직접 가져오기
              const englishExample = cellToText(exampleValue) || undefined;
              const englishDefinition = cellToText(englishDefValue) || undefined;

              // 동의어 추출
              const synonyms: Array<{ word: string; meaning: string }> = [];
              const syn1Col = analysis.columnMapping.synonym1;
              const syn1MeaningCol = analysis.columnMapping.synonym1Meaning;
              const syn2Col = analysis.columnMapping.synonym2;
              const syn2MeaningCol = analysis.columnMapping.synonym2Meaning;
              const syn3Col = analysis.columnMapping.synonym3;
              const syn3MeaningCol = analysis.columnMapping.synonym3Meaning;
              
              if (syn1Col !== undefined && row[syn1Col]) {
                synonyms.push({
                  word: row[syn1Col].toString().trim(),
                  meaning: syn1MeaningCol !== undefined && row[syn1MeaningCol] ? row[syn1MeaningCol].toString().trim() : ''
                });
              }
              if (syn2Col !== undefined && row[syn2Col]) {
                synonyms.push({
                  word: row[syn2Col].toString().trim(),
                  meaning: syn2MeaningCol !== undefined && row[syn2MeaningCol] ? row[syn2MeaningCol].toString().trim() : ''
                });
              }
              if (syn3Col !== undefined && row[syn3Col]) {
                synonyms.push({
                  word: row[syn3Col].toString().trim(),
                  meaning: syn3MeaningCol !== undefined && row[syn3MeaningCol] ? row[syn3MeaningCol].toString().trim() : ''
                });
              }

              // 반의어 추출
              const antonyms: Array<{ word: string; meaning: string }> = [];
              const ant1Col = analysis.columnMapping.antonym1;
              const ant1MeaningCol = analysis.columnMapping.antonym1Meaning;
              const ant2Col = analysis.columnMapping.antonym2;
              const ant2MeaningCol = analysis.columnMapping.antonym2Meaning;
              const ant3Col = analysis.columnMapping.antonym3;
              const ant3MeaningCol = analysis.columnMapping.antonym3Meaning;
              
              if (ant1Col !== undefined && row[ant1Col]) {
                antonyms.push({
                  word: row[ant1Col].toString().trim(),
                  meaning: ant1MeaningCol !== undefined && row[ant1MeaningCol] ? row[ant1MeaningCol].toString().trim() : ''
                });
              }
              if (ant2Col !== undefined && row[ant2Col]) {
                antonyms.push({
                  word: row[ant2Col].toString().trim(),
                  meaning: ant2MeaningCol !== undefined && row[ant2MeaningCol] ? row[ant2MeaningCol].toString().trim() : ''
                });
              }
              if (ant3Col !== undefined && row[ant3Col]) {
                antonyms.push({
                  word: row[ant3Col].toString().trim(),
                  meaning: ant3MeaningCol !== undefined && row[ant3MeaningCol] ? row[ant3MeaningCol].toString().trim() : ''
                });
              }

              let dayLabel = dayValue ? dayValue.toString().trim() : '';
              if (totalSheets > 1) {
                if (dayLabel) {
                  dayLabel = `${sheetName} ${dayLabel}`;
                } else {
                  dayLabel = sheetName;
                }
              } else if (!dayLabel) {
                dayLabel = `Day ${Math.floor(allWords.length / 10) + 1}`;
              }

              // 유형(wordType) 컬럼 감지
              const wordTypeCol = analysis.columnMapping.wordType;
              const wordTypeValue = wordTypeCol !== undefined ? cellToText(row[wordTypeCol]) || undefined : undefined;
              const isDerivative = wordTypeValue ? wordTypeValue !== '표제어' : false;

              const wordItem: WordData = {
                day: dayLabel,
                number: typeof numberValue === 'number' ? numberValue : parseInt(numberValue?.toString() || '0') || allWords.length + 1,
                word: finalWord,
                meaning: finalMeaning,
                example: englishExample,
                englishDefinition: englishDefinition,
                synonyms: synonyms.length > 0 ? synonyms : undefined,
                antonyms: antonyms.length > 0 ? antonyms : undefined,
                isDerivative: isDerivative,
                wordType: wordTypeValue || undefined
              };
              allWords.push(wordItem);
              allDays.add(wordItem.day);
              sheetWordCount++;
            }
          }
          if (sheetWordCount > 0) {
            processedSheets++;
            analysisResults.push(`${sheetName}: ${sheetWordCount}개`);
          }
        }

        if (allWords.length === 0) {
          throw new Error('처리할 수 있는 단어 데이터가 없습니다.');
        }

        let resultMessage = totalSheets > 1
          ? `📑 ${totalSheets}개 시트 중 ${processedSheets}개 처리됨 (${analysisResults.join(', ')})`
          : `자동 감지된 구조로 처리됨`;

        setWordData(allWords);
        setAvailableDays(Array.from(allDays).sort());
        setAnalysisResult(resultMessage);
        toast({
          title: "성공",
          description: totalSheets > 1
            ? `${totalSheets}개 시트에서 총 ${allWords.length}개의 단어를 업로드했습니다.`
            : `${allWords.length}개의 단어를 업로드했습니다.`
        });
      } catch (error) {
        toast({
          title: "오류",
          description: error instanceof Error ? error.message : "엑셀 파일을 읽는 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: "오류",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive"
      });
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = e => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;
    try {
      const fileName = `${Date.now()}-${selectedImage.name}`;
      const { data, error } = await supabase.storage.from('card-set-images').upload(fileName, selectedImage);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('card-set-images').getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (error) {
      toast({
        title: "오류",
        description: "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleTestModeToggle = (modeId: string) => {
    setAvailableTestModes(prev => {
      if (prev.includes(modeId)) {
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== modeId);
      } else {
        return [...prev, modeId];
      }
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "오류", description: "단어장 제목을 입력해주세요.", variant: "destructive" });
      return;
    }
    if (wordData.length === 0) {
      toast({ title: "오류", description: "엑셀 파일을 업로드해주세요.", variant: "destructive" });
      return;
    }
    try {
      let imageUrl = selectedPresetLogo || null;
      if (selectedImage && !selectedPresetLogo) {
        imageUrl = await uploadImage();
      }

      const isAdmin = sessionStorage.getItem('adminLoggedIn') === 'true';
      const studentData = sessionStorage.getItem('studentData');
      const createdBy = isAdmin ? 'admin' : studentData ? JSON.parse(studentData).sessionId : null;

      const { error } = await supabase.from('card_sets').insert({
        title: title.trim(),
        description: description.trim() || null,
        test_type: 'meaning',
        word_data: wordData as any,
        selected_days: availableDays,
        image_url: imageUrl,
        include_derivatives: includeDerivatives,
        available_test_modes: availableTestModes,
        created_by: createdBy
      }).select().single();

      if (error) throw error;
      toast({ title: "성공", description: `${wordData.length}개 단어로 단어장이 생성되었습니다.` });
      navigate("/");
    } catch (error) {
      toast({ title: "오류", description: "단어장 저장 중 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  const cardClass = "rounded-[4px] bg-white border border-[#e3d9c8] shadow-[0_1px_3px_rgba(43,36,28,0.06)] overflow-hidden";
  const accentLineClass = "h-[3px] bg-[#8b7355]";

  return (
    <div className="min-h-screen apple-canvas font-['Noto_Sans_KR',sans-serif]">
      {/* Editorial dark header */}
      <div className="w-full bg-[#201a14]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#bfae94]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Create New Card Set
            </p>
            <h1 className="mt-1.5 text-white text-[14px] sm:text-[16px] leading-none font-bold tracking-[-0.02em]">
              새 단어장 만들기
            </h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-white/20 text-[10px] font-bold uppercase tracking-[0.12em] text-[#cfc3b2] hover:text-white hover:border-white/40 transition-colors"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-4 pb-2">
        <p className="text-[12px] text-[#8b7355]">단어 데이터를 업로드하고 학습 모드를 설정하세요</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-2 pb-20 space-y-5">
        {/* 단어장 정보 */}
        <section className={cardClass}>
          <div className={accentLineClass} />
          <div className="px-6 py-5 border-b border-[#e3d9c8] flex items-center gap-4">
            <div className="w-10 h-10 rounded-[4px] bg-[#8b7355] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-[#1a1a1a] tracking-[-0.02em]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                단어장 정보
              </h2>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#a8977c] mt-0.5" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Card Set Information
              </p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold text-[#5c5142] flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#8b7355]" />
                제목 *
              </Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="단어장 제목을 입력하세요"
                className="h-11 rounded-[4px] bg-[#faf8f5] border-[#e3d9c8] text-sm focus:border-[#8b7355] focus:ring-1 focus:ring-[#8b7355]/25 transition-all placeholder:text-[#a8977c]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold text-[#5c5142] flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#c9b99a]" />
                설명 (선택)
              </Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="단어장에 대한 설명을 입력하세요"
                rows={2}
                className="rounded-[4px] bg-[#faf8f5] border-[#e3d9c8] text-sm resize-none focus:border-[#8b7355] focus:ring-1 focus:ring-[#8b7355]/25 transition-all placeholder:text-[#a8977c]"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[11px] font-semibold text-[#5c5142] flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#c9b99a]" />
                로고 이미지 (선택)
              </Label>
              <input
                type="file"
                ref={imageInputRef}
                onChange={e => { handleImageUpload(e); setSelectedPresetLogo(null); }}
                accept="image/*"
                className="hidden"
              />


              {/* 커스텀 업로드 */}
              <div className="flex items-center gap-3 pt-1">
                <Button
                  onClick={() => imageInputRef.current?.click()}
                  variant="outline"
                  className="h-10 rounded-[4px] text-[11px] border-dashed border-[#c9b99a] text-[#5c5142] hover:border-[#8b7355] hover:bg-[#f5f1e8] hover:text-[#8b7355] transition-all"
                >
                  <Camera className="w-3.5 h-3.5 mr-2" />
                  커스텀 이미지 업로드
                </Button>
                {imagePreview && !selectedPresetLogo && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f5f1e8] rounded-[4px] border border-[#e3d9c8]">
                    <img src={imagePreview} alt="Preview" className="w-7 h-7 object-cover rounded-md ring-1 ring-[#e3d9c8]" />
                    <span className="text-[10px] text-[#8b7355] font-medium">선택됨</span>
                    <button
                      onClick={() => { setSelectedPresetLogo(null); setSelectedImage(null); setImagePreview(null); }}
                      className="w-5 h-5 rounded-[3px] bg-white border border-[#e3d9c8] flex items-center justify-center text-[#a8977c] hover:text-[#8b7355] transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 엑셀 파일 업로드 */}
        <section className={cardClass}>
          <div className={accentLineClass} />
          <div className="px-6 py-5 border-b border-[#e3d9c8] flex items-center gap-4">
            <div className="w-10 h-10 rounded-[4px] bg-[#8b7355] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-[#1a1a1a] tracking-[-0.02em]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                엑셀 파일 업로드
              </h2>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#a8977c] mt-0.5" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Excel Data Import
              </p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.csv" className="hidden" />
            {wordData.length === 0 ? (
              <div className="space-y-5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-10 border border-dashed border-[#c9b99a] rounded-[4px] hover:border-[#8b7355] hover:bg-[#f5f1e8]/60 transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-[4px] bg-[#f5f1e8] group-hover:bg-white flex items-center justify-center transition-all border border-[#e3d9c8] group-hover:border-[#8b7355]">
                      <Upload className="w-6 h-6 text-[#a8977c] group-hover:text-[#8b7355] transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-semibold text-[#5c5142]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>클릭하여 엑셀 파일 선택</p>
                      <p className="text-[11px] text-[#a8977c] mt-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>.xlsx, .xls, .csv supported</p>
                    </div>
                  </div>
                </button>

                {/* 엑셀 파일 예시 */}
                <div className="rounded-[4px] border border-[#e3d9c8] bg-[#faf8f5] p-4">
                  <p className="text-[11px] font-semibold text-[#8b7355] mb-3 flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#a8977c]" />
                    엑셀 파일 구성 예시
                  </p>
                  <div className="overflow-hidden rounded-[4px] border border-[#e3d9c8] bg-white">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="bg-[#1a1a1a] text-[#faf8f5]">
                          <th className="px-3 py-2 text-left font-semibold">Day</th>
                          <th className="px-3 py-2 text-left font-semibold">No.</th>
                          <th className="px-3 py-2 text-left font-semibold">Word</th>
                          <th className="px-3 py-2 text-left font-semibold">Meaning</th>
                          <th className="px-3 py-2 text-left font-semibold text-[#c9b99a]">Example</th>
                          <th className="px-3 py-2 text-left font-semibold text-[#c9b99a]">Definition</th>
                        </tr>
                      </thead>
                      <tbody className="text-[#5c5142]">
                        <tr className="border-t border-[#e3d9c8]">
                          <td className="px-3 py-1.5">DAY 01</td>
                          <td className="px-3 py-1.5">1</td>
                          <td className="px-3 py-1.5 font-medium text-[#1a1a1a]">abandon</td>
                          <td className="px-3 py-1.5">버리다, 포기하다</td>
                          <td className="px-3 py-1.5 text-[#a8977c]">They ___ the plan.</td>
                          <td className="px-3 py-1.5 text-[#a8977c]">to give up completely</td>
                        </tr>
                        <tr className="border-t border-[#e3d9c8] bg-[#faf8f5]">
                          <td className="px-3 py-1.5">DAY 01</td>
                          <td className="px-3 py-1.5">2</td>
                          <td className="px-3 py-1.5 font-medium text-[#1a1a1a]">absorb</td>
                          <td className="px-3 py-1.5">흡수하다</td>
                          <td className="px-3 py-1.5 text-[#a8977c]">The sponge ___ water.</td>
                          <td className="px-3 py-1.5 text-[#a8977c]">to take in or soak up</td>
                        </tr>
                        <tr className="border-t border-[#e3d9c8]">
                          <td className="px-3 py-1.5">DAY 02</td>
                          <td className="px-3 py-1.5">1</td>
                          <td className="px-3 py-1.5 font-medium text-[#1a1a1a]">capable</td>
                          <td className="px-3 py-1.5">유능한</td>
                          <td className="px-3 py-1.5 text-[#a8977c]">She is very ___.</td>
                          <td className="px-3 py-1.5 text-[#a8977c]">having the ability to do</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-[#a8977c] mt-2">* Day, Word, Meaning은 필수 · Example, Definition은 선택 항목입니다</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[#f5f1e8] rounded-[4px] border border-[#e3d9c8]">
                  <div className="w-10 h-10 rounded-[4px] bg-[#8b7355] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-[#1a1a1a]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{wordData.length}개 단어 업로드 완료</p>
                    {analysisResult && <p className="text-[11px] text-[#8b7355] mt-0.5">{analysisResult}</p>}
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="h-9 rounded-[4px] text-[11px] border-[#c9b99a] text-[#8b7355] hover:bg-[#f0ebe3] hover:text-[#1a1a1a]"
                  >
                    다시 업로드
                  </Button>
                </div>

                <div className="p-4 bg-[#faf8f5] rounded-[4px] border border-[#e3d9c8]">
                  <p className="text-[11px] font-semibold text-[#8b7355] mb-3 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    DAY 구성
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableDays.slice(0, 12).map(day => {
                      const dayWords = wordData.filter(w => w.day === day);
                      const mainCount = dayWords.filter(w => !w.isDerivative).length;
                      const derivCount = dayWords.filter(w => w.isDerivative).length;
                      return (
                        <div key={day} className="px-3 py-1.5 bg-white rounded-[4px] border border-[#e3d9c8] text-[11px]">
                          <span className="font-semibold text-[#5c5142]">{day}</span>
                          <span className="text-[#a8977c] ml-1.5">{mainCount}개</span>
                          {derivCount > 0 && <span className="text-[#8b7355] ml-1 font-medium">+{derivCount}</span>}
                        </div>
                      );
                    })}
                    {availableDays.length > 12 && (
                      <div className="px-3 py-1.5 bg-[#f0ebe3] rounded-[4px] text-[11px] text-[#a8977c] font-medium">
                        +{availableDays.length - 12}개 더
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#faf8f5] rounded-[4px] border border-[#e3d9c8]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[4px] bg-white border border-[#e3d9c8] flex items-center justify-center">
                      <Layers className="w-4 h-4 text-[#a8977c]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#1a1a1a]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>파생어 포함</p>
                      <p className="text-[11px] text-[#a8977c]">
                        표제어 {wordData.filter(w => !w.isDerivative).length}개 + 파생어 {wordData.filter(w => w.isDerivative).length}개
                      </p>
                    </div>
                  </div>
                  <Switch checked={includeDerivatives} onCheckedChange={setIncludeDerivatives} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 시험 모드 */}
        <section className={cardClass}>
          <div className={accentLineClass} />
          <div className="px-6 py-5 border-b border-[#e3d9c8] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-[4px] bg-[#1a1a1a] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-[#1a1a1a] tracking-[-0.02em]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                  시험 모드
                </h2>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#a8977c] mt-0.5" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  Test Modes
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#5c5142] px-3 py-1.5 rounded-[3px] bg-[#f0ebe3] border border-[#e3d9c8] tabular-nums" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              <span className="text-[#8b7355]">{availableTestModes.length}</span>
              <span className="text-[#c9b99a] mx-1.5">/</span>
              {TEST_MODES.length}
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEST_MODES.map((mode, idx) => {
                const Icon = mode.icon;
                const isSelected = availableTestModes.includes(mode.id);
                const t = mode.theme;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleTestModeToggle(mode.id)}
                    className={`group relative flex items-center gap-4 pl-5 pr-4 py-4 rounded-[4px] text-left bg-white overflow-hidden border transition-all duration-200 ${
                      isSelected
                        ? 'border-[#8b7355] shadow-[0_1px_3px_rgba(43,36,28,0.08)]'
                        : 'border-[#e3d9c8] hover:border-[#c9b99a]'
                    }`}
                  >
                    {/* 상단 액센트 바 */}
                    <span
                      className={`absolute inset-x-0 top-0 h-[5px] transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                      style={{ background: `linear-gradient(90deg, ${t.from}, ${t.to})` }}
                    />

                    <span className={`text-[10px] font-bold tabular-nums tracking-[0.08em] flex-shrink-0 w-5 ${
                      isSelected ? t.text : 'text-[#c9b99a]'
                    }`} style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <div
                      className={`w-10 h-10 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? '' : 'bg-[#faf8f5] border border-[#e3d9c8]'}`}
                      style={isSelected ? { background: `linear-gradient(135deg, ${t.from}, ${t.to})`, boxShadow: `0 8px 18px -8px ${t.from}80` } : undefined}
                    >
                      <Icon className={`w-[18px] h-[18px] ${isSelected ? 'text-white' : 'text-[#a8977c]'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-[13px] leading-tight tracking-[-0.015em] ${
                        isSelected ? 'text-[#1a1a1a]' : 'text-[#5c5142]'
                      }`} style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{mode.name}</p>
                      <p className="text-[11px] leading-snug mt-1 text-[#a8977c] truncate">{mode.description}</p>
                    </div>

                    <div
                      className={`relative w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all`}
                      style={isSelected ? { background: `linear-gradient(135deg, ${t.from}, ${t.to})` } : undefined}
                    >
                      {!isSelected && <span className="w-full h-full rounded-full ring-1 ring-[#e3d9c8] bg-[#faf8f5]" />}
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>

                );
              })}
            </div>
          </div>
        </section>

        {/* 저장 버튼 */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            className="w-full h-13 py-4 rounded-[4px] bg-[#1a1a1a] hover:bg-[#8b7355] text-[#faf8f5] font-semibold text-[13px] tracking-[0.02em] transition-colors group"
          >
            <span className="flex items-center gap-2" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
              단어장 저장
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
