import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { DepartmentTab } from "@/components/DepartmentTab";
import { EmployeeList } from "@/components/EmployeeList";
import { DailyReportForm } from "@/components/DailyReportForm";
import { ReportList } from "@/components/ReportList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  FileText, 
  Users, 
  Calendar as CalendarIcon, 
  ListFilter,
  BarChart4,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmployeeDepartment } from "@/lib/types";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEmployeeStore, setupEmployeeSubscription } from "@/lib/employeeStore";
import { useReportStore, setupReportSubscription } from "@/lib/reportStore";
import { useAuthStore } from "@/lib/authStore";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const DailyReport = () => {
  const { toast } = useToast();
  const { fetchEmployees, isLoading: employeesLoading } = useEmployeeStore();
  const { fetchReports, isLoading: reportsLoading } = useReportStore();
  const { isAdmin } = useAuthStore();
  const [activeDepartment, setActiveDepartment] = useState<EmployeeDepartment>('administration');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'write' | 'view'>('write');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [approvalFilter, setApprovalFilter] = useState<string>('all');

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchReports()])
      .then(() => {
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });

    const employeeChannel = setupEmployeeSubscription();
    const reportChannel = setupReportSubscription();

    return () => {
      supabase.removeChannel(employeeChannel);
      supabase.removeChannel(reportChannel);
    };
  }, [fetchEmployees, fetchReports]);

  const handleRefresh = () => {
    setIsLoading(true);
    Promise.all([fetchEmployees(), fetchReports()])
      .then(() => {
        setIsLoading(false);
        toast({
          title: "새로고침 완료",
          description: "최신 리포트 정보로 업데이트되었습니다."
        });
      })
      .catch(error => {
        console.error("Error refreshing data:", error);
        setIsLoading(false);
        toast({
          title: "새로고침 실패",
          description: "리포트 정보를 업데이트하는 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      });
  };

  const handleDateChange = (newDate: Date) => {
    setDate(format(newDate, 'yyyy-MM-dd'));
    toast({
      title: `${format(newDate, 'PPP', { locale: ko })} 리포트`,
      description: "선택한 날짜의 리포트를 불러왔습니다."
    });
  };

  const handleDepartmentChange = (department: EmployeeDepartment) => {
    setActiveDepartment(department);
    setSelectedEmployeeId(null);
  };

  const handleEditReport = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setActiveTab('write');
  };

  const departments: EmployeeDepartment[] = ['administration', 'elementary', 'middle', 'high', 'assistant'];
  const isDataLoading = isLoading || employeesLoading || reportsLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background animate-fade-in">
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col gap-6">
        <Header />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-4">
          <div>
            <h2 className="text-3xl font-bold text-gradient bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              데일리 리포트
            </h2>
            <p className="text-muted-foreground">
              직원들의 일일 업무 보고서를 작성하고 확인할 수 있습니다.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-card/80 rounded-full px-4 py-2 border shadow-sm hover:shadow-md flex items-center transition-all duration-300"
                >
                  <CalendarIcon className="h-4 w-4 text-primary mr-2" />
                  <span>{format(new Date(date), 'PPP', { locale: ko })}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar 
                  mode="single" 
                  selected={new Date(date)} 
                  onSelect={newDate => newDate && handleDateChange(newDate)} 
                  locale={ko} 
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={isDataLoading} 
              className="rounded-full shadow-sm hover:shadow-md transition-all duration-300"
            >
              <RefreshCw className={`h-4 w-4 ${isDataLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-secondary/50 to-background rounded-xl p-2 flex space-x-2 overflow-x-auto shadow-sm border backdrop-blur-sm">
          {departments.map(department => (
            <DepartmentTab 
              key={department} 
              department={department} 
              active={activeDepartment === department} 
              onClick={() => handleDepartmentChange(department)} 
            />
          ))}
        </div>
        
        {isDataLoading ? (
          <div className="flex-1 grid place-items-center py-20">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-10 w-10 animate-spin text-primary/50 mb-4" />
              <p className="text-muted-foreground">리포트 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            <Card className="lg:col-span-1 shadow-md border-primary/10 overflow-hidden bg-card/80 backdrop-blur-sm animate-scale-in">
              <CardHeader className="bg-gradient-to-r from-secondary/30 to-background pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>직원 목록</span>
                  </CardTitle>
                  <Badge variant="outline" className="px-2 py-1 bg-primary/10 text-primary">
                    {getDepartmentName(activeDepartment)}
                  </Badge>
                </div>
                <CardDescription>
                  보고서를 작성할 직원을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <EmployeeList 
                  department={activeDepartment} 
                  selectedEmployeeId={selectedEmployeeId} 
                  onSelectEmployee={setSelectedEmployeeId} 
                />
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2 shadow-md border-primary/10 overflow-hidden bg-card/80 backdrop-blur-sm animate-slide-in">
              <CardContent className="p-0">
                {selectedEmployeeId ? (
                  <Tabs 
                    value={activeTab} 
                    onValueChange={value => setActiveTab(value as 'write' | 'view')} 
                    className="w-full"
                  >
                    <TabsList className="w-full bg-secondary/50 rounded-none border-b">
                      <TabsTrigger 
                        value="write" 
                        className="flex items-center flex-1 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        <span>리포트 작성</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="view" 
                        className="flex items-center flex-1 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                      >
                        <BarChart4 className="h-4 w-4 mr-2" />
                        <span>부서 리포트 확인</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="write" className="p-6 mt-0">
                      <DailyReportForm 
                        employeeId={selectedEmployeeId} 
                        onSaved={() => setActiveTab('view')} 
                        onDeleted={() => setActiveTab('view')} 
                      />
                    </TabsContent>
                    
                    <TabsContent value="view" className="p-6 mt-0">
                      <div className="space-y-4">
                        {isAdmin && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium mb-2">결재 상태 필터</h4>
                            <ToggleGroup type="single" value={approvalFilter} onValueChange={(val) => val && setApprovalFilter(val)}>
                              <ToggleGroupItem value="all" className="flex items-center gap-1">
                                <ListFilter className="h-4 w-4" />
                                <span>전체</span>
                              </ToggleGroupItem>
                              <ToggleGroupItem value="pending" className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>대기중</span>
                              </ToggleGroupItem>
                              <ToggleGroupItem value="approved" className="flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>승인됨</span>
                              </ToggleGroupItem>
                              <ToggleGroupItem value="rejected" className="flex items-center gap-1">
                                <XCircle className="h-4 w-4" />
                                <span>반려됨</span>
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        )}
                        
                        <h2 className="text-xl font-semibold mb-4 text-foreground/90 flex items-center gap-2">
                          <ListFilter className="h-5 w-5 text-primary" />
                          <span>부서 리포트</span>
                        </h2>
                        <ReportList 
                          department={activeDepartment} 
                          date={date} 
                          onEditReport={handleEditReport} 
                          approvalFilter={approvalFilter}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="h-full flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                      <div className="bg-secondary/30 p-4 rounded-full inline-block mb-4">
                        <FileText className="h-10 w-10 text-primary/70" />
                      </div>
                      <h3 className="text-2xl font-medium mb-2">부서 리포트</h3>
                      <p className="text-muted-foreground mb-6">
                        {format(new Date(date), 'PPP', { locale: ko })}의 {getDepartmentName(activeDepartment)} 리포트입니다.
                      </p>
                      {isAdmin && (
                        <div className="mb-6">
                          <ToggleGroup type="single" value={approvalFilter} onValueChange={(val) => val && setApprovalFilter(val)}>
                            <ToggleGroupItem value="all" className="flex items-center gap-1">
                              <ListFilter className="h-4 w-4" />
                              <span>전체</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value="pending" className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>대기중</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value="approved" className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>승인됨</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value="rejected" className="flex items-center gap-1">
                              <XCircle className="h-4 w-4" />
                              <span>반려됨</span>
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      )}
                      <Card className="shadow-sm border-primary/5 mx-0">
                        <CardContent className="p-4">
                          <ReportList 
                            department={activeDepartment} 
                            date={date} 
                            onEditReport={handleEditReport} 
                            approvalFilter={approvalFilter}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

function getDepartmentName(department: EmployeeDepartment): string {
  switch (department) {
    case 'administration':
      return '행정부';
    case 'elementary':
      return '초등부';
    case 'middle':
      return '중등부';
    case 'high':
      return '고등부';
    case 'assistant':
      return '조교부';
    default:
      return '';
  }
}

export default DailyReport;
