import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, BookOpen, FileSpreadsheet, Save, Image, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import PageHeader from "@/components/PageHeader";
import editCardsetIcon from "@/assets/page-icons/edit-cardset-icon.png";

// 미리 생성된 로고 이미지들
import vocabLogo1 from "@/assets/vocab-logo-1.png";
import vocabLogo2 from "@/assets/vocab-logo-2.png";
import vocabLogo3 from "@/assets/vocab-logo-3.png";
import vocabLogo4 from "@/assets/vocab-logo-4.png";
import vocabLogo5 from "@/assets/vocab-logo-5.png";
import vocabLogo6 from "@/assets/vocab-logo-6.png";

const PRESET_LOGOS = [
  { id: 'logo1', src: vocabLogo1, name: '책과 글자' },
  { id: 'logo2', src: vocabLogo2, name: '두뇌와 ABC' },
  { id: 'logo3', src: vocabLogo3, name: '등대' },
  { id: 'logo4', src: vocabLogo4, name: '마법의 책' },
  { id: 'logo5', src: vocabLogo5, name: '학사모' },
  { id: 'logo6', src: vocabLogo6, name: '로켓' },
];

interface WordData {
  day: string;
  number: number;
  word: string;
  meaning: string;
  example?: string; // 예문 추가
}

export default function EditCardSet() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [wordData, setWordData] = useState<WordData[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      fetchCardSet();
    }
  }, [id]);

  const fetchCardSet = async () => {
    try {
      const { data, error } = await supabase
        .from('card_sets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setTitle(data.title);
        setDescription(data.description || "");
        setImageUrl(data.image_url || "");
        
        const words = Array.isArray(data.word_data) ? data.word_data as unknown as WordData[] : [];
        setWordData(words);
        
        const days = Array.from(new Set(words.map((word: any) => word.day))).sort();
        setAvailableDays(days);
      }
    } catch (error) {
      console.error('Error fetching card set:', error);
      toast({
        title: "오류",
        description: "단어장을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const words: WordData[] = [];
        const days = new Set<string>();

        // Skip header row and process data
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row[0] && row[1] && row[2] && row[3]) {
            const wordItem: WordData = {
              day: row[0].toString(),
              number: parseInt(row[1].toString()),
              word: row[2].toString(),
              meaning: row[3].toString(),
              example: row[4] ? row[4].toString() : undefined // 예문 컬럼 추가
            };
            words.push(wordItem);
            days.add(wordItem.day);
          }
        }

        setWordData(words);
        setAvailableDays(Array.from(days).sort());
        
        toast({
          title: "성공",
          description: `${words.length}개의 단어를 업로드했습니다.`,
        });
      } catch (error) {
        toast({
          title: "오류",
          description: "엑셀 파일을 읽는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "오류",
        description: "이미지 크기는 5MB 이하여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setImageUploading(true);
    try {
      // 파일명을 고유하게 만들기
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `card-sets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('card-set-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('card-set-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast({
        title: "성공",
        description: "이미지가 업로드되었습니다.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "오류",
        description: "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) return;
    
    try {
      // URL에서 파일 경로 추출
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `card-sets/${fileName}`;

      await supabase.storage
        .from('card-set-images')
        .remove([filePath]);

      setImageUrl("");
      toast({
        title: "성공",
        description: "이미지가 삭제되었습니다.",
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "오류",
        description: "이미지 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "오류",
        description: "단어장 제목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (wordData.length === 0) {
      toast({
        title: "오류",
        description: "단어 데이터가 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('card_sets')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          test_type: 'meaning', // 기본값으로 설정 (시험 시 선택)
          word_data: wordData as any,
          selected_days: availableDays,
          image_url: imageUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "단어장이 성공적으로 수정되었습니다.",
      });

      navigate("/");
    } catch (error) {
      console.error('Error updating card set:', error);
      toast({
        title: "오류",
        description: "단어장 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">단어장을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        {/* Premium Header */}
        <PageHeader
          icon={editCardsetIcon}
          iconAlt="단어장 수정"
          title="단어장 수정"
          subtitle="단어장을 수정하고 업데이트하세요"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
        </PageHeader>
      </div>
        
      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-6">

        {/* Card Set Info */}
        <Card className="shadow-lg border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BookOpen className="w-5 h-5" />
              단어장 정보
            </CardTitle>
            <CardDescription>
              단어장의 기본 정보를 수정하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>제목 *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="단어장 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="단어장에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
            <div className="space-y-4">
              <Label>썸네일 이미지</Label>
              
              {/* 프리셋 로고 선택 */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">프리셋 로고 중 선택</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {PRESET_LOGOS.map((logo) => (
                    <button
                      key={logo.id}
                      type="button"
                      onClick={() => setImageUrl(logo.src)}
                      className={`relative group rounded-xl p-2 border-2 transition-all duration-200 ${
                        imageUrl === logo.src 
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                          : 'border-border hover:border-primary/50 bg-background'
                      }`}
                    >
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      {imageUrl === logo.src && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <p className="text-xs text-center mt-1 text-muted-foreground group-hover:text-foreground transition-colors">
                        {logo.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 현재 이미지 또는 커스텀 업로드 */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">또는 직접 업로드</p>
                {imageUrl && !PRESET_LOGOS.some(logo => logo.src === imageUrl) ? (
                  <div className="relative inline-block">
                    <img
                      src={imageUrl}
                      alt="Card set thumbnail"
                      className="h-32 w-auto rounded-lg border border-border object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    onClick={() => imageInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    disabled={imageUploading}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    {imageUploading ? "업로드 중..." : "커스텀 이미지 업로드"}
                  </Button>
                  {imageUrl && (
                    <Button
                      onClick={() => setImageUrl("")}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      이미지 제거
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Excel Upload */}
        <Card className="shadow-lg border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileSpreadsheet className="w-5 h-5" />
              단어장 업데이트 (선택사항)
            </CardTitle>
            <CardDescription>
              새로운 엑셀 파일을 업로드하여 단어장을 업데이트할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  새 엑셀 파일 선택 (선택사항)
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                ✅ 현재 {wordData.length}개의 단어가 있습니다.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Word Preview */}
        {wordData.length > 0 && (
          <Card className="shadow-lg border-border/50 mb-6">
            <CardHeader>
              <CardTitle className="text-primary">단어 미리보기</CardTitle>
              <CardDescription>
                현재 단어장에 포함된 단어들
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                    {availableDays.map((day) => {
                      const dayWordCount = wordData.filter(word => word.day === day).length;
                      return (
                        <div key={day} className="text-center p-2 bg-primary/10 rounded">
                          <div className="text-sm font-medium">{day}</div>
                          <div className="text-xs text-muted-foreground">{dayWordCount}개</div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-primary font-medium">
                    총 {wordData.length}개 단어
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => navigate("/")}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90">
            {loading ? (
              "저장 중..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                수정 사항 저장
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}