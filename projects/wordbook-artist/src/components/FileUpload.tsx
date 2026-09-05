import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onGenerate: () => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onFileSelect, onGenerate, selectedFile, setSelectedFile, isLoading }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect, setSelectedFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect, setSelectedFile]);

  const clearFile = () => setSelectedFile(null);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-2xl text-center transition-all duration-500 cursor-pointer group overflow-hidden",
          isDragging
            ? "scale-[1.02]"
            : "",
          isLoading && "opacity-50 pointer-events-none"
        )}
        style={{
          border: isDragging ? '2px solid hsl(var(--primary))' : '1.5px solid hsl(var(--border))',
          background: isDragging
            ? 'linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--primary) / 0.02))'
            : 'linear-gradient(180deg, hsl(var(--card)), hsl(var(--muted) / 0.3))',
          padding: '3rem 2rem',
        }}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        {/* Decorative corner accents — always visible, subtle */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary/25 rounded-tl-sm transition-all group-hover:border-primary/60 group-hover:w-6 group-hover:h-6" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-primary/25 rounded-tr-sm transition-all group-hover:border-primary/60 group-hover:w-6 group-hover:h-6" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-primary/25 rounded-bl-sm transition-all group-hover:border-primary/60 group-hover:w-6 group-hover:h-6" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary/25 rounded-br-sm transition-all group-hover:border-primary/60 group-hover:w-6 group-hover:h-6" />

        {/* Editorial file-type chip */}
        {!selectedFile && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            <span
              className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground/60"
              style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              .xlsx&nbsp;·&nbsp;.xls
            </span>
          </div>
        )}

        <div className="flex flex-col items-center gap-3 pt-4">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 relative",
            isDragging
              ? "scale-110"
              : "group-hover:scale-105"
          )}>
            <div
              className={cn(
                "absolute inset-0 rounded-2xl transition-all",
                isDragging
                  ? "bg-primary shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)]"
                  : "bg-gradient-to-br from-muted/70 to-muted/30 group-hover:from-primary/15 group-hover:to-primary/5",
              )}
            />
            <div className="absolute inset-0 rounded-2xl border border-border/60 group-hover:border-primary/30 transition-colors" />
            {selectedFile ? (
              <FileSpreadsheet className={cn("relative w-7 h-7", isDragging ? "text-primary-foreground" : "text-primary")} />
            ) : (
              <Upload className={cn("relative w-7 h-7", isDragging ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
            )}
          </div>

          {selectedFile ? (
            <div className="flex items-center gap-3">
              <span className="font-medium text-foreground text-sm">{selectedFile.name}</span>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearFile(); }}
                className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">
                엑셀 파일을 드래그하거나 클릭하세요
              </p>
              <p className="text-xs text-muted-foreground">
                .xlsx 또는 .xls 파일 지원
              </p>
            </>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-primary text-sm">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">AI 생성 중...</span>
            </div>
          )}
        </div>
      </div>

      {selectedFile && !isLoading && (
        <Button
          onClick={onGenerate}
          size="lg"
          className="w-full gap-2 text-base py-5 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(32 75% 45%))',
            boxShadow: '0 4px 20px hsl(var(--primary) / 0.25)',
          }}
        >
          <Sparkles className="w-4 h-4" />
          AI 단어장 생성하기
        </Button>
      )}
    </div>
  );
};
