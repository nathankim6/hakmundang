import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserWork, useMyWorksService } from './MyWorksService';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import { MoreVertical, Trash2, ExternalLink, List, Grid, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WorksSearch from './WorksSearch';
import WorkDetailModal from './WorkDetailModal';
import { stepNames, stepRoutes } from './constants';

const WorksList = () => {
  const [works, setWorks] = useState<UserWork[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<UserWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedWork, setSelectedWork] = useState<UserWork | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const {
    fetchWorksByAccessCode,
    deleteWork
  } = useMyWorksService();
  const {
    isAuthenticated,
    isAdmin
  } = useAccessCode();
  const accessCode = localStorage.getItem('accessCode') || '';
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/access');
      return;
    }
    const loadWorks = async () => {
      setLoading(true);
      try {
        console.log("Fetching works for access code:", accessCode);

        const {
          data,
          error
        } = await supabase.from('user_works').select('*').order('created_at', {
          ascending: false
        });
        if (error) {
          console.error("Error fetching works from Supabase:", error);
          throw error;
        }
        console.log("Successfully fetched works:", data?.length || 0);
        setWorks(data || []);
        applyFilters(data || [], activeTab, searchQuery);
      } catch (error) {
        console.error("Error in loadWorks:", error);
        toast({
          variant: "destructive",
          title: "데이터 불러오기 오류",
          description: "저장된 작업을 불러오는 중 오류가 발생했습니다."
        });
        setWorks([]);
        setFilteredWorks([]);
      } finally {
        setLoading(false);
      }
    };
    loadWorks();
  }, [isAuthenticated, navigate, accessCode, toast]);

  const applyFilters = (worksToFilter: UserWork[], tab: string, query: string) => {
    let result = [...worksToFilter];

    if (tab !== 'all') {
      const stepNumber = parseInt(tab);
      result = result.filter(work => work.step_number === stepNumber);
    }

    if (query.trim() !== '') {
      const lowerQuery = query.toLowerCase();
      result = result.filter(work => work.content.toLowerCase().includes(lowerQuery) || work.result.toLowerCase().includes(lowerQuery) || work.title && work.title.toLowerCase().includes(lowerQuery));
    }
    setFilteredWorks(result);
  };

  useEffect(() => {
    applyFilters(works, activeTab, searchQuery);
  }, [activeTab, searchQuery, works]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "권한 오류",
        description: "관리자만 작업을 삭제할 수 있습니다."
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from('user_works').delete().eq('id', id);
      if (error) {
        throw error;
      }
      toast({
        title: "삭제 완료",
        description: "작업이 성공적으로 삭제되었습니다."
      });
      setWorks(prev => prev.filter(work => work.id !== id));
    } catch (error) {
      console.error("Error deleting work:", error);
      toast({
        variant: "destructive",
        title: "삭제 오류",
        description: "작업 삭제 중 오류가 발생했습니다."
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  const navigateToStep = (stepNumber: number) => {
    navigate(stepRoutes[stepNumber]);
  };

  const openWorkDetail = (work: UserWork) => {
    setSelectedWork(work);
    setModalOpen(true);
  };

  const renderGridView = () => {
    if (filteredWorks.length === 0) {
      return <div className="text-center py-8 text-gray-500">
          {searchQuery ? "검색 결과가 없습니다." : "저장된 작업이 없습니다."}
        </div>;
    }
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorks.map(work => <Card key={work.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => openWorkDetail(work)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    {work.title || `Step ${work.step_number} 결과`}
                  </CardTitle>
                  <CardDescription>
                    {stepNames[work.step_number]} | {formatDate(work.created_at)}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={e => {
                  e.stopPropagation();
                  openWorkDetail(work);
                }}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>전체 내용 보기</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={e => {
                  e.stopPropagation();
                  navigateToStep(work.step_number);
                }}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span>{stepNames[work.step_number]}으로 이동</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={e => {
                  e.stopPropagation();
                  handleDelete(work.id);
                }} className="text-red-600" disabled={!isAdmin}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>삭제</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-sm text-gray-700 line-clamp-3 mb-2">
                <span className="font-medium">입력:</span> {work.content.substring(0, 120)}...
              </div>
              <div className="text-sm text-gray-700 line-clamp-3">
                <span className="font-medium">결과:</span> {work.result.substring(0, 120)}...
              </div>
            </CardContent>
          </Card>)}
      </div>;
  };

  const renderTableView = () => {
    if (filteredWorks.length === 0) {
      return <div className="text-center py-8 text-gray-500">
          {searchQuery ? "검색 결과가 없습니다." : "저장된 작업이 없습니다."}
        </div>;
    }
    return <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead>내용</TableHead>
              <TableHead className="w-[100px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorks.map(work => <TableRow key={work.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openWorkDetail(work)}>
                <TableCell className="font-medium">
                  {work.title || `Step ${work.step_number} 결과`}
                </TableCell>
                <TableCell>{stepNames[work.step_number]}</TableCell>
                <TableCell>{formatDate(work.created_at)}</TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate">{work.content.substring(0, 60)}...</div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={e => {
                  e.stopPropagation();
                  openWorkDetail(work);
                }}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={e => {
                  e.stopPropagation();
                  navigateToStep(work.step_number);
                }}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={e => {
                  e.stopPropagation();
                  handleDelete(work.id);
                }} disabled={!isAdmin} className="text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </div>;
  };

  if (loading) {
    return <div className="space-y-4">
        {[1, 2, 3].map(i => <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-1/5" />
            </CardFooter>
          </Card>)}
      </div>;
  }

  return <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <WorksSearch onSearch={handleSearch} />
        
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')} className="w-10 p-0">
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')} className="w-10 p-0">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="1">Step 1: 분석지</TabsTrigger>
          <TabsTrigger value="2">Step 2: 내용분석</TabsTrigger>
          <TabsTrigger value="3">Step 3: 선택/배열/영작</TabsTrigger>
          <TabsTrigger value="4">Step 4: 동반어</TabsTrigger>
          <TabsTrigger value="5">Step 5: 삽화 생성</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {viewMode === 'grid' ? renderGridView() : renderTableView()}
        </TabsContent>
      </Tabs>
      
      <WorkDetailModal work={selectedWork} open={modalOpen} onOpenChange={setModalOpen} />
    </div>;
};

export default WorksList;
