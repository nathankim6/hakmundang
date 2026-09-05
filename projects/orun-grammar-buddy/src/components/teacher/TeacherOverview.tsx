import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, ClipboardList, TrendingUp, Calendar, Award } from "lucide-react";

const TeacherOverview = () => {
  const stats = [
    { label: "등록된 학생", value: "156", icon: Users, trend: "+12 이번 달" },
    { label: "문제 수", value: "2,340", icon: FileText, trend: "+89 이번 주" },
    { label: "진행된 시험", value: "45", icon: ClipboardList, trend: "3개 예정" },
    { label: "평균 정답률", value: "78%", icon: TrendingUp, trend: "+5% 향상" },
  ];

  const upcomingExams = [
    { name: "중2 문법 정기고사", date: "2026-01-10", students: 42 },
    { name: "중3 종합 테스트", date: "2026-01-12", students: 38 },
    { name: "고1 심화 문법", date: "2026-01-15", students: 35 },
  ];

  const recentActivity = [
    { action: "새 문제 등록", detail: "관계대명사 15문항", time: "10분 전" },
    { action: "학생 추가", detail: "김민수 (중2)", time: "1시간 전" },
    { action: "시험 출제", detail: "중2 정기고사 #5", time: "3시간 전" },
    { action: "리포트 생성", detail: "박지영 개별 리포트", time: "5시간 전" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-secondary mt-1">{stat.trend}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              예정된 시험
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExams.map((exam, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{exam.name}</p>
                    <p className="text-sm text-muted-foreground">{exam.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {exam.students}명
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.detail}</p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherOverview;
