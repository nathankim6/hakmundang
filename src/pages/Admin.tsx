import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

interface AccessCode {
  id: number;
  code: string;
  created_at: string;
}

const Admin = () => {
  const [newCode, setNewCode] = useState("");
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const { toast } = useToast();

  const fetchAccessCodes = async () => {
    const { data, error } = await supabase
      .from("access_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "접근 코드 목록을 불러오는데 실패했습니다.",
      });
      return;
    }

    setAccessCodes(data || []);
  };

  useEffect(() => {
    fetchAccessCodes();
  }, []);

  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const { error } = await supabase
      .from("access_codes")
      .insert([{ code: newCode }]);

    if (error) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "접근 코드 추가에 실패했습니다.",
      });
      return;
    }

    toast({
      title: "성공",
      description: "새로운 접근 코드가 추가되었습니다.",
    });
    
    setNewCode("");
    fetchAccessCodes();
  };

  const handleDeleteCode = async (id: number) => {
    const { error } = await supabase
      .from("access_codes")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "접근 코드 삭제에 실패했습니다.",
      });
      return;
    }

    toast({
      title: "성공",
      description: "접근 코드가 삭제되었습니다.",
    });
    
    fetchAccessCodes();
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-white via-[#F1F0FB] to-[#E5DEFF]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-6">접근 코드 관리</h1>
          
          <form onSubmit={handleAddCode} className="flex gap-4 mb-8">
            <Input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="새로운 접근 코드 입력"
              className="flex-1"
            />
            <Button type="submit">추가</Button>
          </form>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">접근 코드 목록</h2>
            {accessCodes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <span className="font-mono text-lg">{code.code}</span>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteCode(code.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;