import { useState } from "react";
import { RefreshCw, Archive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/TaskList";
import { DeletedTaskList } from "@/components/DeletedTaskList";
import { useTaskStore } from "@/lib/taskStore";
import { useToast } from "@/hooks/use-toast";
export const TaskManager = () => {
  const {
    toast
  } = useToast();
  const {
    getVisibleTasks,
    getDeletedTasks,
    fetchTasks,
    isLoading: storeLoading
  } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>("active");
  const tasks = getVisibleTasks();
  const deletedTasks = getDeletedTasks();
  const formattedLastUpdated = new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }).format(lastUpdated);
  const handleRefresh = () => {
    setIsLoading(true);
    fetchTasks().then(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
      toast({
        title: "새로고침 완료",
        description: "최신 업무 정보로 업데이트되었습니다."
      });
    }).catch(error => {
      console.error("Error refreshing tasks:", error);
      setIsLoading(false);
      toast({
        title: "새로고침 실패",
        description: "업무 정보를 업데이트하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    });
  };
  return <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-4">
        <div>
          <h2 className="text-2xl font-bold"></h2>
          <p className="text-muted-foreground">
            직원들에게 업무를 할당하고 진행 상황을 실시간으로 관리하세요.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <TabsList className="mr-4">
            <TabsTrigger value="active" className="relative">
              활성 업무
              <span className="ml-1.5 bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-xs">
                {tasks.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="deleted" className="relative">
              <Archive className="h-4 w-4 mr-2" />
              삭제된 업무
              <span className="ml-1.5 bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-xs">
                {deletedTasks.length}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-muted-foreground">
            마지막 업데이트: {formattedLastUpdated}
          </div>
          
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading || storeLoading} className="relative">
            <RefreshCw className={`h-4 w-4 ${isLoading || storeLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {isLoading || storeLoading ? <div className="flex-1 grid place-items-center py-20">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">업무 정보를 불러오는 중...</p>
          </div>
        </div> : <div className="flex-1 mt-6">
          <TabsContent value="active" className="mt-0">
            <TaskList />
          </TabsContent>
          <TabsContent value="deleted" className="mt-0">
            <div className="bg-muted/30 p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">삭제된 업무 목록</h3>
              <DeletedTaskList />
            </div>
          </TabsContent>
        </div>}
    </Tabs>;
};