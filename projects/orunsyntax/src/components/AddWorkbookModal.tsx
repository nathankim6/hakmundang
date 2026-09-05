import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, BookOpen, FileText, Image, X } from 'lucide-react';

interface AddWorkbookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WorkbookFormData {
  // Cover page
  title: string;
  subtitle: string;
  description: string;
  author: string;
  publisher: string;
  edition: string;
  // Header/Footer
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
}

const AddWorkbookModal = ({ open, onOpenChange }: AddWorkbookModalProps) => {
  const [formData, setFormData] = useState<WorkbookFormData>({
    title: '',
    subtitle: '',
    description: '',
    author: '',
    publisher: '',
    edition: '',
    headerLeft: '',
    headerCenter: '',
    headerRight: '',
    footerLeft: '',
    footerCenter: '',
    footerRight: '',
  });

  const [sentencesFile, setSentencesFile] = useState<File | null>(null);
  const [answersFile, setAnswersFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleInputChange = (field: keyof WorkbookFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (type: 'sentences' | 'answers' | 'logo', file: File | null) => {
    if (type === 'sentences') setSentencesFile(file);
    else if (type === 'answers') setAnswersFile(file);
    else if (type === 'logo') setLogoFile(file);
  };

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    console.log('Files:', { sentencesFile, answersFile, logoFile });
    // TODO: Implement actual submission logic
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-5 h-5 text-primary" />
            새 문제집 추가
          </DialogTitle>
          <DialogDescription>
            문제집의 표지, 머리글/바닥글 정보를 입력하고 파일을 업로드하세요.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cover" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cover">표지 정보</TabsTrigger>
            <TabsTrigger value="header-footer">머리글/바닥글</TabsTrigger>
            <TabsTrigger value="files">파일 업로드</TabsTrigger>
          </TabsList>

          {/* Cover Page Tab */}
          <TabsContent value="cover" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">문제집 제목 *</Label>
                <Input
                  id="title"
                  placeholder="예: 고3 상위권 구문 10000제"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subtitle">부제목</Label>
                <Input
                  id="subtitle"
                  placeholder="예: Advanced Syntax Training"
                  value={formData.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  placeholder="문제집에 대한 간략한 설명을 입력하세요."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="author">저자</Label>
                  <Input
                    id="author"
                    placeholder="예: Nathan T"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="publisher">출판사</Label>
                  <Input
                    id="publisher"
                    placeholder="예: NATHAN ENGLISH"
                    value={formData.publisher}
                    onChange={(e) => handleInputChange('publisher', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edition">에디션/버전</Label>
                <Input
                  id="edition"
                  placeholder="예: 2025 개정판"
                  value={formData.edition}
                  onChange={(e) => handleInputChange('edition', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Header/Footer Tab */}
          <TabsContent value="header-footer" className="space-y-6 mt-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">머리글 (Header)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="headerLeft" className="text-xs">왼쪽</Label>
                  <Input
                    id="headerLeft"
                    placeholder="왼쪽 머리글"
                    value={formData.headerLeft}
                    onChange={(e) => handleInputChange('headerLeft', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="headerCenter" className="text-xs">가운데</Label>
                  <Input
                    id="headerCenter"
                    placeholder="가운데 머리글"
                    value={formData.headerCenter}
                    onChange={(e) => handleInputChange('headerCenter', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="headerRight" className="text-xs">오른쪽</Label>
                  <Input
                    id="headerRight"
                    placeholder="오른쪽 머리글"
                    value={formData.headerRight}
                    onChange={(e) => handleInputChange('headerRight', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">바닥글 (Footer)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="footerLeft" className="text-xs">왼쪽</Label>
                  <Input
                    id="footerLeft"
                    placeholder="왼쪽 바닥글"
                    value={formData.footerLeft}
                    onChange={(e) => handleInputChange('footerLeft', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="footerCenter" className="text-xs">가운데</Label>
                  <Input
                    id="footerCenter"
                    placeholder="가운데 바닥글"
                    value={formData.footerCenter}
                    onChange={(e) => handleInputChange('footerCenter', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="footerRight" className="text-xs">오른쪽</Label>
                  <Input
                    id="footerRight"
                    placeholder="오른쪽 바닥글"
                    value={formData.footerRight}
                    onChange={(e) => handleInputChange('footerRight', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 팁: 페이지 번호는 자동으로 삽입됩니다. 머리글/바닥글에 문제집 제목이나 챕터명을 넣으면 좋습니다.
              </p>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4 mt-4">
            {/* Sentences File */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                문장 파일 (sentences.txt) *
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                {sentencesFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-sm">{sentencesFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(sentencesFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFileChange('sentences', null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">클릭하여 파일 선택</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      각 줄에 하나의 문장이 포함된 텍스트 파일
                    </span>
                    <input
                      type="file"
                      accept=".txt"
                      className="hidden"
                      onChange={(e) => handleFileChange('sentences', e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Answers File */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                정답 파일 (answers.txt) *
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                {answersFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-sm">{answersFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(answersFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFileChange('answers', null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">클릭하여 파일 선택</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      각 문장에 대한 정답이 포함된 텍스트 파일
                    </span>
                    <input
                      type="file"
                      accept=".txt"
                      className="hidden"
                      onChange={(e) => handleFileChange('answers', e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Logo File */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                로고 이미지 (선택)
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                {logoFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="w-5 h-5 text-primary" />
                      <span className="text-sm">{logoFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(logoFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFileChange('logo', null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">클릭하여 파일 선택</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WEBP (권장 크기: 200x200px)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange('logo', e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title}
          >
            문제집 생성
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkbookModal;
