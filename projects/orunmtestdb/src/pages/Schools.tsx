import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, ArrowLeft, Building2, Image, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useSchools,
  useCreateSchool,
  useUpdateSchool,
  useDeleteSchool,
  School,
} from "@/hooks/useSchools";

const Schools = () => {
  const navigate = useNavigate();
  const { data: schools = [], isLoading } = useSchools();
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const deleteSchool = useDeleteSchool();

  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchoolId, setDeletingSchoolId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ school_name: "", logo_path: "" });
  const [showForm, setShowForm] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadingFile(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('school-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setFormData({ ...formData, logo_path: filePath });
      
      toast({
        title: "파일 업로드 완료",
        description: "로고 파일이 성공적으로 업로드되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "파일 업로드 실패",
        description: error.message || "파일 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreate = () => {
    createSchool.mutate(
      {
        school_name: formData.school_name,
        logo_path: formData.logo_path || null,
      },
      {
        onSuccess: () => {
          setFormData({ school_name: "", logo_path: "" });
          setEditingSchool(null);
          setSelectedFile(null);
        },
      }
    );
  };

  const handleEdit = () => {
    if (editingSchool) {
      updateSchool.mutate(
        {
          id: editingSchool.id,
          school_name: formData.school_name,
          logo_path: formData.logo_path || null,
        },
        {
          onSuccess: () => {
            setEditingSchool(null);
            setFormData({ school_name: "", logo_path: "" });
            setSelectedFile(null);
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (deletingSchoolId) {
      deleteSchool.mutate(deletingSchoolId);
      setDeletingSchoolId(null);
    }
  };

  const openEditDialog = (school: School) => {
    setEditingSchool(school);
    setFormData({
      school_name: school.school_name,
      logo_path: school.logo_path || "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin")}
                className="text-primary-foreground hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">학교 관리</h1>
                <p className="text-sm opacity-90">학교 등록, 수정, 삭제 및 로고 관리</p>
              </div>
            </div>
              <Button
                onClick={() => {
                  setEditingSchool(null);
                  setFormData({ school_name: "", logo_path: "" });
                  setSelectedFile(null);
                  setShowForm(true);
                }}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 학교 등록
              </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card rounded-lg shadow-lg overflow-hidden">
              <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-20">번호</TableHead>
                  <TableHead className="w-24">로고</TableHead>
                  <TableHead>학교명</TableHead>
                  <TableHead className="w-96">로고 경로</TableHead>
                  <TableHead className="w-40 text-center">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school, index) => (
                  <TableRow key={school.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {school.logo_path ? (
                        <div className="w-10 h-10 flex items-center justify-center">
                          <img
                            src={
                              // 업로드된 파일인지 확인 (타임스탬프-랜덤 패턴 또는 UUID 패턴)
                              /^\d+-.+\..+$/.test(school.logo_path) || school.logo_path.includes('/')
                                ? `${supabase.storage.from('school-logos').getPublicUrl(school.logo_path).data.publicUrl}`
                                : `/src/assets/school-logos/${school.logo_path}`
                            }
                            alt={`${school.school_name} 로고`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {school.school_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {school.logo_path || "로고 없음"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(school)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingSchoolId(school.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {schools.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">등록된 학교가 없습니다.</p>
              </div>
            )}
            </div>

            {/* 등록/수정 폼 */}
            {showForm && (
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{editingSchool ? "학교 수정" : "새 학교 등록"}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowForm(false);
                        setEditingSchool(null);
                        setFormData({ school_name: "", logo_path: "" });
                        setSelectedFile(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="school_name">학교명</Label>
                    <Input
                      id="school_name"
                      value={formData.school_name}
                      onChange={(e) =>
                        setFormData({ ...formData, school_name: e.target.value })
                      }
                      placeholder="예: 강남중학교"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo_upload">로고 파일 업로드 (선택사항)</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          id="logo_upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          disabled={uploadingFile}
                          className="flex-1"
                        />
                        {uploadingFile && (
                          <span className="text-sm text-muted-foreground">업로드 중...</span>
                        )}
                      </div>
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          선택된 파일: {selectedFile.name}
                        </p>
                      )}
                      {formData.logo_path && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-16 border rounded flex items-center justify-center bg-muted">
                            <img
                              src={
                                // 업로드된 파일인지 확인
                                /^\d+-.+\..+$/.test(formData.logo_path) || formData.logo_path.includes('/')
                                  ? `${supabase.storage.from('school-logos').getPublicUrl(formData.logo_path).data.publicUrl}`
                                  : `/src/assets/school-logos/${formData.logo_path}`
                              }
                              alt="로고 미리보기"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground flex-1">
                            {formData.logo_path}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingSchool(null);
                        setFormData({ school_name: "", logo_path: "" });
                        setSelectedFile(null);
                      }}
                      className="flex-1"
                    >
                      취소
                    </Button>
                    <Button
                      type="button"
                      onClick={editingSchool ? handleEdit : handleCreate}
                      className="flex-1"
                    >
                      {editingSchool ? "수정" : "등록"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deletingSchoolId}
        onOpenChange={() => setDeletingSchoolId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 학교가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Schools;
