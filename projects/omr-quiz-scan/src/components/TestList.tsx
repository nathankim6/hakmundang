import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2, Plus, Play, Search, X, ChevronDown, ChevronRight, FolderOpen, Pencil, Square } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import TestItem from './TestItem';
import BulkResultDialog from './test/BulkResultDialog';
import { loadTests, deleteAllTests } from '@/utils/testStorage';
import { updateTestStatus, updateTestTitle } from '@/utils/testStorage/updateTests';
import { QRDataType } from '@/types/test';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TestListProps {
  tests?: QRDataType[];
}

// 시험 그룹화를 위한 타입
interface TestGroup {
  groupName: string;
  tests: QRDataType[];
  isSingle?: boolean; // 단일 시험 여부 (카테고리 없이 표시)
}

const TestList = ({
  tests: initialTests
}: TestListProps) => {
  const navigate = useNavigate();
  const [savedTests, setSavedTests] = React.useState<QRDataType[]>([]);
  const [showQR, setShowQR] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(new Set());
  const [customGroupNames, setCustomGroupNames] = React.useState<Record<string, string>>({});
  const [editingGroup, setEditingGroup] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState('');
  const [groupAccessCode, setGroupAccessCode] = React.useState('');
  const editInputRef = React.useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [draggedTestId, setDraggedTestId] = React.useState<string | null>(null);
  const [dragOverGroup, setDragOverGroup] = React.useState<string | null>(null);
  const [groupOverrides, setGroupOverrides] = React.useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('testGroupOverrides');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const saveGroupOverrides = (next: Record<string, string>) => {
    setGroupOverrides(next);
    try {
      localStorage.setItem('testGroupOverrides', JSON.stringify(next));
    } catch {}
  };
  const [endingGroup, setEndingGroup] = React.useState<string | null>(null);

  // 시험들을 비슷한 이름으로 그룹화하는 함수
  const groupTestsByName = (tests: QRDataType[]): TestGroup[] => {
    if (tests.length === 0) return [];
    
    // 공통 접두어 추출 함수 (단어 단위로)
    const extractGroupPrefix = (title: string): string => {
      if (title.includes('탑티어 모의고사')) {
        const match = title.match(/^(.*?탑티어 모의고사)/);
        if (match) return match[1].trim();
      }
      
      const patterns = [
        /^(.*?)\s*\d+[회차번호]?/,
        /^(.*?)\s*[A-Z]반/,
        /^(.*?)\s*#\d+/,
        /^(.*?)\s*\(\d+\)/,
        /^(.*?)\s*-\s*\d+/,
        /^(.*?)\s+Day\s*\d+/i,
      ];
      
      for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match && match[1] && match[1].trim().length >= 2) {
          return match[1].trim();
        }
      }
      
      const words = title.split(/[\s_-]+/).filter(w => w.length > 0);
      if (words.length >= 2) {
        return words.slice(0, 2).join(' ');
      }
      
      return title;
    };
    
    const groupMap = new Map<string, QRDataType[]>();
    
    tests.forEach(test => {
      const prefix = groupOverrides[test.testId] || extractGroupPrefix(test.title);
      const existing = groupMap.get(prefix) || [];
      existing.push(test);
      groupMap.set(prefix, existing);
    });
    
    // 2차 패스: 아직 단독으로 남은 시험들끼리 "연속 2단어"가 반복되면 폴더로 묶기
    const bigramsOf = (title: string): string[] => {
      const words = title
        .replace(/[\[\]()]/g, ' ')
        .split(/[\s_\-]+/)
        .filter(w => w.length > 0);
      const result: string[] = [];
      for (let i = 0; i < words.length - 1; i++) {
        result.push(`${words[i]} ${words[i + 1]}`);
      }
      return result;
    };

    const singles: { key: string; test: QRDataType }[] = [];
    groupMap.forEach((testsInGroup, key) => {
      if (testsInGroup.length === 1 && !groupOverrides[testsInGroup[0].testId]) {
        singles.push({ key, test: testsInGroup[0] });
      }
    });

    if (singles.length >= 2) {
      const counts = new Map<string, number>();
      singles.forEach(({ test }) => {
        new Set(bigramsOf(test.title)).forEach(b => counts.set(b, (counts.get(b) || 0) + 1));
      });

      const assigned = new Map<string, QRDataType[]>();
      singles.forEach(({ key, test }) => {
        const candidates = [...new Set(bigramsOf(test.title))].filter(b => (counts.get(b) || 0) >= 2);
        if (candidates.length === 0) return;
        candidates.sort((a, b) => (counts.get(b)! - counts.get(a)!) || a.localeCompare(b));
        const best = candidates[0];
        const list = assigned.get(best) || [];
        list.push(test);
        assigned.set(best, list);
        groupMap.delete(key);
      });

      assigned.forEach((testsInGroup, name) => {
        if (testsInGroup.length >= 2) {
          const existing = groupMap.get(name) || [];
          groupMap.set(name, [...existing, ...testsInGroup]);
        } else {
          // 결국 혼자 남은 경우 원래대로 복구
          testsInGroup.forEach(t => groupMap.set(t.title, [t]));
        }
      });
    }

    const groups: TestGroup[] = [];
    
    groupMap.forEach((testsInGroup, groupName) => {
      if (testsInGroup.length >= 2) {
        groups.push({
          groupName,
          tests: testsInGroup.sort((a, b) => a.title.localeCompare(b.title)),
          isSingle: false
        });
      } else {
        groups.push({
          groupName: testsInGroup[0].title,
          tests: testsInGroup,
          isSingle: true
        });
      }
    });
    
    groups.sort((a, b) => a.groupName.localeCompare(b.groupName));
    
    return groups;
  };

  // Supabase에서 커스텀 그룹 이름 로드
  React.useEffect(() => {
    const fetchGroupNames = async () => {
      try {
        const { data, error } = await supabase
          .from('test_group_names')
          .select('original_name, custom_name');
        if (!error && data) {
          const names: Record<string, string> = {};
          data.forEach((row: any) => { names[row.original_name] = row.custom_name; });
          setCustomGroupNames(names);
        }
      } catch (e) {
        console.error('Failed to load group names:', e);
      }
    };
    fetchGroupNames();
  }, []);

  React.useEffect(() => {
    if (initialTests) {
      setSavedTests(initialTests);
      setIsLoading(false);
      return;
    }
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
  }, [initialTests]);

  const handleDeleteTest = async (testId: string) => {
    setSavedTests(prev => prev.filter(test => test.testId !== testId));
  };

  const handleDeleteAllTests = async () => {
    const success = await deleteAllTests();
    if (success) {
      setSavedTests([]);
    }
  };

  const handleTitleUpdate = (testId: string, newTitle: string) => {
    setSavedTests(prev => prev.map(test => test.testId === testId ? {
      ...test,
      title: newTitle
    } : test));
  };

  const handleTestStatusChange = (testId: string, isEnded: boolean) => {
    setSavedTests(prev => prev.map(test => test.testId === testId ? {
      ...test,
      isEnded
    } : test));
  };

  const handleRestoreTest = async (testId: string) => {
    const success = await updateTestStatus(testId, false);
    if (success) {
      setSavedTests(prev => prev.map(test => test.testId === testId ? {
        ...test,
        isEnded: false
      } : test));
    }
  };

  // 카테고리 일괄 종료
  const handleEndGroupTests = async (group: TestGroup) => {
    setEndingGroup(group.groupName);
    const activeTestsInGroup = group.tests.filter(t => !t.isEnded);
    let successCount = 0;
    
    for (const test of activeTestsInGroup) {
      const success = await updateTestStatus(test.testId, true);
      if (success) {
        successCount++;
        setSavedTests(prev => prev.map(t => t.testId === test.testId ? { ...t, isEnded: true } : t));
      }
    }
    
    setEndingGroup(null);
    
    if (successCount === activeTestsInGroup.length) {
      toast({
        title: "일괄 종료 완료",
        description: `${successCount}개 시험이 모두 종료되었습니다.`,
      });
    } else {
      toast({
        title: "일괄 종료 부분 완료",
        description: `${activeTestsInGroup.length}개 중 ${successCount}개 시험이 종료되었습니다.`,
        variant: "destructive",
      });
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, testId: string) => {
    setDraggedTestId(testId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', testId);
  };

  const handleDragOver = (e: React.DragEvent, groupName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverGroup(groupName);
  };

  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  const handleDrop = async (e: React.DragEvent, targetGroup: TestGroup) => {
    e.preventDefault();
    setDragOverGroup(null);
    
    if (!draggedTestId) return;
    
    const draggedTest = savedTests.find(t => t.testId === draggedTestId);
    if (!draggedTest) return;
    
    // Assign this test to the target group without renaming the test title.
    const targetPrefix = targetGroup.groupName;
    const next = { ...groupOverrides };
    if (targetPrefix) {
      next[draggedTest.testId] = targetPrefix;
    } else {
      delete next[draggedTest.testId];
    }
    saveGroupOverrides(next);
    
    setDraggedTestId(null);
  };

  const handleDragEnd = () => {
    setDraggedTestId(null);
    setDragOverGroup(null);
  };

  // 검색 필터 함수
  const filterTests = (tests: QRDataType[]) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return tests;
    
    return tests.filter(test => 
      test.title.toLowerCase().includes(query) || 
      test.testId.toLowerCase().includes(query)
    );
  };

  const activeTests = filterTests(savedTests.filter(test => !test.isEnded));
  const endedTests = filterTests(savedTests.filter(test => test.isEnded));
  
  const activeGroups = groupTestsByName(activeTests);
  const endedGroups = groupTestsByName(endedTests);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  };

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const startEditingGroup = (groupName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroup(groupName);
    setEditingValue(customGroupNames[groupName] || groupName);
    setTimeout(() => editInputRef.current?.select(), 50);
  };

  const saveGroupName = async (originalName: string) => {
    const trimmed = editingValue.trim();
    const updated = { ...customGroupNames };
    if (trimmed && trimmed !== originalName) {
      updated[originalName] = trimmed;
      await supabase
        .from('test_group_names')
        .upsert({ original_name: originalName, custom_name: trimmed, updated_at: new Date().toISOString() } as any, { onConflict: 'original_name' });
    } else {
      delete updated[originalName];
      await supabase
        .from('test_group_names')
        .delete()
        .eq('original_name', originalName);
    }
    setCustomGroupNames(updated);
    setEditingGroup(null);
  };

  const getDisplayGroupName = (groupName: string) => {
    return customGroupNames[groupName] || groupName;
  };

  const hasActiveFilters = searchQuery.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50">
        <div className="max-w-5xl mx-auto">
          <Card className="p-8 space-y-6 bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
            <div className="flex justify-center items-center h-64">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-3 h-3 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const groupColors = [
    { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200', gradient: 'from-indigo-50 to-white', hoverGradient: 'hover:from-indigo-100 hover:to-indigo-50', inputBorder: 'border-indigo-300 focus:border-indigo-500', editHover: 'hover:bg-indigo-100', dropBorder: 'border-indigo-400' },
    { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-50 to-white', hoverGradient: 'hover:from-emerald-100 hover:to-emerald-50', inputBorder: 'border-emerald-300 focus:border-emerald-500', editHover: 'hover:bg-emerald-100', dropBorder: 'border-emerald-400' },
    { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', gradient: 'from-amber-50 to-white', hoverGradient: 'hover:from-amber-100 hover:to-amber-50', inputBorder: 'border-amber-300 focus:border-amber-500', editHover: 'hover:bg-amber-100', dropBorder: 'border-amber-400' },
    { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200', gradient: 'from-rose-50 to-white', hoverGradient: 'hover:from-rose-100 hover:to-rose-50', inputBorder: 'border-rose-300 focus:border-rose-500', editHover: 'hover:bg-rose-100', dropBorder: 'border-rose-400' },
    { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-50 to-white', hoverGradient: 'hover:from-purple-100 hover:to-purple-50', inputBorder: 'border-purple-300 focus:border-purple-500', editHover: 'hover:bg-purple-100', dropBorder: 'border-purple-400' },
    { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200', gradient: 'from-cyan-50 to-white', hoverGradient: 'hover:from-cyan-100 hover:to-cyan-50', inputBorder: 'border-cyan-300 focus:border-cyan-500', editHover: 'hover:bg-cyan-100', dropBorder: 'border-cyan-400' },
  ];

  const renderGroupedTests = (groups: TestGroup[], isEnded: boolean = false) => {
    if (groups.length === 0) return null;

    const sortedGroups = [...groups].sort((a, b) => {
      if (a.isSingle && !b.isSingle) return 1;
      if (!a.isSingle && b.isSingle) return -1;
      return 0;
    });

    return (
      <div className="space-y-3 font-noto">
        {sortedGroups.map(group => (
          (() => {
            const colorIdx = sortedGroups.filter(g => !g.isSingle).indexOf(group);
            const color = groupColors[colorIdx % groupColors.length];
            const isDragOver = dragOverGroup === group.groupName && !group.isSingle;
            return group.isSingle ? (
            <Card 
              key={group.tests[0].testId} 
              className={`overflow-hidden border border-slate-200/80 shadow-sm ${draggedTestId === group.tests[0].testId ? 'opacity-50' : ''}`}
              draggable={!isEnded}
              onDragStart={(e) => handleDragStart(e, group.tests[0].testId)}
              onDragEnd={handleDragEnd}
            >
              <div className="relative">
                <TestItem 
                  test={group.tests[0]} 
                  onDelete={handleDeleteTest} 
                  showQR={showQR} 
                  onToggleQR={setShowQR} 
                  onTitleUpdate={handleTitleUpdate} 
                  onTestStatusChange={handleTestStatusChange} 
                />
                {isEnded && (
                  <div className="absolute top-4 right-4 z-10">
                    <Button 
                      onClick={() => handleRestoreTest(group.tests[0].testId)} 
                      variant="outline" 
                      size="sm" 
                      className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 shadow-sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      재개
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Collapsible 
              key={group.groupName} 
              open={openGroups.has(group.groupName)}
              onOpenChange={() => toggleGroup(group.groupName)}
            >
              <Card 
                className={`overflow-hidden border ${isDragOver ? `${color.dropBorder} border-2 ring-2 ring-offset-1 ring-indigo-200` : color.border} shadow-sm transition-all`}
                onDragOver={(e) => handleDragOver(e, group.groupName)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, group)}
              >
                <CollapsibleTrigger asChild>
                  <button className={`w-full flex items-center justify-between p-3 md:p-4 bg-gradient-to-r ${color.gradient} ${color.hoverGradient} transition-colors`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${color.bg} ${color.text} shrink-0`}>
                        <FolderOpen className="h-4 w-4" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        {editingGroup === group.groupName ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Input
                              ref={editInputRef}
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveGroupName(group.groupName);
                                if (e.key === 'Escape') setEditingGroup(null);
                              }}
                              onBlur={() => saveGroupName(group.groupName)}
                              className={`h-7 text-sm font-semibold px-2 py-0 ${color.inputBorder}`}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group/edit">
                            <h3 className="font-semibold text-slate-800 text-sm md:text-base truncate">
                              {getDisplayGroupName(group.groupName)}
                            </h3>
                            <button
                              onClick={(e) => startEditingGroup(group.groupName, e)}
                              className={`opacity-0 group-hover/edit:opacity-100 transition-opacity p-0.5 rounded ${color.editHover} shrink-0`}
                              title="카테고리 이름 수정"
                            >
                              <Pencil className="h-3 w-3 text-slate-400" />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-slate-500">
                          {group.tests.length}개 시험
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* 일괄 종료 버튼 (활성 시험 탭에서만) */}
                      {!isEnded && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => e.stopPropagation()}
                              disabled={endingGroup === group.groupName}
                            >
                              <Square className="h-3.5 w-3.5 mr-1" />
                              {endingGroup === group.groupName ? '종료 중...' : '일괄종료'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-white/20 max-w-[95vw] w-[400px] mx-auto" onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>카테고리 일괄 종료</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{getDisplayGroupName(group.groupName)}" 카테고리의 {group.tests.length}개 시험을 모두 종료하시겠습니까? 종료 후에도 재개할 수 있습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                              <Input
                                type="password"
                                placeholder="관리자 액세스 코드 입력"
                                value={groupAccessCode}
                                onChange={(e) => setGroupAccessCode(e.target.value)}
                              />
                            </div>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel onClick={() => setGroupAccessCode('')} className="border-slate-300 mt-2 sm:mt-0">취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  try {
                                    const { data, error } = await supabase.functions.invoke('verify-access-code', {
                                      body: { code: groupAccessCode },
                                    });
                                    if (error || !data?.valid || !data?.isAdmin) {
                                      toast({
                                        title: "액세스 코드가 올바르지 않습니다",
                                        description: "올바른 관리자 액세스 코드를 입력해주세요.",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    setGroupAccessCode('');
                                    await handleEndGroupTests(group);
                                  } catch {
                                    toast({
                                      title: "오류 발생",
                                      description: "액세스 코드 확인 중 오류가 발생했습니다.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                전체 종료
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {openGroups.has(group.groupName) ? (
                        <ChevronDown className="h-5 w-5 text-slate-400 transition-transform" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform" />
                      )}
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-slate-100 divide-y divide-slate-100">
                    {group.tests.map(test => (
                      <div 
                        key={test.testId} 
                        className={`relative ${draggedTestId === test.testId ? 'opacity-50' : ''}`}
                        draggable={!isEnded}
                        onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, test.testId); }}
                        onDragEnd={handleDragEnd}
                      >
                        <TestItem 
                          test={test} 
                          onDelete={handleDeleteTest} 
                          showQR={showQR} 
                          onToggleQR={setShowQR} 
                          onTitleUpdate={handleTitleUpdate} 
                          onTestStatusChange={handleTestStatusChange} 
                        />
                        {isEnded && (
                          <div className="absolute top-4 right-4 z-10">
                            <Button 
                              onClick={() => handleRestoreTest(test.testId)} 
                              variant="outline" 
                              size="sm" 
                              className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 shadow-sm"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              재개
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
          })()
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-2 md:p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50">
      <div className="max-w-7xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 text-indigo-700 hover:text-indigo-900 hover:bg-white/50 transition-all shadow-sm" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로가기
        </Button>

        <Card className="p-4 md:p-8 space-y-6 md:space-y-8 bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                onClick={() => navigate('/admin')} 
                variant="outline" 
                className="shadow-sm border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all whitespace-nowrap" 
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="h-4 w-4" />
                <span className="ml-2">시험 생성</span>
              </Button>

              {savedTests.length > 0 && <BulkResultDialog tests={savedTests} />}
              
              {savedTests.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 shadow-sm whitespace-nowrap" 
                      size={isMobile ? "sm" : "default"}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2">전체 삭제</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-white/20 max-w-[95vw] w-[400px] mx-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle>모든 시험을 삭제하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        이 작업은 되돌릴 수 없으며, 모든 시험 데이터와 결과가 영구적으로 삭제됩니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="border-slate-300 mt-2 sm:mt-0">취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllTests} className="bg-red-600 hover:bg-red-700">
                        모두 삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* 검색 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {isMobile ? (
                <>
                  <div className={`flex-1 transition-all duration-200 ${isSearchOpen ? 'block' : 'hidden'}`}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="시험명 또는 시험코드..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-9 h-10 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-xl shadow-sm"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSearchToggle}
                    className={`h-10 w-10 rounded-xl border-slate-200 shadow-sm shrink-0 ${isSearchOpen ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : ''}`}
                  >
                    {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                  </Button>
                </>
              ) : (
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="시험명 또는 시험코드로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-10 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-xl shadow-sm"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-500">검색 결과:</span>
                <span className="font-medium text-indigo-600">{activeTests.length + endedTests.length}개</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                  "{searchQuery}"
                </span>
              </div>
            )}
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                활성 시험 ({activeTests.length})
              </TabsTrigger>
              <TabsTrigger value="ended" className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                종료된 시험 ({endedTests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeGroups.length > 0 ? (
                renderGroupedTests(activeGroups, false)
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="w-24 h-24 mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-10 5a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">활성 시험이 없습니다</h3>
                  <p className="text-gray-500 mb-6 text-center max-w-md">
                    새로운 시험을 만들어 학생들의 참여를 시작하세요.
                  </p>
                  <Button 
                    onClick={() => navigate('/admin')} 
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all shadow-md"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    시험 생성하기
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ended" className="space-y-4">
              {endedGroups.length > 0 ? (
                renderGroupedTests(endedGroups, true)
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="w-24 h-24 mb-6 rounded-full bg-gray-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">종료된 시험이 없습니다</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    종료된 시험들이 여기에 보관됩니다. 언제든지 재개할 수 있습니다.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default TestList;
