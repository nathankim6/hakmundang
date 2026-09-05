import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { FileSpreadsheet, BarChart3, GraduationCap } from "lucide-react";
import MockExamScoreSheet from "@/components/schools/MockExamScoreSheet";
import ExamCorrelationAnalysis from "@/components/schools/ExamCorrelationAnalysis";

export default function MockExam() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        title="모의고사 관리"
        description="학생별 모의고사 점수를 기록하고, 과제 이행률과의 상관관계를 분석합니다."
      />

      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="scores" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            모의고사 성적
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            성적-과제 분석
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="mt-4">
          <MockExamScoreSheet />
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <ExamCorrelationAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}
