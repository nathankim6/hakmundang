import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSchools } from "@/hooks/useSchools";
import { Plus, Pencil, Trash2, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SchoolManagement = () => {
  const navigate = useNavigate();
  const { schools, isLoading, addSchool, updateSchool, deleteSchool } = useSchools();
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", logo_path: "" });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Reset form when editing school changes
  useEffect(() => {
    if (editingSchool) {
      setFormData({
        name: editingSchool.name,
        logo_path: editingSchool.logo_path || "",
      });
    } else {
      setFormData({ name: "", logo_path: "" });
    }
  }, [editingSchool]);

  const handleLogoUpload = async (file: File): Promise<string> => {
    setUploadingLogo(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `school-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("past_exams")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("past_exams").getPublicUrl(filePath);

      toast.success("로고가 업로드되었습니다.");
      return publicUrl;
    } catch (error: any) {
      toast.error("로고 업로드 실패: " + error.message);
      throw error;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("학교 이름을 입력해주세요.");
      return;
    }

    if (editingSchool) {
      // Update existing school
      await updateSchool.mutateAsync({
        id: editingSchool.id,
        name: formData.name,
        logo_path: formData.logo_path || null,
      });
      setEditingSchool(null);
    } else {
      // Add new school
      await addSchool.mutateAsync({
        name: formData.name,
        logo_path: formData.logo_path || null,
      });
    }

    setFormData({ name: "", logo_path: "" });
  };

  const handleCancel = () => {
    setEditingSchool(null);
    setFormData({ name: "", logo_path: "" });
  };

  const handleDeleteSchool = async (id: string) => {
    if (confirm("정말 이 학교를 삭제하시겠습니까?")) {
      await deleteSchool.mutateAsync(id);
      if (editingSchool?.id === id) {
        handleCancel();
      }
    }
  };

  const handleEditClick = (school: any) => {
    setEditingSchool({ ...school });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            학교 관리
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schools List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>학교 목록</CardTitle>
                <CardDescription>등록된 학교를 확인하고 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>로고</TableHead>
                        <TableHead>학교 이름</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            로딩 중...
                          </TableCell>
                        </TableRow>
                      ) : schools.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            등록된 학교가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        schools.map((school) => (
                          <TableRow 
                            key={school.id}
                            className={editingSchool?.id === school.id ? "bg-accent/50" : ""}
                          >
                            <TableCell>
                              {school.logo_path ? (
                                <img
                                  src={school.logo_path}
                                  alt={school.name}
                                  className="w-12 h-12 object-contain"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                                  로고 없음
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{school.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(school)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteSchool(school.id)}
                                  disabled={deleteSchool.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add/Edit Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {editingSchool ? "학교 정보 수정" : "새 학교 추가"}
                    </CardTitle>
                    <CardDescription>
                      {editingSchool ? "학교 정보를 수정합니다" : "새로운 학교를 등록합니다"}
                    </CardDescription>
                  </div>
                  {editingSchool && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">학교 이름</Label>
                  <Input
                    id="school-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="학교 이름을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-logo">로고</Label>
                  <Input
                    id="school-logo"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const logoUrl = await handleLogoUpload(file);
                        setFormData({ ...formData, logo_path: logoUrl });
                      }
                    }}
                    disabled={uploadingLogo}
                  />
                  {formData.logo_path && (
                    <div className="mt-2">
                      <img
                        src={formData.logo_path}
                        alt="로고 미리보기"
                        className="w-24 h-24 object-contain border rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      addSchool.isPending ||
                      updateSchool.isPending ||
                      uploadingLogo
                    }
                    className="flex-1"
                  >
                    {editingSchool ? (
                      <>
                        <Pencil className="h-4 w-4 mr-2" />
                        수정
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        추가
                      </>
                    )}
                  </Button>
                  {editingSchool && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                    >
                      취소
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolManagement;
