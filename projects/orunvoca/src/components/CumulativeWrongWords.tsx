import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Printer, Search, X, ChevronDown, ChevronUp, AlertTriangle, Filter
} from "lucide-react";
import orunTestLogo from "@/assets/orun-academy-test-logo.png";

interface WrongWordEntry {
  word: string;
  meaning?: string;
  count: number;
  sources: string[];
}

interface StudentWrongData {
  studentKey: string;
  studentName: string;
  phoneLast4: string;
  studentClass: string;
  totalWrongCount: number;
  uniqueWordCount: number;
  words: WrongWordEntry[];
}

const CumulativeWrongWords = () => {
  const [students, setStudents] = useState<StudentWrongData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTestPaper, setShowTestPaper] = useState(false);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [classFilter, setClassFilter] = useState<string>("all");

  useEffect(() => {
    fetchCumulativeData();
  }, []);

  const fetchCumulativeData = async () => {
    setLoading(true);
    try {
      // 현재 관리자 코드로 생성된 숙제만 조회
      const adminCode = sessionStorage.getItem("accessCode") || "admin";
      
      let homeworkQuery = supabase
        .from("homeworks")
        .select("id, title, card_set_id, selected_days, created_by");
      
      // 관리자별 데이터 분리 (admin/101100은 모든 데이터 접근 가능)
      if (adminCode !== "admin" && adminCode !== "101100") {
        homeworkQuery = homeworkQuery.eq("created_by", adminCode);
      }
      
      const { data: homeworks } = await homeworkQuery;
      const homeworkIds = (homeworks || []).map(h => h.id);
      
      if (homeworkIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const { data: submissions } = await supabase
        .from("homework_submissions")
        .select("student_name, student_phone_last4, student_class, wrong_words, homework_id")
        .not("wrong_words", "is", null)
        .in("homework_id", homeworkIds);

      // Fetch card set titles
      const cardSetIds = [...new Set((homeworks || []).map(h => h.card_set_id).filter(Boolean))];
      const { data: cardSets } = cardSetIds.length > 0
        ? await supabase.from("card_sets").select("id, title").in("id", cardSetIds)
        : { data: [] };

      const cardSetMap = new Map((cardSets || []).map(cs => [cs.id, cs.title]));
      const homeworkMap = new Map((homeworks || []).map(h => [h.id, {
        title: h.title,
        cardSetTitle: cardSetMap.get(h.card_set_id) || "",
        selectedDays: h.selected_days || [],
      }]));
      const studentMap = new Map<string, StudentWrongData>();

      for (const sub of submissions || []) {
        const key = `${sub.student_name}_${sub.student_phone_last4}`;
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            studentKey: key, studentName: sub.student_name,
            phoneLast4: sub.student_phone_last4, studentClass: sub.student_class || "-",
            totalWrongCount: 0, uniqueWordCount: 0, words: [],
          });
        }
        const student = studentMap.get(key)!;
        const wrongWords = Array.isArray(sub.wrong_words) ? sub.wrong_words : [];
        const hwInfo = homeworkMap.get(sub.homework_id);
        const cardSetTitle = hwInfo?.cardSetTitle || "";
        const selectedDays = hwInfo?.selectedDays || [];

        for (const w of wrongWords) {
          const wordStr = typeof w === "string" ? w : (w as any)?.word || "";
          const meaning = typeof w === "object" ? (w as any)?.meaning || "" : "";
          const wordDay = typeof w === "object" ? (w as any)?.day || "" : "";
          if (!wordStr) continue;

          // Build source label: "단어장명 Day X" or "단어장명 (Day1,Day2,...)"
          let sourceLabel = cardSetTitle || hwInfo?.title || "알 수 없음";
          if (wordDay) {
            sourceLabel += ` ${wordDay}`;
          } else if (selectedDays.length > 0 && selectedDays.length <= 3) {
            sourceLabel += ` ${selectedDays.join(",")}`;
          }

          const existing = student.words.find(e => e.word.toLowerCase() === wordStr.toLowerCase());
          if (existing) {
            existing.count++;
            if (!existing.sources.includes(sourceLabel)) existing.sources.push(sourceLabel);
            if (meaning && !existing.meaning) existing.meaning = meaning;
          } else {
            student.words.push({ word: wordStr, meaning, count: 1, sources: [sourceLabel] });
          }
          student.totalWrongCount++;
        }
      }

      for (const student of studentMap.values()) {
        student.uniqueWordCount = student.words.length;
        student.words.sort((a, b) => b.count - a.count);
      }

      setStudents(
        Array.from(studentMap.values()).filter(s => s.words.length > 0).sort((a, b) => b.uniqueWordCount - a.uniqueWordCount)
      );
    } catch (error) {
      console.error("Failed to fetch cumulative data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedStudents(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // 반 목록 추출
  const classList = [...new Set(students.map(s => s.studentClass).filter(c => c && c !== "-"))].sort();

  const filteredStudents = students.filter(s => {
    if (classFilter !== "all" && s.studentClass !== classFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.studentName.toLowerCase().includes(q) || s.studentClass.toLowerCase().includes(q);
  });

  const selectedStudentData = students.find(s => s.studentKey === selectedStudent);

  // ===== Print logic using CreateTestPaper-style layout =====
  const handlePrint = (mode: "test" | "answer") => {
    if (!selectedStudentData) return;
    const words = selectedStudentData.words;
    const wordsPerPage = 50;
    const wordsPerColumn = 25;

    const pages: WrongWordEntry[][] = [];
    for (let i = 0; i < words.length; i += wordsPerPage) {
      pages.push(words.slice(i, i + wordsPerPage));
    }

    const isAnswer = mode === "answer";

    let pagesHtml = "";
    pages.forEach((pageWords, pageIndex) => {
      const left = pageWords.slice(0, wordsPerColumn);
      const right = pageWords.slice(wordsPerColumn);

      let rows = "";
      for (let r = 0; r < wordsPerColumn; r++) {
        const lw = left[r];
        const rw = right[r];
        const lNum = pageIndex * wordsPerPage + r + 1;
        const rNum = pageIndex * wordsPerPage + wordsPerColumn + r + 1;

        const renderCell = (w: WrongWordEntry | undefined, num: number) => {
          if (!w) return `<td class="td-no td-empty"></td><td class="td-question td-empty"></td><td class="${isAnswer ? 'td-answer-filled' : 'td-answer'} td-empty"></td>`;
          const freq = w.count >= 3 ? `<span class="freq-dot freq-high">●</span>` : w.count >= 2 ? `<span class="freq-dot freq-med">●</span>` : '';
          return `<td class="td-no">${num}</td><td class="td-question">${w.meaning || w.word} ${freq}</td><td class="${isAnswer ? 'td-answer-filled' : 'td-answer'}">${isAnswer ? w.word : ''}</td>`;
        };

        rows += `<tr>${renderCell(lw, lNum)}${renderCell(rw, rNum)}</tr>`;
      }

      pagesHtml += `
        <div class="test-page">
          <div class="${isAnswer ? 'answer-header-minimal' : 'test-header-minimal'}">
            <div class="header-brand">
              <img src="${orunTestLogo}" class="header-logo" />
              <div class="header-title-group">
                <h1 class="header-main-title">오답 단어 테스트${isAnswer ? '' : ''}</h1>
                <span class="header-sub-info">${selectedStudentData.studentName} | ${selectedStudentData.studentClass} | 오답누적 ${words.length}문제</span>
              </div>
            </div>
            ${isAnswer ? '<span class="answer-label">ANSWER KEY</span>' : `
            <div class="header-student-area">
              <div class="student-field"><label>이름</label><span class="field-box field-name">${selectedStudentData.studentName}</span></div>
              <div class="student-field-divider"></div>
              <div class="student-field"><label>점수</label><span class="field-box score-box"></span><span class="score-suffix">/ ${words.length}</span></div>
            </div>`}
          </div>
          <div class="test-table-container">
            <table class="test-table-modern ${isAnswer ? 'answer-table-modern' : ''}">
              <colgroup><col style="width:4%"/><col style="width:23%"/><col style="width:23%"/><col style="width:4%"/><col style="width:23%"/><col style="width:23%"/></colgroup>
              <thead><tr>
                <th class="th-no">#</th><th class="th-question">한글 뜻</th><th class="th-answer">English</th>
                <th class="th-no">#</th><th class="th-question">한글 뜻</th><th class="th-answer">English</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="${isAnswer ? 'answer-footer-minimal' : 'test-footer-minimal'}">
            <span>${words.length}문제</span><span>ORUN ACADEMY</span><span>${pageIndex + 1}/${pages.length}</span>
          </div>
        </div>`;
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>오답 시험지</title><style>${getTestPaperStyles()}</style></head><body><div class="test-paper-container">${pagesHtml}</div></body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

  const getTestPaperStyles = () => `
    @page { size: A4 portrait; margin: 0mm !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: white; font-family: 'Malgun Gothic', 'Noto Sans KR', sans-serif; width: 210mm; }
    .test-paper-container { background: white; padding: 0; margin: 0; width: 210mm; }
    .test-page { width: 210mm !important; height: 297mm !important; margin: 0 !important; padding: 5mm 6mm !important; page-break-after: always !important; display: flex !important; flex-direction: column !important; background: white !important; }
    .test-page:last-child { page-break-after: auto !important; }
    .test-header-minimal { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%); border-radius: 4px; margin-bottom: 4px; flex-shrink: 0; position: relative; overflow: hidden; border-bottom: 1.5px solid rgba(212, 168, 75, 0.4); }
    .test-header-minimal::before { content: ''; position: absolute; inset: 0; opacity: 0.08; background-image: url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23D4A84B' stroke-width='0.5'%3E%3Cpath d='M16 0 L32 16 L16 32 L0 16Z'/%3E%3Ccircle cx='16' cy='16' r='2'/%3E%3C/g%3E%3C/svg%3E"); pointer-events: none; }
    .test-header-minimal::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 0% 50%, rgba(212, 168, 75, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 100% 50%, rgba(212, 168, 75, 0.08) 0%, transparent 50%); pointer-events: none; }
    .test-header-minimal > * { position: relative; z-index: 1; }
    .header-brand { display: flex; align-items: center; gap: 10px; }
    .header-logo { height: 22px; width: auto; }
    .header-title-group { display: flex; flex-direction: column; }
    .header-main-title { font-size: 13px; font-weight: 700; color: white; margin: 0; letter-spacing: -0.3px; }
    .header-sub-info { font-size: 8px; color: #94a3b8; font-weight: 500; }
    .header-student-area { display: flex; gap: 12px; align-items: center; background: rgba(255,255,255,0.08); border-radius: 6px; padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1); }
    .student-field { display: flex; align-items: center; gap: 5px; }
    .student-field label { font-size: 7.5px; color: rgba(212,168,75,0.9); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .student-field-divider { width: 1px; height: 18px; background: rgba(255,255,255,0.15); }
    .field-box { min-width: 55px; height: 22px; background: rgba(255,255,255,0.95); border-radius: 3px; padding: 0 6px; display: inline-flex; align-items: center; font-size: 9px; font-weight: 600; color: #1e293b; border-bottom: 1.5px solid #d4a84b; }
    .field-name { min-width: 60px; }
    .score-box { min-width: 28px; text-align: center; justify-content: center; }
    .score-suffix { font-size: 9px; font-weight: 700; color: rgba(212,168,75,0.9); margin-left: 2px; }
    .answer-header-minimal { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 4px; margin-bottom: 4px; flex-shrink: 0; }
    .answer-label { font-size: 12px; font-weight: 900; color: #059669; background: white; padding: 3px 10px; border-radius: 4px; letter-spacing: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
    .answer-header-minimal .header-main-title { font-size: 12px; }
    .answer-header-minimal .header-sub-info { color: rgba(255,255,255,0.8); font-size: 8px; }
    .test-table-container { flex: 1; display: flex; flex-direction: column; min-height: 0; }
    .test-table-modern { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 10px; }
    .test-table-modern thead tr { background: #f1f5f9; }
    .test-table-modern th { font-weight: 600; font-size: 8px; color: #475569; padding: 4px 3px; text-align: center; border: 1px solid #e2e8f0; }
    .th-question { text-align: left; padding-left: 5px !important; }
    .test-table-modern tbody tr { height: 10.2mm; }
    .test-table-modern tbody tr:nth-child(even) { background: #fafbfc; }
    .test-table-modern td { border: 1px solid #e2e8f0; padding: 1px 3px; vertical-align: middle; font-size: 10px; line-height: 1.2; }
    .td-no { text-align: center; font-weight: 700; color: #64748b; font-size: 9px; background: #f8fafc; }
    .td-question { font-weight: 700; color: #1e293b; font-size: 10px; padding-left: 3px !important; }
    .td-answer { border-left: 2px solid #cbd5e1 !important; }
    .td-answer-filled { border-left: 2px solid #86efac !important; background: #fafffe !important; font-weight: 700; color: #166534; font-size: 10px; }
    .td-empty { background: #fafafa !important; }
    .spelling-hint { color: #7c3aed; font-weight: 700; font-size: 9px; margin-left: 2px; }
    .freq-dot { font-size: 6px; margin-left: 3px; vertical-align: middle; }
    .freq-high { color: #ef4444; }
    .freq-med { color: #f59e0b; }
    .answer-table-modern thead tr { background: #d1fae5; }
    .answer-table-modern th { color: #166534; }
    .answer-table-modern td { font-size: 11px; }
    .answer-table-modern .td-no { font-size: 9.5px; }
    .answer-table-modern .td-answer-filled { font-size: 11px; }
    .test-footer-minimal { display: flex; justify-content: space-between; align-items: center; padding: 3px 0 0; margin-top: 3px; border-top: 1px solid #e2e8f0; font-size: 7px; color: #94a3b8; flex-shrink: 0; }
    .test-footer-minimal span:nth-child(2) { font-weight: 600; letter-spacing: 1px; color: #64748b; }
    .answer-footer-minimal { display: flex; justify-content: space-between; align-items: center; padding: 3px 0 0; margin-top: 3px; border-top: 1px solid #10b981; font-size: 7px; color: #94a3b8; flex-shrink: 0; }
    .answer-footer-minimal span:nth-child(2) { font-weight: 600; letter-spacing: 1px; color: #059669; }
  `;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact summary bar */}
      <div className="flex items-center gap-3 text-xs px-1">
        <span className="font-bold text-muted-foreground">학생 <span className="text-foreground">{students.length}</span>명</span>
        <span className="text-muted-foreground">·</span>
        <span className="font-bold text-muted-foreground">오답 <span className="text-rose-500">{students.reduce((s, st) => s + st.uniqueWordCount, 0)}</span>개</span>
        <span className="text-muted-foreground">·</span>
        <span className="font-bold text-muted-foreground">평균 <span className="text-foreground">{students.length > 0 ? Math.round(students.reduce((s, st) => s + st.uniqueWordCount, 0) / students.length) : 0}</span>개</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <Filter className="w-3 h-3 mr-1 flex-shrink-0" />
            <SelectValue placeholder="반 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 반</SelectItem>
            {classList.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="학생 이름 검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs rounded-lg"
          />
          {searchQuery && (
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setSearchQuery("")}>
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Student List - ultra compact table style */}
      {filteredStudents.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 text-sm">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-30" />
          누적 오답 데이터가 없습니다
        </div>
      ) : (
        <div className="border border-border/50 rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_50px_40px_60px_70px] bg-muted/40 px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/30">
            <span>학생</span>
            <span className="text-center">반</span>
            <span className="text-center">오답</span>
            <span className="text-center">누적</span>
            <span className="text-right">액션</span>
          </div>

          {filteredStudents.map(student => {
            const isExpanded = expandedStudents.has(student.studentKey);
            return (
              <div key={student.studentKey} className="border-b border-border/20 last:border-0">
                {/* Student row */}
                <div
                  className="grid grid-cols-[1fr_50px_40px_60px_70px] items-center px-3 py-1.5 cursor-pointer hover:bg-accent/10 transition-colors text-xs"
                  onClick={() => toggleExpand(student.studentKey)}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold truncate">{student.studentName}</span>
                    <span className="text-[9px] text-muted-foreground font-mono opacity-60">{student.phoneLast4}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                  </div>
                  <span className="text-center text-muted-foreground">{student.studentClass}</span>
                  <span className="text-center font-bold text-rose-500">{student.uniqueWordCount}</span>
                  <span className="text-center text-muted-foreground">{student.totalWrongCount}회</span>
                  <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] gap-0.5"
                      onClick={() => { setSelectedStudent(student.studentKey); setShowTestPaper(true); }}>
                      <Printer className="w-3 h-3" /> 시험지
                    </Button>
                  </div>
                </div>

                {/* Expanded inline word list */}
                {isExpanded && (
                  <div className="bg-accent/5 px-3 pb-2">
                    <div className="flex flex-wrap gap-1 pt-1">
                      {student.words.map(w => (
                        <span key={w.word} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          w.count >= 3 ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/30"
                            : w.count >= 2 ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30"
                            : "bg-muted text-muted-foreground border-border/30"
                        }`}>
                          {w.word}
                          {w.meaning && <span className="text-[9px] text-muted-foreground ml-0.5">({w.meaning})</span>}
                          {w.count >= 2 && <span className="text-[8px] opacity-70">×{w.count}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Test Paper Modal */}
      {showTestPaper && selectedStudentData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTestPaper(false)}>
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="font-bold text-base">오답 시험지 인쇄</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedStudentData.studentName} ({selectedStudentData.phoneLast4}) · {selectedStudentData.uniqueWordCount}단어
              </p>
            </div>

            <div className="text-xs text-muted-foreground bg-accent/30 rounded-lg p-3 space-y-1">
              <p>• 뜻(한글) → 영어 철자쓰기 형식</p>
              <p>• 첫 글자 힌트 제공 · 2단 레이아웃</p>
              <p>• 오답 빈도 높은 단어 ● 표시</p>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 gap-1.5" onClick={() => handlePrint("test")}>
                <Printer className="w-4 h-4" /> 시험지 인쇄
              </Button>
              <Button variant="outline" className="flex-1 gap-1.5" onClick={() => handlePrint("answer")}>
                <Printer className="w-4 h-4" /> 정답지 인쇄
              </Button>
            </div>

            <Button variant="ghost" className="w-full text-xs" onClick={() => setShowTestPaper(false)}>
              닫기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CumulativeWrongWords;
