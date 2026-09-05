import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const ClassListEditor = () => {
  const [classList, setClassList] = useState<string[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    loadClassList();
  }, []);

  const loadClassList = () => {
    const savedList = localStorage.getItem('omr-class-list');
    if (savedList) {
      setClassList(JSON.parse(savedList));
    } else {
      // 기본 반 목록
      const defaultList = ["1FO", "1INT", "1AD", "2FO", "2INT", "2AD", "3FO", "3INT", "3AD", "TOP", "고등부", "신규생", "IVY"];
      setClassList(defaultList);
      localStorage.setItem('omr-class-list', JSON.stringify(defaultList));
    }
  };

  const saveClassList = (newList: string[]) => {
    localStorage.setItem('omr-class-list', JSON.stringify(newList));
    setClassList(newList);
  };

  const handleAddClass = () => {
    if (!newClassName.trim()) {
      toast({
        title: "반 이름을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (classList.includes(newClassName.trim())) {
      toast({
        title: "이미 존재하는 반 이름입니다",
        variant: "destructive",
      });
      return;
    }

    const newList = [...classList, newClassName.trim()];
    saveClassList(newList);
    setNewClassName('');
    
    toast({
      title: "반이 추가되었습니다",
    });
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditingValue(classList[index]);
  };

  const handleEditSave = () => {
    if (!editingValue.trim()) {
      toast({
        title: "반 이름을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (classList.includes(editingValue.trim()) && editingValue.trim() !== classList[editingIndex!]) {
      toast({
        title: "이미 존재하는 반 이름입니다",
        variant: "destructive",
      });
      return;
    }

    const newList = [...classList];
    newList[editingIndex!] = editingValue.trim();
    saveClassList(newList);
    setEditingIndex(null);
    setEditingValue('');
    
    toast({
      title: "반 이름이 수정되었습니다",
    });
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      const newList = classList.filter((_, index) => index !== deleteIndex);
      saveClassList(newList);
      
      toast({
        title: "반이 삭제되었습니다",
      });
    }
    setDeleteDialogOpen(false);
    setDeleteIndex(null);
  };

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">OMR 시험 반 목록 관리</h3>
        <p className="text-sm text-gray-600">학생들이 OMR 시험을 볼 때 선택할 수 있는 반 목록을 관리합니다.</p>
      </div>

      {/* 새 반 추가 */}
      <Card className="p-4">
        <div className="space-y-3">
          <Label htmlFor="newClass" className="text-sm font-medium">새 반 추가</Label>
          <div className="flex gap-2">
            <Input
              id="newClass"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="반 이름을 입력하세요 (예: IVY, 3FO, TOP)"
              onKeyPress={(e) => e.key === 'Enter' && handleAddClass()}
              className="flex-1"
            />
            <Button onClick={handleAddClass} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        </div>
      </Card>

      {/* 반 목록 */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">현재 반 목록 ({classList.length}개)</h4>
        {classList.length === 0 ? (
          <p className="text-gray-500 text-center py-4">등록된 반이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {classList.map((className, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                {editingIndex === index ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEditSave()}
                      className="flex-1"
                      autoFocus
                    />
                    <Button onClick={handleEditSave} size="sm" variant="outline">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleEditCancel} size="sm" variant="outline">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-gray-900">{className}</span>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleEditStart(index)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(index)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>반 삭제 확인</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            "{deleteIndex !== null ? classList[deleteIndex] : ''}" 반을 삭제하시겠습니까?
            <br />
            삭제된 반은 복구할 수 없습니다.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassListEditor;