import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatKSTLocale, formatKSTLocaleDateTime } from "@/utils/koreanTime";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Pin, Edit2, Trash2, Megaphone, ChevronDown, ImagePlus, X, Loader2, Paperclip, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";

export default function Announcements() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const ownerFilter = useOwnerFilter();

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [fileAttachments, setFileAttachments] = useState<{name: string; url: string; size: number}[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 20;
  const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileAttachmentUpload = async (files: FileList) => {
    const newFiles = Array.from(files);
    if (fileAttachments.length + newFiles.length > MAX_FILES) {
      toast({ title: "파일 개수 초과", description: `최대 ${MAX_FILES}개까지 첨부할 수 있습니다.`, variant: "destructive" });
      return;
    }
    const currentTotal = fileAttachments.reduce((sum, f) => sum + f.size, 0);
    const newTotal = newFiles.reduce((sum, f) => sum + f.size, 0);
    if (currentTotal + newTotal > MAX_TOTAL_SIZE) {
      toast({ title: "용량 초과", description: "첨부파일 총 용량은 500MB를 초과할 수 없습니다.", variant: "destructive" });
      return;
    }
    setUploadingFiles(true);
    try {
      const uploaded: {name: string; url: string; size: number}[] = [];
      for (const file of newFiles) {
        const ext = file.name.split(".").pop() || "file";
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("announcement-files").upload(safeName, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("announcement-files").getPublicUrl(safeName);
        uploaded.push({ name: file.name, url: urlData.publicUrl, size: file.size });
      }
      setFileAttachments((prev) => [...prev, ...uploaded]);
    } catch (e: any) {
      toast({ title: "업로드 실패", description: e.message, variant: "destructive" });
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("announcement-images").upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("announcement-images").getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }
      setImageUrls((prev) => [...prev, ...newUrls]);
    } catch (e: any) {
      toast({ title: "업로드 실패", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements", ownerFilter.ownerCodeId],
    queryFn: async () => {
      let query = supabase
        .from("announcements")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (ownerFilter.shouldFilter) query = query.eq("owner_code_id", ownerFilter.ownerCodeId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase
          .from("announcements")
          .update({ title, content, is_pinned: isPinned, image_urls: imageUrls, file_urls: fileAttachments, updated_at: new Date().toISOString() })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert({ title, content, is_pinned: isPinned, image_urls: imageUrls, file_urls: fileAttachments, owner_code_id: session?.accessCodeId || null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({ title: editingId ? "수정 완료" : "등록 완료" });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({ title: "삭제 완료" });
      setDeleteId(null);
    },
  });

  const closeDialog = () => {
    setShowDialog(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setIsPinned(false);
    setImageUrls([]);
    setFileAttachments([]);
  };

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setIsPinned(a.is_pinned);
    setImageUrls(a.image_urls || []);
    setFileAttachments(a.file_urls || []);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Megaphone}
        title="공지사항"
        description="학생들에게 보여질 공지사항을 관리합니다"
      />

      <div className="flex justify-end">
        <Button onClick={() => setShowDialog(true)} size="sm" className="gap-1.5 rounded-lg shadow-sm">
          <Plus className="w-4 h-4" />
          새 공지 작성
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 opacity-30" />
            </div>
            <p className="text-sm font-medium">등록된 공지사항이 없습니다</p>
            <p className="text-xs text-muted-foreground/60 mt-1">새 공지를 작성해보세요</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/30 shadow-md rounded-xl">
          <div className="grid grid-cols-[3rem_1fr_7rem_2.5rem] items-center px-5 py-3 border-b border-border/30 bg-muted/30">
            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-center">No.</span>
            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">제목</span>
            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-center">등록일</span>
            <span />
          </div>
          <div className="divide-y divide-border/20">
            {(() => {
              const nonPinnedItems = announcements.filter((a: any) => !a.is_pinned);
              let nonPinnedCounter = 0;
              return announcements.map((a: any) => {
                const displayNum = a.is_pinned ? null : ++nonPinnedCounter;
                return (
              <Collapsible key={a.id}>
                <div className="group">
                  <CollapsibleTrigger className="w-full text-left grid grid-cols-[3rem_1fr_7rem_2.5rem] items-center px-5 py-3.5 hover:bg-muted/30 transition-all duration-200">
                    <span className="text-center">
                      {a.is_pinned ? (
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                          <Pin className="w-3 h-3 text-primary" />
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold tabular-nums text-muted-foreground/50">{displayNum}</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {a.is_pinned && (
                        <Badge variant="secondary" className="text-[9px] px-2 py-0.5 gap-1 flex-shrink-0 bg-primary/8 text-primary border-primary/15 rounded-md font-semibold">
                          <Pin className="w-2.5 h-2.5" />
                          고정
                        </Badge>
                      )}
                      <h3 className="font-semibold text-sm truncate text-foreground/90">{a.title}</h3>
                      {a.image_urls && a.image_urls.length > 0 && (
                        <div className="w-5 h-5 rounded bg-muted/50 flex items-center justify-center flex-shrink-0">
                          <ImagePlus className="w-3 h-3 text-muted-foreground/40" />
                        </div>
                      )}
                      {a.file_urls && Array.isArray(a.file_urls) && a.file_urls.length > 0 && (
                        <div className="w-5 h-5 rounded bg-muted/50 flex items-center justify-center flex-shrink-0">
                          <Paperclip className="w-3 h-3 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground/50 text-center tabular-nums font-medium">
                      {formatKSTLocale(a.created_at, { year: "2-digit", month: "2-digit", day: "2-digit" })}
                    </span>
                    <div className="flex items-center justify-center">
                      <ChevronDown className="w-4 h-4 text-muted-foreground/30 transition-transform duration-300 [[data-state=open]_&]:rotate-180" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-5 pt-3 ml-[3rem] border-t border-border/20 bg-muted/10">
                      <p className="text-[13px] text-foreground/80 whitespace-pre-wrap leading-[1.9]">
                        {a.content.split(/(https?:\/\/[^\s]+)/g).map((part: string, i: number) =>
                          /^https?:\/\//.test(part) ? (
                            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/30 underline-offset-2 hover:text-primary/80 transition-colors">{part}</a>
                          ) : part
                        )}
                      </p>
                      {a.image_urls && a.image_urls.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mt-5">
                          {a.image_urls.map((url: string, i: number) => (
                            <img key={i} src={url} alt={`첨부 ${i + 1}`} className="w-full rounded-xl border border-border/30 object-cover max-h-52 cursor-pointer hover:opacity-90 hover:shadow-lg transition-all duration-300" onClick={() => window.open(url, "_blank")} />
                          ))}
                        </div>
                      )}
                      {a.file_urls && Array.isArray(a.file_urls) && a.file_urls.length > 0 && (
                        <div className="mt-5 space-y-1.5">
                          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">📎 첨부파일</p>
                          {a.file_urls.map((f: any, i: number) => (
                            <a
                              key={i}
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border/30 bg-background hover:bg-muted/30 hover:border-border/50 transition-all duration-200 group"
                            >
                              <div className="w-7 h-7 rounded-md bg-primary/8 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-3.5 h-3.5 text-primary/60" />
                              </div>
                              <span className="text-xs text-foreground/80 truncate flex-1 font-medium">{f.name}</span>
                              <span className="text-[10px] text-muted-foreground/40 flex-shrink-0 tabular-nums">{formatFileSize(f.size)}</span>
                              <Download className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-border/15">
                        <p className="text-[10px] text-muted-foreground/40 tabular-nums">
                          {formatKSTLocaleDateTime(a.created_at, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2.5 gap-1.5 text-xs rounded-md hover:bg-muted/50" onClick={(e) => { e.stopPropagation(); openEdit(a); }}>
                            <Edit2 className="w-3.5 h-3.5" />
                            수정
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2.5 gap-1.5 text-xs rounded-md text-destructive hover:bg-destructive/5" onClick={(e) => { e.stopPropagation(); setDeleteId(a.id); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                            삭제
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
                );
              });
            })()}
          </div>
        </Card>
      )}

      {/* 작성/수정 다이얼로그 */}
      <Dialog open={showDialog} onOpenChange={(v) => !v && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "공지 수정" : "새 공지 작성"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">제목</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지 제목" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">내용</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="공지 내용을 입력하세요"
                className="min-h-[200px] resize-y"
                style={{ height: Math.max(200, content.split('\n').length * 22 + 40) + 'px' }}
              />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">📷 사진 첨부</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                {uploading ? "업로드 중..." : "사진 추가"}
              </Button>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`첨부 ${i + 1}`} className="w-full h-20 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">📎 첨부파일 <span className="text-muted-foreground font-normal">({fileAttachments.length}/{MAX_FILES}개, {formatFileSize(fileAttachments.reduce((s, f) => s + f.size, 0))}/500MB)</span></Label>
              <input
                ref={attachmentInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileAttachmentUpload(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={uploadingFiles || fileAttachments.length >= MAX_FILES}
              >
                {uploadingFiles ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
                {uploadingFiles ? "업로드 중..." : "파일 추가"}
              </Button>
              {fileAttachments.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {fileAttachments.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-muted/30 group">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs truncate flex-1">{f.name}</span>
                      <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">{formatFileSize(f.size)}</span>
                      <button
                        type="button"
                        onClick={() => setFileAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                        className="w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isPinned} onCheckedChange={setIsPinned} id="pin-switch" />
              <Label htmlFor="pin-switch" className="text-xs">상단 고정</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>취소</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!title.trim() || !content.trim() || saveMutation.isPending}>
              {saveMutation.isPending ? "저장 중..." : editingId ? "수정" : "등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지 삭제</AlertDialogTitle>
            <AlertDialogDescription>이 공지사항을 삭제하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
