import { useState, useEffect } from "react";
import { Plus, Trash2, Shield, Key, Copy, Check, RefreshCw, User, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AccessCode {
  id: string;
  code: string;
  name: string;
  is_admin: boolean;
  is_active: boolean;
  role: UserRole;
  created_at: string;
  last_used_at: string | null;
}

const roleConfig = {
  admin: { label: "관리자", icon: Shield, className: "bg-primary" },
  teacher: { label: "선생님", icon: User, className: "bg-secondary" },
  student: { label: "학생", icon: GraduationCap, className: "bg-accent" },
};

export default function AccessCodes() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("teacher");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();

  // 관리자 권한 체크
  useEffect(() => {
    if (session && !session.isAdmin) {
      toast({
        title: "접근 권한 없음",
        description: "관리자만 접근할 수 있습니다.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [session, navigate, toast]);

  // 코드 목록 불러오기
  const fetchCodes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("access_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "오류",
        description: "코드 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } else {
      setCodes((data || []) as AccessCode[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  // 랜덤 코드 생성
  const generateRandomCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setNewCode(code);
  };

  // 새 코드 추가
  const handleAddCode = async () => {
    if (!newName.trim() || !newCode.trim()) {
      toast({
        title: "입력 오류",
        description: "이름과 코드를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 코드 중복 체크
    const { data: existing } = await supabase
      .from("access_codes")
      .select("id")
      .eq("code", newCode.trim())
      .maybeSingle();

    if (existing) {
      toast({
        title: "중복된 코드",
        description: "이미 존재하는 코드입니다.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("access_codes")
      .insert({
        code: newCode.trim(),
        name: newName.trim(),
        is_admin: newRole === "admin",
        role: newRole,
      });

    if (error) {
      toast({
        title: "오류",
        description: "코드 추가에 실패했습니다.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "성공",
        description: "새 접속 코드가 추가되었습니다.",
      });
      setIsAddDialogOpen(false);
      setNewName("");
      setNewCode("");
      setNewRole("teacher");
      fetchCodes();
    }
  };

  // 코드 활성화/비활성화
  const toggleCodeActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("access_codes")
      .update({ is_active: !currentActive })
      .eq("id", id);

    if (error) {
      toast({
        title: "오류",
        description: "상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    } else {
      fetchCodes();
    }
  };

  // 코드 삭제
  const deleteCode = async (id: string, isAdmin: boolean) => {
    if (isAdmin) {
      toast({
        title: "삭제 불가",
        description: "관리자 코드는 삭제할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("access_codes")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "오류",
        description: "삭제에 실패했습니다.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "삭제됨",
        description: "접속 코드가 삭제되었습니다.",
      });
      fetchCodes();
    }
  };

  // 코드 복사
  const copyCode = (id: string, code: string, name: string) => {
    const text = `[Pcube] ${name} 학생의 접속 코드는 ${code} 입니다.\n접속 주소: https://yonglish.co.kr`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "복사됨",
      description: "접속 주소와 코드가 클립보드에 복사되었습니다.",
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ko-KR");
  };

  if (!session?.isAdmin) {
    return null;
  }

  const teacherCodes = codes.filter(c => c.role === "teacher" || c.role === "admin");
  const studentCodes = codes.filter(c => c.role === "student");

  const renderCodeTable = (codeList: AccessCode[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>코드</TableHead>
          <TableHead>역할</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>마지막 사용</TableHead>
          <TableHead className="text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {codeList.map((code) => {
          const RoleIcon = roleConfig[code.role]?.icon || User;
          return (
            <TableRow key={code.id}>
              <TableCell className="font-medium">{code.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded font-mono">
                    {code.code}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyCode(code.id, code.code, code.name)}
                    title="홈페이지 주소와 접속코드를 함께 복사합니다"
                  >
                    {copiedId === code.id ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={roleConfig[code.role]?.className || "bg-secondary"}>
                  <RoleIcon className="w-3 h-3 mr-1" />
                  {roleConfig[code.role]?.label || code.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Switch
                  checked={code.is_active}
                  onCheckedChange={() => toggleCodeActive(code.id, code.is_active)}
                  disabled={code.is_admin}
                />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(code.last_used_at)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteCode(code.id, code.is_admin)}
                  disabled={code.is_admin}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Key}
        title="접속 코드 관리"
        description="선생님/학생 접속 코드 발급 및 관리"
        showDate={false}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/10 text-white hover:bg-white/20" onClick={fetchCodes}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              새로고침
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              코드 발급
            </Button>
          </div>
        }
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 접속 코드 발급</DialogTitle>
            <DialogDescription>
              새로운 접속 코드를 생성합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>역할</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">선생님</SelectItem>
                  <SelectItem value="student">학생</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>이름</Label>
              <Input
                placeholder={newRole === "student" ? "예: 김민준" : "예: 김선생님"}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>접속 코드</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="6자리 숫자"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  maxLength={6}
                  className="font-mono tracking-widest"
                />
                <Button variant="outline" onClick={generateRandomCode}>
                  <Key className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddCode}>발급</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 코드 목록 - 탭으로 구분 */}
      <Tabs defaultValue="teachers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teachers">
            선생님/관리자 ({teacherCodes.length})
          </TabsTrigger>
          <TabsTrigger value="students">
            학생 ({studentCodes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>선생님/관리자 코드</CardTitle>
              <CardDescription>교사와 관리자 접속 코드 목록</CardDescription>
              <p className="text-xs text-muted-foreground mt-1">
                💡 복사 버튼을 누르면 홈페이지 주소(yonglish.co.kr)와 접속코드가 함께 복사되어, 학생에게 간편하게 전송할 수 있습니다.
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  로딩 중...
                </div>
              ) : teacherCodes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  발급된 코드가 없습니다.
                </div>
              ) : (
                renderCodeTable(teacherCodes)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>학생 코드</CardTitle>
              <CardDescription>학생 접속 코드 목록 - 학생은 숙제 제출만 가능</CardDescription>
              <p className="text-xs text-muted-foreground mt-1">
                💡 복사 버튼을 누르면 홈페이지 주소(yonglish.co.kr)와 접속코드가 함께 복사되어, 학생에게 간편하게 전송할 수 있습니다.
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  로딩 중...
                </div>
              ) : studentCodes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  발급된 학생 코드가 없습니다.
                </div>
              ) : (
                renderCodeTable(studentCodes)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
