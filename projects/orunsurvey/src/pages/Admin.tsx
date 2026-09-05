import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogOut, Download, RefreshCw, Filter, Clock, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import type { Database } from "@/integrations/supabase/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

type SurveyResponse = Database['public']['Tables']['survey_responses']['Row'];

const Admin = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showJoinersOnly, setShowJoinersOnly] = useState(false);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error("Error fetching responses:", error);
      toast({
        title: "데이터 로드 실패",
        description: "응답 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchResponses();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === "101100") {
      setIsAuthenticated(true);
      toast({
        title: "로그인 성공",
        description: "관리자 페이지에 접속하였습니다.",
      });
    } else {
      toast({
        title: "로그인 실패",
        description: "비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    toast({
      title: "로그아웃",
      description: "관리자 페이지에서 로그아웃되었습니다.",
    });
  };

  const handleExport = () => {
    const filteredData = showJoinersOnly 
      ? responses.filter(r => r.join_class === "예")
      : responses;

    const csv = [
      ["학교", "이름", "합류여부", "합류기타", "전형준비", "가능시간대", "기타의견", "제출시간"],
      ...filteredData.map(r => [
        r.school,
        r.name,
        r.join_class,
        r.join_class_other || "",
        r.exam_type,
        formatTimeSlots(r.time_slots),
        r.additional_comments || "",
        new Date(r.created_at).toLocaleString('ko-KR')
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `설문조사_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "데이터 내보내기",
      description: "CSV 파일이 다운로드되었습니다.",
    });
  };

  const handleRefresh = () => {
    fetchResponses();
    toast({
      title: "새로고침",
      description: "데이터를 최신 상태로 업데이트했습니다.",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 응답을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from('survey_responses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "응답이 성공적으로 삭제되었습니다.",
      });

      fetchResponses();
    } catch (error) {
      console.error("Error deleting response:", error);
      toast({
        title: "삭제 실패",
        description: "응답 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const formatTimeSlots = (timeSlots: any) => {
    if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) return "선택 안 함";
    
    return timeSlots.map((slot: any) => {
      const formatHour = (hour: number) => {
        if (hour < 12) return `${hour}시`;
        if (hour === 12) return `12시`;
        return `${hour - 12}시`;
      };
      return `${slot.day} ${formatHour(slot.start)}-${formatHour(slot.end + 1)}`;
    }).join(", ");
  };

  const filteredResponses = showJoinersOnly 
    ? responses.filter(r => r.join_class === "예")
    : responses;

  const stats = {
    total: responses.length,
    joiners: responses.filter(r => r.join_class === "예").length,
    examTypeNaesin: responses.filter(r => r.exam_type === "내신대비").length,
    examTypeJeongsi: responses.filter(r => r.exam_type === "정시만").length,
    examTypeBoth: responses.filter(r => r.exam_type === "둘다준비").length,
  };

  // Calculate time slot statistics
  const getTimeSlotStats = () => {
    const saturdaySlots: { [key: number]: Set<string> } = {};
    const sundaySlots: { [key: number]: Set<string> } = {};
    
    // Initialize all hours
    for (let i = 9; i <= 22; i++) {
      saturdaySlots[i] = new Set();
      sundaySlots[i] = new Set();
    }
    
    responses.forEach(response => {
      const timeSlots = response.time_slots as any[];
      if (Array.isArray(timeSlots)) {
        timeSlots.forEach((slot: any) => {
          const identifier = `${response.name}-${response.school}`;
          if (slot.day === "토요일") {
            for (let hour = slot.start; hour <= slot.end; hour++) {
              if (saturdaySlots[hour]) {
                saturdaySlots[hour].add(identifier);
              }
            }
          } else if (slot.day === "일요일") {
            for (let hour = slot.start; hour <= slot.end; hour++) {
              if (sundaySlots[hour]) {
                sundaySlots[hour].add(identifier);
              }
            }
          }
        });
      }
    });
    
    const formatHour = (hour: number) => {
      if (hour < 12) return `${hour}시`;
      if (hour === 12) return `12시`;
      return `${hour}시`;
    };
    
    const saturdayData = Object.entries(saturdaySlots).map(([hour, students]) => ({
      hour: formatHour(Number(hour)),
      count: students.size,
      students: Array.from(students)
    }));
    
    const sundayData = Object.entries(sundaySlots).map(([hour, students]) => ({
      hour: formatHour(Number(hour)),
      count: students.size,
      students: Array.from(students)
    }));
    
    return { saturdayData, sundayData };
  };

  const { saturdayData, sundayData } = getTimeSlotStats();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-100 font-semibold mb-2">{data.hour}</p>
          <p className="text-slate-300 text-sm mb-2">가능 인원: {data.count}명</p>
          {data.students && data.students.length > 0 && (
            <div className="border-t border-slate-600 pt-2 mt-2">
              <p className="text-slate-400 text-xs mb-1">가능한 학생:</p>
              <ul className="text-slate-300 text-xs space-y-1">
                {data.students.map((student: string, idx: number) => (
                  <li key={idx}>• {student}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-['Playfair_Display'] font-bold mb-2">
              <span className="text-accent">옳은영어</span>
            </h1>
            <p className="text-slate-400 text-sm">정시반 설문 관리자</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                관리자 비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="bg-slate-900 border-slate-600 text-slate-100 text-center tracking-widest"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-accent to-accent-hover text-accent-foreground py-6"
              size="lg"
            >
              로그인
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-['Playfair_Display'] font-bold">
              <span className="text-accent">옳은영어</span>
            </h1>
            <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
              ADMIN
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport} 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary to-primary-light border-0 text-primary-foreground">
            <p className="text-sm opacity-90 mb-2">총 응답 수</p>
            <p className="text-4xl font-bold">{stats.total}</p>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <p className="text-sm text-slate-400 mb-2">합류 신청</p>
            <p className="text-4xl font-bold text-green-400">
              {stats.joiners}
            </p>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <p className="text-sm text-slate-400 mb-2">내신대비만</p>
            <p className="text-4xl font-bold text-purple-400">
              {stats.examTypeNaesin}
            </p>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <p className="text-sm text-slate-400 mb-2">정시만</p>
            <p className="text-4xl font-bold text-blue-400">
              {stats.examTypeJeongsi}
            </p>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <p className="text-sm text-slate-400 mb-2">둘 다 준비</p>
            <p className="text-4xl font-bold text-cyan-400">
              {stats.examTypeBoth}
            </p>
          </Card>
        </div>

        {/* Time Slot Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Saturday Chart */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold text-slate-100">토요일 시간대별 가능 인원</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={saturdayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {saturdayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count > 5 ? '#10b981' : entry.count > 2 ? '#3b82f6' : '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Sunday Chart */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold text-slate-100">일요일 시간대별 가능 인원</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sundayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {sundayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count > 5 ? '#10b981' : entry.count > 2 ? '#3b82f6' : '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Responses Table */}
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100">설문 응답 목록</h2>
                <p className="text-sm text-slate-400 mt-1">최근 제출된 설문 응답을 확인할 수 있습니다</p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="filter-joiners"
                  checked={showJoinersOnly}
                  onCheckedChange={(checked) => setShowJoinersOnly(checked === true)}
                />
                <Label 
                  htmlFor="filter-joiners" 
                  className="text-slate-300 cursor-pointer flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  합류 신청자만 보기
                </Label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-300">학교</TableHead>
                  <TableHead className="text-slate-300">이름</TableHead>
                  <TableHead className="text-slate-300">합류여부</TableHead>
                  <TableHead className="text-slate-300">전형준비</TableHead>
                  <TableHead className="text-slate-300">가능시간대</TableHead>
                  <TableHead className="text-slate-300">기타의견</TableHead>
                  <TableHead className="text-slate-300">제출시간</TableHead>
                  <TableHead className="text-slate-300">삭제</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                      {loading ? "데이터를 불러오는 중..." : "제출된 응답이 없습니다."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResponses.map((response) => (
                    <TableRow key={response.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="text-slate-300">{response.school}</TableCell>
                      <TableCell className="font-medium text-slate-100">{response.name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            response.join_class === "예"
                              ? "bg-green-500/20 text-green-300"
                              : response.join_class === "아니오"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {response.join_class}
                          {response.join_class_other && ` (${response.join_class_other})`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            response.exam_type === "내신대비"
                              ? "bg-purple-500/20 text-purple-300"
                              : response.exam_type === "정시만"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-cyan-500/20 text-cyan-300"
                          }`}
                        >
                          {response.exam_type}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm max-w-xs">
                        {formatTimeSlots(response.time_slots)}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm max-w-xs truncate">
                        {response.additional_comments || "-"}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {new Date(response.created_at).toLocaleString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(response.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
