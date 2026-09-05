
import React, { useState, useEffect } from 'react';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import { useApiKey } from '@/contexts/ApiKeyContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiKeyDialog from '@/components/understanding/ApiKeyDialog';
import PassageSearch from '@/components/passage-database/PassageSearch';
import { Passage } from '@/components/passage-database/hooks/types';
import PassageManagement from '@/components/passage-database/PassageManagement';
import { useToast } from '@/hooks/use-toast';
import { Database, Search, Cog, AlertTriangle } from 'lucide-react';
import SidebarLayout from '@/components/shared/SidebarLayout';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const PassageDatabasePage = () => {
  const {
    isAdmin
  } = useAccessCode();
  const {
    openaiApiKey,
    setOpenaiApiKey,
    isApiConnected,
    setIsApiConnected
  } = useApiKey();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [forceDeleteDialogOpen, setForceDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    toast
  } = useToast();

  useEffect(() => {
    const enableRealtime = async () => {
      try {
        await supabase.functions.invoke('enable-realtime', {
          body: {
            tableName: 'passages'
          }
        }).catch(error => {
          console.error('Error enabling realtime:', error);
        });
      } catch (error) {
        console.error('Failed to enable realtime for passages:', error);
      }
    };
    enableRealtime();
  }, []);

  const handlePassageSelect = (passage: Passage) => {
    sessionStorage.setItem('selectedPassage', JSON.stringify(passage));
    toast({
      title: '지문 선택됨',
      description: '지문이 선택되었습니다. 원하는 기능 페이지로 이동하여 사용하세요.'
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleForceDeleteAllPassages = async () => {
    setIsDeleting(true);
    try {
      console.log('Force deleting all passages from main page');
      
      const { error, data } = await supabase.functions.invoke('enable-realtime', {
        body: {
          tableName: 'passages',
          action: 'deleteAll'
        }
      });
      
      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      console.log('Successfully deleted all passages');
      
      toast({
        title: "성공",
        description: "모든 지문이 완전히 삭제되었습니다."
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error force deleting all passages:', error);
      toast({
        title: "오류",
        description: error.message || "모든 지문을 삭제하는데 실패했습니다",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setForceDeleteDialogOpen(false);
    }
  };

  return <ProtectedRoute>
      <SidebarLayout apiKeyButton={<ApiKeyDialog openaiApiKey={openaiApiKey} setOpenaiApiKey={setOpenaiApiKey} isApiConnected={isApiConnected} setIsApiConnected={setIsApiConnected} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />} isAdmin={isAdmin} pageIcon={<Database className="h-10 w-10 text-indigo-600" />} pageTitle="지문 데이터베이스" pageDescription="영어 지문을 검색하고, 관리하는 데이터베이스 시스템입니다.">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="mb-2">
              <ToggleGroup type="single" value={activeTab} onValueChange={value => {
              if (value) {
                handleTabChange(value);
              }
            }} className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
                <ToggleGroupItem value="search" aria-label="검색 및 내보내기 탭" className="rounded-lg data-[state=on]:bg-white data-[state=on]:text-indigo-700 data-[state=on]:shadow-sm flex justify-center py-3">
                  <Search className="h-4 w-4 mr-2" />
                  <span className="font-medium">지문찾기</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="manage" aria-label="지문 관리 탭" className="rounded-lg data-[state=on]:bg-white data-[state=on]:text-indigo-700 data-[state=on]:shadow-sm flex justify-center py-3">
                  <Cog className="h-4 w-4 mr-2" />
                  <span className="font-medium">지문 추가/삭제</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            {isAdmin && <Button variant="destructive" onClick={() => setForceDeleteDialogOpen(true)} className="flex items-center" disabled={isDeleting}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                모든 지문 강제 삭제
              </Button>}
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="search">지문 검색 및 내보내기</TabsTrigger>
              <TabsTrigger value="manage">지문 관리</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4 mt-0">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Search className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-indigo-800">지문 검색 및 사용 방법</h3>
                    <p className="text-sm text-indigo-600 mt-1">지문의 첫 단어를 검색해 원하는 지문들을 찾아 선택한 후 엑셀파일로 다운받을 수 있습니다.</p>
                  </div>
                </div>
              </div>
              
              <PassageSearch 
                onPassageSelect={handlePassageSelect} 
                uiOptions={{
                  showCategoryFilter: true,
                  showExportAllButton: true,
                  enableWorkbookCreation: true,
                  enableMultiSelection: true
                }}
              />
            </TabsContent>
            
            <TabsContent value="manage" className="mt-0">
              <PassageManagement />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarLayout>

      <AlertDialog open={forceDeleteDialogOpen} onOpenChange={setForceDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>모든 지문 강제 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="text-red-500 font-bold mb-2">
                경고: 이 작업은 되돌릴 수 없습니다!
              </div>
              <p className="mb-2">
                데이터베이스에서 <span className="font-bold">모든 지문</span>이 영구적으로 삭제됩니다.
              </p>
              <p>
                정말 진행하시겠습니까?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceDeleteAllPassages} className="bg-red-600 hover:bg-red-700 text-white" disabled={isDeleting}>
              {isDeleting ? "삭제 중..." : "모든 지문 강제 삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>;
};

export default PassageDatabasePage;
