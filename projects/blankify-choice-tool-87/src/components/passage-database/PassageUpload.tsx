import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase, SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_KEY } from '@/integrations/supabase/client';

const PassageUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    success: number;
    failed: number;
  } | null>(null);
  
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: '파일 없음',
        description: '업로드할 Excel 파일을 선택해주세요.',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: '파일 형식 오류',
        description: 'Excel 파일(.xlsx 또는 .xls)만 업로드할 수 있습니다.',
        variant: 'destructive'
      });
      return;
    }
    
    setUploading(true);
    setUploadProgress(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Make sure to include the proper headers for authentication
      const response = await fetch(`${SUPABASE_PUBLIC_URL}/functions/v1/upload-passages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`,
          'apikey': SUPABASE_PUBLIC_KEY
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '업로드 중 오류가 발생했습니다.');
      }
      
      // Show results
      const successCount = result.results.filter((r: any) => r.success).length;
      const failedCount = result.results.filter((r: any) => !r.success).length;
      
      setUploadProgress({
        total: result.results.length,
        success: successCount,
        failed: failedCount
      });
      
      toast({
        title: '업로드 완료',
        description: `${successCount}개의 지문이 성공적으로 업로드되었습니다.`
      });
      
      // Reset file input
      setFile(null);
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading passages:', error);
      toast({
        title: '업로드 오류',
        description: error instanceof Error ? error.message : '지문 업로드 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>지문 데이터베이스 업로드</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Excel 파일(.xlsx 또는 .xls)을 업로드하여 여러 지문을 한 번에 추가할 수 있습니다.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            각 셀에 영어 지문이 담긴 파일을 업로드하세요. 모든 셀의, 비어있지 않은 내용은 하나의 지문으로 저장됩니다.
          </p>
          
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
            
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="whitespace-nowrap"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  지문 업로드
                </>
              )}
            </Button>
          </div>
        </div>
        
        {uploadProgress && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">업로드 결과:</h3>
            <ul className="list-disc list-inside text-sm mt-2">
              <li>전체 지문: {uploadProgress.total}개</li>
              <li className="text-green-600">성공: {uploadProgress.success}개</li>
              <li className="text-red-600">실패: {uploadProgress.failed}개</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PassageUpload;
