
import React, { useState } from 'react';
import PassageForm from './PassageForm';
import PassageList from './PassageList';
import { usePassageManagement } from './hooks/usePassageManagement';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PassageEntry } from './hooks/types';
import { toast } from "@/hooks/use-toast";
import { useAccessCode } from '@/contexts/AccessCodeContext';

const PassageManagement: React.FC = () => {
  const { isAdmin } = useAccessCode();
  
  const {
    passages,
    loading,
    content,
    translation,
    tags,
    category,
    difficulty,
    source,
    itemId,
    isUpdateMode,
    selectedPassages,
    isSubmitting,
    setContent,
    setTranslation,
    setTags,
    setCategory,
    setDifficulty,
    setSource,
    setItemId,
    clearInputFields,
    handleSubmit,
    handleEdit,
    handleCopy,
    handleDeletePassage,
    handleSelectPassage,
    handleSelectAllPassages,
    handleDeleteSelectedPassages,
    handleDeleteAllPassages,
    handleCreateMultiplePassages
  } = usePassageManagement();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [multipleEntries, setMultipleEntries] = useState<PassageEntry[]>([
    { item_id: '', content: '', translation: '' }
  ]);
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  const handleBulkSubmit = async (entries: PassageEntry[]) => {
    const validEntries = entries.filter(entry => entry.content.trim() !== '');
    
    if (validEntries.length === 0) {
      toast({
        title: "오류",
        description: "지문 내용은 필수 입력 항목입니다. 최소 한 개의 지문 내용을 입력해주세요.",
        variant: "destructive",
      });
      return false;
    }
    
    const success = await handleCreateMultiplePassages(validEntries);
    
    if (success) {
      setMultipleEntries([{ item_id: '', content: '', translation: '' }]);
    }
    
    return success;
  };

  return (
    <div className="space-y-6">
      <PassageForm
        content={content}
        setContent={setContent}
        translation={translation}
        setTranslation={setTranslation}
        tags={tags}
        setTags={setTags}
        category={category}
        setCategory={setCategory}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        source={source}
        setSource={setSource}
        itemId={itemId}
        setItemId={setItemId}
        isUpdateMode={isUpdateMode}
        clearInputFields={clearInputFields}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        multipleEntries={multipleEntries}
        setMultipleEntries={setMultipleEntries}
        handleBulkSubmit={handleBulkSubmit}
      />

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">지문 관리</h3>
        
        <div className="flex items-center gap-4">
          {isAdmin && selectedPassages.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setConfirmDialogOpen(true)}
              disabled={isSubmitting}
            >
              선택한 지문 삭제 ({selectedPassages.length})
            </Button>
          )}
          
          {isAdmin && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="showDeleteAll" 
                checked={showDeleteAll}
                onCheckedChange={setShowDeleteAll}
                disabled={isSubmitting}
              />
              <Label htmlFor="showDeleteAll">삭제 버튼 표시</Label>
            </div>
          )}
        </div>
      </div>

      {isAdmin && showDeleteAll && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="p-4">
            <CardTitle className="text-red-700 text-base flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              위험 작업
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => {
                if (window.confirm('정말로 모든 지문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                  handleDeleteAllPassages();
                }
              }}
              disabled={isSubmitting || passages.length === 0}
            >
              모든 지문 삭제하기 ({passages.length}개)
            </Button>
          </CardContent>
        </Card>
      )}

      <PassageList
        passages={passages}
        loading={loading}
        selectedPassages={selectedPassages}
        handleEdit={handleEdit}
        handleCopy={handleCopy}
        handleDeletePassage={isAdmin ? handleDeletePassage : undefined}
        handleSelectPassage={handleSelectPassage}
        handleSelectAllPassages={handleSelectAllPassages}
      />

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>선택한 지문 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 {selectedPassages.length}개의 지문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                handleDeleteSelectedPassages();
                setConfirmDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PassageManagement;
