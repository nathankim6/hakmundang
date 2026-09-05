import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import TestItem from './TestItem';
import { loadTests, deleteTest, deleteAllTests } from '@/utils/testStorage';
import { QRDataType } from '@/types/test';

const TestList = () => {
  const navigate = useNavigate();
  const [savedTests, setSavedTests] = React.useState<QRDataType[]>([]);
  const [showQR, setShowQR] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTests = async () => {
      try {
        const tests = await loadTests();
        setSavedTests(tests);
      } catch (error) {
        console.error('Failed to load tests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleDeleteTest = async (testId: string) => {
    const success = await deleteTest(testId);
    if (success) {
      setSavedTests(prev => prev.filter(test => test.testId !== testId));
    }
  };

  const handleDeleteAllTests = async () => {
    const success = await deleteAllTests();
    if (success) {
      setSavedTests([]);
    }
  };

  const handleTitleUpdate = (testId: string, newTitle: string) => {
    setSavedTests(prev => 
      prev.map(test => 
        test.testId === testId 
          ? { ...test, title: newTitle }
          : test
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-[#F1F1F1] via-[#E5E5E5] to-[#DADADA]">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 space-y-6 bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
            <div className="text-center py-8 text-[#6E6D70]">
              로딩 중...
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-[#F1F1F1] via-[#E5E5E5] to-[#DADADA]">
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4 text-[#403E43] hover:text-[#2D2B31] hover:bg-white/50"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로가기
        </Button>

        <Card className="p-6 space-y-6 bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold metallic-text">시험 관리</h1>
            {savedTests.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    전체 삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-white/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle>모든 시험을 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없으며, 모든 시험 데이터와 결과가 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-[#9F9EA1]">취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllTests}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      모두 삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {savedTests.length > 0 ? (
            <div className="space-y-4">
              {savedTests.map((test) => (
                <TestItem
                  key={test.testId}
                  test={test}
                  onDelete={handleDeleteTest}
                  showQR={showQR}
                  onToggleQR={setShowQR}
                  onTitleUpdate={handleTitleUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#6E6D70]">
              저장된 시험이 없습니다.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TestList;
