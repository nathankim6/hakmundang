import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, FileText } from "lucide-react";
const GradeSection = () => {
  const grades = [{
    level: "중등 1학년",
    topics: ["be동사", "일반동사", "현재시제", "과거시제"],
    questions: 520,
    students: 1240,
    color: "from-blue-500 to-cyan-500"
  }, {
    level: "중등 2학년",
    topics: ["현재완료", "수동태", "to부정사", "동명사"],
    questions: 680,
    students: 980,
    color: "from-violet-500 to-purple-500"
  }, {
    level: "중등 3학년",
    topics: ["관계대명사", "분사구문", "가정법", "화법"],
    questions: 750,
    students: 860,
    color: "from-orange-500 to-amber-500"
  }, {
    level: "고등 1학년",
    topics: ["시제 심화", "조동사", "가정법 심화", "특수구문"],
    questions: 920,
    students: 1120,
    color: "from-emerald-500 to-teal-500"
  }];
  return null;
};
export default GradeSection;