import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { convertDbToAppFormat, ReportCardData } from "@/integrations/supabase/reportService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X, Minus, Loader2 } from "lucide-react";
import {
  AnswerStatus,
  SubmissionAnswer,
  submitStudentAnswers,
} from "@/hooks/useStudentSubmissions";

const StudentSubmit: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<ReportCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [name, setName] = useState("");
  const [score, setScore] = useState<string>("");
  const [statuses, setStatuses] = useState<Record<string, AnswerStatus>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!reportId) return;
    (async () => {
      const { data, error } = await supabase
        .from("report_cards")
        .select("*")
        .eq("id", reportId)
        .maybeSingle();
      if (error || !data) {
        toast.error("리포트를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }
      const converted = convertDbToAppFormat(data);
      setReport(converted);
      setSchool(converted.school || "");
      setGrade(converted.grade || "");
      const initial: Record<string, AnswerStatus> = {};
      converted.problemTypes.forEach((p) => {
        initial[p.id] = "correct";
      });
      setStatuses(initial);
      setLoading(false);
    })();
  }, [reportId]);

  const sortedProblems = useMemo(() => {
    if (!report) return [];
    return [...report.problemTypes].sort((a, b) => {
      const na = parseInt(a.name.match(/\d+/)?.[0] || "0", 10);
      const nb = parseInt(b.name.match(/\d+/)?.[0] || "0", 10);
      return na - nb;
    });
  }, [report]);

  const toggleObjective = (id: string) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === "wrong" ? "correct" : "wrong",
    }));
  };

  const setSubjective = (id: string, s: AnswerStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: s }));
  };

  const handleSubmit = async () => {
    if (!reportId) return;
    if (!school.trim() || !grade.trim() || !name.trim()) {
      toast.error("학교/학년/이름을 입력해주세요.");
      return;
    }
    if (!score.trim() || isNaN(Number(score))) {
      toast.error("점수를 숫자로 입력해주세요.");
      return;
    }
    setSubmitting(true);
    const answers: SubmissionAnswer[] = Object.entries(statuses).map(
      ([problem_id, status]) => {
        const entry: SubmissionAnswer = { problem_id, status };
        if (status !== "correct") {
          const r = (reasons[problem_id] || "").trim();
          if (r) entry.reason = r.slice(0, 500);
        }
        return entry;
      }
    );
    const { error } = await submitStudentAnswers({
      report_id: reportId,
      school: school.trim(),
      grade: grade.trim(),
      student_name: name.trim(),
      score: Number(score),
      answers,
    });
    setSubmitting(false);
    if (error) {
      toast.error("제출에 실패했습니다: " + error.message);
      return;
    }
    setDone(true);
  };

  if (loading) {
    return (
      <div className="orun-stage flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="orun-stage flex items-center justify-center">
        <p className="text-slate-500">리포트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="orun-stage flex items-center justify-center px-4">
        <div className="orun-glass p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-400/20 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">제출 완료</h2>
          <p className="text-slate-600">선생님에게 결과가 전달되었습니다.</p>
          <p className="text-sm text-slate-400 mt-6">이 창은 닫으셔도 됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orun-stage py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="orun-glass p-6 mb-6">
          <p className="text-[11px] tracking-[0.4em] font-semibold text-[#F5C64F] mb-2">
            학생 자가 채점
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {report.examScope || "시험 채점"}
          </h1>
          <p className="text-sm text-slate-500">
            {report.school} · {report.grade}
          </p>
        </div>

        {/* 학생 정보 */}
        <div className="orun-glass p-6 mb-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-2">내 정보</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="school">학교</Label>
              <Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="grade">학년</Label>
              <Input id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="name">이름</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
            </div>
            <div>
              <Label htmlFor="score">점수</Label>
              <Input
                id="score"
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="예: 85"
              />
            </div>
          </div>
        </div>

        {/* 문항 체크 */}
        <div className="orun-glass p-6 mb-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">문항 채점</h2>
            <p className="text-xs text-slate-500">
              기본은 <span className="text-emerald-600 font-semibold">맞음</span>, 틀린 것만 눌러주세요
            </p>
          </div>

          <div className="space-y-2">
            {sortedProblems.map((p, idx) => {
              const st = statuses[p.id] || "correct";
              const isSubjective = p.questionType === "subjective";
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-slate-900/10 bg-white/70 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900/5 text-slate-700 text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {p.category} · {isSubjective ? "서답형" : "객관식"}
                      </p>
                    </div>
                  </div>

                  {isSubjective ? (
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSubjective(p.id, "correct")}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border transition ${
                          st === "correct"
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-slate-900/5 text-slate-500 border-slate-900/10"
                        }`}
                        aria-label="맞음"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubjective(p.id, "partial")}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border transition ${
                          st === "partial"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-slate-900/5 text-slate-500 border-slate-900/10"
                        }`}
                        aria-label="부분점수"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubjective(p.id, "wrong")}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border transition ${
                          st === "wrong"
                            ? "bg-rose-500 text-white border-rose-500"
                            : "bg-slate-900/5 text-slate-500 border-slate-900/10"
                        }`}
                        aria-label="틀림"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleObjective(p.id)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition shrink-0 ${
                        st === "wrong"
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-emerald-400/15 text-emerald-300 border-emerald-400/30"
                      }`}
                      aria-label={st === "wrong" ? "틀림" : "맞음"}
                    >
                      {st === "wrong" ? <X className="w-6 h-6" /> : <Check className="w-6 h-6" />}
                    </button>
                  )}
                  </div>
                  {(st === "wrong" || st === "partial") && (
                    <div className="pt-1">
                      <Label
                        htmlFor={`reason-${p.id}`}
                        className="text-[11px] font-semibold text-slate-600 mb-1 block"
                      >
                        틀린 이유 <span className="text-slate-400 font-normal">(선택, 스스로 되돌아보기)</span>
                      </Label>
                      <Textarea
                        id={`reason-${p.id}`}
                        value={reasons[p.id] || ""}
                        onChange={(e) =>
                          setReasons((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        placeholder="예: 지문의 반전 표현을 놓쳤음 / 어휘 뜻 헷갈림 / 시간 부족으로 찍음"
                        maxLength={500}
                        className="min-h-[64px] text-sm bg-white/75 border-slate-900/10 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          size="lg"
          className="w-full h-14 text-base font-bold bg-[#F5C64F] hover:bg-[#FFD666] text-[#2B3642] rounded-2xl shadow-[0_12px_32px_rgba(245,198,79,0.26)]"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "제출하기"}
        </Button>
      </div>
    </div>
  );
};

export default StudentSubmit;