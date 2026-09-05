import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface ListEditorProps {
  title: string;
  description: string;
  storageKey: string;
  defaultList: string[];
  placeholder: string;
  itemLabel: string;
}

const ListEditor: React.FC<ListEditorProps> = ({ title, description, storageKey, defaultList, placeholder, itemLabel }) => {
  const [list, setList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('app_settings')
        .select('value')
        .eq('key', storageKey)
        .maybeSingle();

      let next: string[] | null = null;
      if (!error && data?.value && Array.isArray(data.value)) {
        next = data.value as string[];
      } else {
        // migrate from localStorage if present
        const local = localStorage.getItem(storageKey);
        if (local) {
          try { next = JSON.parse(local); } catch { next = null; }
        }
        if (!next) next = defaultList;
        await (supabase as any).from('app_settings').upsert({ key: storageKey, value: next, updated_at: new Date().toISOString() });
      }
      setList(next || []);
      localStorage.setItem(storageKey, JSON.stringify(next || []));
      setLoading(false);
    })();

    // Realtime: reflect edits from any other device instantly
    const channel = supabase
      .channel(`app_settings_${storageKey}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings', filter: `key=eq.${storageKey}` },
        (payload: any) => {
          const row = payload.new || payload.old;
          if (row?.value && Array.isArray(row.value)) {
            setList(row.value);
            localStorage.setItem(storageKey, JSON.stringify(row.value));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storageKey]);

  const save = async (next: string[]) => {
    setList(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    const { error } = await (supabase as any)
      .from('app_settings')
      .upsert({ key: storageKey, value: next, updated_at: new Date().toISOString() });
    if (error) {
      toast({ title: '저장 실패', description: error.message, variant: 'destructive' });
    }
  };

  const handleAdd = () => {
    const v = newName.trim();
    if (!v) return toast({ title: `${itemLabel} 이름을 입력해주세요`, variant: "destructive" });
    if (list.includes(v)) return toast({ title: `이미 존재하는 ${itemLabel} 이름입니다`, variant: "destructive" });
    save([...list, v]);
    setNewName('');
    toast({ title: `${itemLabel}이(가) 추가되었습니다` });
  };

  const handleEditSave = () => {
    const v = editingValue.trim();
    if (!v) return toast({ title: `${itemLabel} 이름을 입력해주세요`, variant: "destructive" });
    if (list.includes(v) && v !== list[editingIndex!]) {
      return toast({ title: `이미 존재하는 ${itemLabel} 이름입니다`, variant: "destructive" });
    }
    const next = [...list];
    next[editingIndex!] = v;
    save(next);
    setEditingIndex(null);
    setEditingValue('');
    toast({ title: `${itemLabel} 이름이 수정되었습니다` });
  };

  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      save(list.filter((_, i) => i !== deleteIndex));
      toast({ title: `${itemLabel}이(가) 삭제되었습니다` });
    }
    setDeleteDialogOpen(false);
    setDeleteIndex(null);
  };


  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">새 {itemLabel} 추가</Label>
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={placeholder}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1"
            />
            <Button onClick={handleAdd} className="whitespace-nowrap" disabled={loading}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        </div>
      </Card>



      <Card className="p-4">
        <h4 className="font-medium mb-3">현재 {itemLabel} 목록 ({list.length}개)</h4>
        {loading ? (
          <p className="text-gray-500 text-center py-4">불러오는 중...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500 text-center py-4">등록된 {itemLabel}이(가) 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {list.map((name, index) => (
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
                    <Button onClick={() => { setEditingIndex(null); setEditingValue(''); }} size="sm" variant="outline">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-gray-900">{name}</span>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => { setEditingIndex(index); setEditingValue(name); }}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => { setDeleteIndex(index); setDeleteDialogOpen(true); }}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{itemLabel} 삭제 확인</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            "{deleteIndex !== null ? list[deleteIndex] : ''}" {itemLabel}을(를) 삭제하시겠습니까?
            <br />
            삭제된 항목은 복구할 수 없습니다.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>취소</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>삭제</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ClassListEditor = () => {
  return (
    <div className="space-y-8">
      <ListEditor
        title="OMR 시험 소속 목록 관리"
        description="학생들이 OMR 시험을 볼 때 선택할 수 있는 소속(캠퍼스) 목록을 관리합니다."
        storageKey="omr-branch-list"
        defaultList={["초등관", "뉴베리타스관", "흑석관"]}
        placeholder="소속 이름을 입력하세요 (예: 초등관, 뉴베리타스관)"
        itemLabel="소속"
      />
      <ListEditor
        title="OMR 시험 반 목록 관리"
        description="학생들이 OMR 시험을 볼 때 선택할 수 있는 반 목록을 관리합니다."
        storageKey="omr-class-list"
        defaultList={["1FO", "1INT", "1AD", "2FO", "2INT", "2AD", "3FO", "3INT", "3AD", "TOP", "고등부", "신규생", "IVY"]}
        placeholder="반 이름을 입력하세요 (예: IVY, 3FO, TOP)"
        itemLabel="반"
      />
    </div>
  );
};

export default ClassListEditor;
