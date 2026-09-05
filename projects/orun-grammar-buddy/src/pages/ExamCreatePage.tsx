import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Shuffle, Plus, Minus, BookOpen, Layers } from "lucide-react";

interface QuestionStats {
  grammar_type: string;
  difficulty: string;
  count: number;
}

interface CategorySelection {
  grammarType: string;
  difficulties: {
    [key: string]: { selected: boolean; count: number; available: number };
  };
}

const ExamCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [grades, setGrades] = useState<string[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);
  const [categorySelections, setCategorySelections] = useState<CategorySelection[]>([]);

  // Fetch grades on mount
  useEffect(() => {
    const fetchGrades = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("grade");

      if (error) {
        console.error("Error fetching grades:", error);
        return;
      }

      const uniqueGrades = [...new Set(data.map((q) => q.grade))].filter(Boolean).sort();
      setGrades(uniqueGrades);
    };

    fetchGrades();
  }, []);

  // Fetch question stats when grade changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedGrade || selectedGrade === "all") {
        setQuestionStats([]);
        setCategorySelections([]);
        return;
      }

      const { data, error } = await supabase
        .from("questions")
        .select("grammar_type, difficulty")
        .eq("grade", selectedGrade);

      if (error) {
        console.error("Error fetching stats:", error);
        return;
      }

      // Aggregate stats
      const statsMap = new Map<string, QuestionStats>();
      data.forEach((q) => {
        const key = `${q.grammar_type}-${q.difficulty}`;
        const existing = statsMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          statsMap.set(key, {
            grammar_type: q.grammar_type,
            difficulty: q.difficulty,
            count: 1,
          });
        }
      });

      const stats = Array.from(statsMap.values());
      setQuestionStats(stats);

      // Initialize category selections
      const grammarTypes = [...new Set(stats.map((s) => s.grammar_type))].sort();
      const difficulties = ["상", "중", "하"];

      const selections: CategorySelection[] = grammarTypes.map((gt) => {
        const diffMap: CategorySelection["difficulties"] = {};
        difficulties.forEach((diff) => {
          const stat = stats.find((s) => s.grammar_type === gt && s.difficulty === diff);
          diffMap[diff] = {
            selected: false,
            count: 0,
            available: stat?.count || 0,
          };
        });
        return { grammarType: gt, difficulties: diffMap };
      });

      setCategorySelections(selections);
    };

    fetchStats();
  }, [selectedGrade]);

  const toggleCategory = (grammarType: string, difficulty: string) => {
    setCategorySelections((prev) =>
      prev.map((cat) => {
        if (cat.grammarType !== grammarType) return cat;
        const diff = cat.difficulties[difficulty];
        return {
          ...cat,
          difficulties: {
            ...cat.difficulties,
            [difficulty]: {
              ...diff,
              selected: !diff.selected,
              count: !diff.selected ? Math.min(diff.available, 5) : 0,
            },
          },
        };
      })
    );
  };

  const updateCount = (grammarType: string, difficulty: string, count: number) => {
    setCategorySelections((prev) =>
      prev.map((cat) => {
        if (cat.grammarType !== grammarType) return cat;
        const diff = cat.difficulties[difficulty];
        const newCount = Math.max(0, Math.min(diff.available, count));
        return {
          ...cat,
          difficulties: {
            ...cat.difficulties,
            [difficulty]: {
              ...diff,
              count: newCount,
              selected: newCount > 0,
            },
          },
        };
      })
    );
  };

  const totalSelectedCount = useMemo(() => {
    return categorySelections.reduce((total, cat) => {
      return total + Object.values(cat.difficulties).reduce((sum, d) => sum + d.count, 0);
    }, 0);
  }, [categorySelections]);

  const selectedCategories = useMemo(() => {
    return categorySelections.filter((cat) =>
      Object.values(cat.difficulties).some((d) => d.count > 0)
    );
  }, [categorySelections]);

  const generateExamCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateExam = async () => {
    if (!title.trim()) {
      toast({
        title: "시험 제목을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (totalSelectedCount === 0) {
      toast({
        title: "문제를 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const allQuestionIds: string[] = [];

      // Fetch and randomly select questions for each category/difficulty
      for (const cat of categorySelections) {
        for (const [difficulty, config] of Object.entries(cat.difficulties)) {
          if (config.count === 0) continue;

          const { data: questions, error } = await supabase
            .from("questions")
            .select("id")
            .eq("grade", selectedGrade)
            .eq("grammar_type", cat.grammarType)
            .eq("difficulty", difficulty);

          if (error) throw error;

          if (questions && questions.length > 0) {
            const shuffled = [...questions].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, config.count);
            allQuestionIds.push(...selected.map((q) => q.id));
          }
        }
      }

      if (allQuestionIds.length === 0) {
        toast({
          title: "선택된 문제가 없습니다",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Shuffle all selected questions
      const shuffledIds = [...allQuestionIds].sort(() => Math.random() - 0.5);

      // Generate unique exam code
      let examCode = generateExamCode();
      let codeExists = true;
      let attempts = 0;

      while (codeExists && attempts < 10) {
        const { data: existing } = await supabase
          .from("exams")
          .select("id")
          .eq("exam_code", examCode)
          .maybeSingle();

        if (!existing) {
          codeExists = false;
        } else {
          examCode = generateExamCode();
          attempts++;
        }
      }

      // Create exam
      const { error: insertError } = await supabase.from("exams").insert({
        title: title.trim(),
        exam_code: examCode,
        grade: selectedGrade,
        grammar_type: selectedCategories.map((c) => c.grammarType).join(", "),
        difficulty: null,
        question_count: shuffledIds.length,
        question_ids: shuffledIds,
      });

      if (insertError) throw insertError;

      toast({
        title: "시험이 생성되었습니다!",
        description: `${title} - ${shuffledIds.length}문제`,
      });
      
      // Navigate to exams page
      navigate("/exams");
    } catch (error) {
      console.error("Error creating exam:", error);
      toast({
        title: "시험 생성에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "상":
        return "bg-red-100 text-red-700 border-red-200";
      case "중":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "하":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">시험 생성</h1>
              <p className="text-muted-foreground">
                문법 카테고리와 난이도별로 문제를 선택하세요
              </p>
            </div>
          </div>

          <div className="space-y-6">
              {/* Step 1: 기본 정보 */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <CardTitle className="text-lg">기본 정보</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">시험 제목</Label>
                      <Input
                        id="title"
                        placeholder="예: 중1 be동사 테스트"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>학년 선택</Label>
                      <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                        <SelectTrigger>
                          <SelectValue placeholder="학년을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: 문제 선택 */}
              {selectedGrade && categorySelections.length > 0 && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <CardTitle className="text-lg">문제 선택</CardTitle>
                        <CardDescription>
                          카테고리별 난이도를 선택하고 개수를 설정하세요
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {categorySelections.map((cat) => (
                      <div
                        key={cat.grammarType}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="font-medium">{cat.grammarType}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {(["상", "중", "하"] as const).map((difficulty) => {
                            const config = cat.difficulties[difficulty];
                            if (!config || config.available === 0) return null;

                            return (
                              <div
                                key={difficulty}
                                className={`border rounded-lg p-3 transition-all ${
                                  config.selected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-muted-foreground"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={config.selected}
                                      onCheckedChange={() =>
                                        toggleCategory(cat.grammarType, difficulty)
                                      }
                                    />
                                    <Badge
                                      variant="outline"
                                      className={getDifficultyColor(difficulty)}
                                    >
                                      {difficulty}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {config.available}개
                                  </span>
                                </div>
                                {config.selected && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        updateCount(
                                          cat.grammarType,
                                          difficulty,
                                          config.count - 1
                                        )
                                      }
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      value={config.count}
                                      onChange={(e) =>
                                        updateCount(
                                          cat.grammarType,
                                          difficulty,
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="h-8 w-16 text-center"
                                      min={0}
                                      max={config.available}
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        updateCount(
                                          cat.grammarType,
                                          difficulty,
                                          config.count + 1
                                        )
                                      }
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Step 3: 확인 및 생성 */}
              {selectedGrade && categorySelections.length > 0 && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <CardTitle className="text-lg">확인 및 생성</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">총 문제 수</span>
                        <span className="text-2xl font-bold text-primary">
                          {totalSelectedCount}문제
                        </span>
                      </div>
                      {selectedCategories.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">
                            선택된 카테고리
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((cat) => {
                              const difficulties = Object.entries(cat.difficulties)
                                .filter(([_, c]) => c.count > 0)
                                .map(([d, c]) => `${d}(${c.count})`)
                                .join(", ");
                              return (
                                <Badge key={cat.grammarType} variant="secondary">
                                  {cat.grammarType}: {difficulties}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shuffle className="w-4 h-4" />
                      <span>문제는 랜덤으로 출제됩니다</span>
                    </div>

                    <Button
                      onClick={handleCreateExam}
                      disabled={isLoading || totalSelectedCount === 0 || !title.trim()}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? "생성 중..." : `시험 생성하기 (${totalSelectedCount}문제)`}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {selectedGrade && categorySelections.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>선택한 학년에 등록된 문제가 없습니다</p>
                  </CardContent>
                </Card>
              )}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExamCreatePage;
