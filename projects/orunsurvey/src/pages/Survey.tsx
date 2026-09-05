import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TimeRangeSlider } from "@/components/TimeRangeSlider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import logo from "@/assets/logo.jpg";
import curriculum from "@/assets/curriculum.png";
interface TimeRange {
  start: number;
  end: number;
}
const Survey = () => {
  const {
    toast
  } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    school: "",
    name: "",
    joinClass: "",
    joinClassOther: "",
    examType: "",
    saturdayRanges: [] as TimeRange[],
    sundayRanges: [] as TimeRange[],
    additionalComments: ""
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.school || !formData.name || !formData.joinClass || !formData.examType) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    try {
      // Convert time ranges to database format
      const timeSlots = [...formData.saturdayRanges.map(range => ({
        day: "토요일",
        start: range.start,
        end: range.end
      })), ...formData.sundayRanges.map(range => ({
        day: "일요일",
        start: range.start,
        end: range.end
      }))];
      const {
        error
      } = await supabase.from('survey_responses').insert({
        school: formData.school,
        name: formData.name,
        join_class: formData.joinClass,
        join_class_other: formData.joinClassOther || null,
        exam_type: formData.examType,
        time_slots: timeSlots,
        additional_comments: formData.additionalComments || null
      });
      if (error) throw error;
      setSubmitted(true);
      toast({
        title: "제출 완료",
        description: "설문조사가 성공적으로 제출되었습니다."
      });
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        title: "제출 실패",
        description: "설문조사 제출 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };
  if (submitted) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">제출 완료</h2>
            <p className="text-muted-foreground">
              설문조사에 참여해 주셔서 감사합니다.<br />
              입력하신 정보는 안전하게 저장되었습니다.
            </p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
            새로운 설문 작성
          </Button>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent-hover to-accent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center justify-center gap-6">
              <img src={logo} alt="옳은영어 로고" className="h-16 w-auto" />
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold mb-2 tracking-wide">
                  <span className="text-accent">옳은영어</span> 설문조사 플랫폼
                </h1>
                <p className="text-primary-foreground/90 text-lg">Orun English Feedback & Survey Platform</p>
              </div>
            </div>
            <div className="flex-1 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth'} className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                설문조사 생성
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Intro Card */}
        <Card className="p-6 mb-6 border-l-4 border-accent animate-fade-in">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground/80 mb-2">
                📝 이 페이지는 <strong>예시 설문조사</strong>입니다. 관리자는 <Button variant="link" className="h-auto p-0 text-sm" onClick={() => window.location.href = '/auth'}>액세스 코드</Button>로 로그인하여 새로운 설문조사를 만들 수 있습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                안녕하세요! 1월부터 시작되는 정시반 운영을 위해 설문조사를 진행합니다.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  커리큘럼 확인
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>정시반 커리큘럼</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <img src={curriculum} alt="정시반 커리큘럼" className="w-full h-auto" />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 md:p-8 animate-fade-in" style={{
        animationDelay: "0.1s"
      }}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: 기본 정보 */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school">학교 *</Label>
                  <Input id="school" value={formData.school} onChange={e => setFormData({
                  ...formData,
                  school: e.target.value
                })} placeholder="학교명을 입력하세요" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({
                  ...formData,
                  name: e.target.value
                })} placeholder="이름을 입력하세요" required />
                </div>
              </div>
            </div>

            {/* Section 1: 정시반 합류 여부 */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold text-foreground">1월부터 시작되는 옳은영어 정시반에 합류하시겠습니까?</h2>
              </div>

              <RadioGroup value={formData.joinClass} onValueChange={value => setFormData({
              ...formData,
              joinClass: value
            })}>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-xl cursor-pointer transition-all hover:bg-secondary border-2 border-transparent data-[state=checked]:border-primary">
                    <RadioGroupItem value="예" id="yes" />
                    <Label htmlFor="yes" className="cursor-pointer flex-1">예, 합류하겠습니다</Label>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-xl cursor-pointer transition-all hover:bg-secondary border-2 border-transparent data-[state=checked]:border-primary">
                    <RadioGroupItem value="아니오" id="no" />
                    <Label htmlFor="no" className="cursor-pointer flex-1">아니오, 합류하지 않겠습니다 (혼자 준비, 종강)</Label>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-xl cursor-pointer transition-all hover:bg-secondary border-2 border-transparent data-[state=checked]:border-primary">
                    <RadioGroupItem value="기타" id="other-join" />
                    <Label htmlFor="other-join" className="cursor-pointer flex-1">기타</Label>
                  </label>
                </div>
              </RadioGroup>

              {formData.joinClass === "기타" && <Input value={formData.joinClassOther} onChange={e => setFormData({
              ...formData,
              joinClassOther: e.target.value
            })} placeholder="ex) 1월 윈터스쿨 참가 후 합류" className="mt-3" />}

              <div className="bg-muted/50 rounded-lg p-4 mt-4 text-sm text-muted-foreground space-y-1">
                <p>*수강료 월 330,000원 / 수업시간: 주1회, 4시간 / 수업방식: 1주 1회 실전모의고사+주간지+피드백</p>
                <p>*고3은 학교별 내신 대비반이 별도로 개설되지 않습니다. 수시 희망학생은 시험기간 별도로 학습 자료를 제공합니다.</p>
              </div>
            </div>

            {/* Section 2: 전형 준비 */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  2
                </div>
                <h2 className="text-lg font-bold text-foreground">어떤 전형으로 대입을 준비하실 계획인가요?</h2>
              </div>

              <RadioGroup value={formData.examType} onValueChange={value => setFormData({
              ...formData,
              examType: value
            })}>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-xl cursor-pointer transition-all hover:bg-secondary border-2 border-transparent data-[state=checked]:border-primary">
                    <RadioGroupItem value="내신대비" id="naesin" />
                    <Label htmlFor="naesin" className="cursor-pointer flex-1">내신대비(수시)만</Label>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-xl cursor-pointer transition-all hover:bg-secondary border-2 border-transparent data-[state=checked]:border-primary">
                    <RadioGroupItem value="정시만" id="jeongsi-only" />
                    <Label htmlFor="jeongsi-only" className="cursor-pointer flex-1">정시만</Label>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-xl cursor-pointer transition-all hover:bg-secondary border-2 border-transparent data-[state=checked]:border-primary">
                    <RadioGroupItem value="둘다준비" id="both-prep" />
                    <Label htmlFor="both-prep" className="cursor-pointer flex-1">둘 다 준비</Label>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Section 3: 수강 가능 시간대 */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  3
                </div>
                <h2 className="text-lg font-bold text-foreground">현재 기준(또는 예상) 수업 가능한 요일과 시간대를 선택해 주세요.</h2>
              </div>

              <div className="bg-accent/10 border-l-4 border-accent rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground font-medium">
                  ✓ 드래그하여 시간 범위를 선택하세요
                </p>
                <p className="text-sm text-foreground font-medium mt-2">
                  ✓ 가능한 시간범위를 최대한으로 체크해주세요.
                </p>
                <p className="text-xs text-muted-foreground mt-1">*여러 시간대를 자유롭게 추가할 수 있습니다 (ex: 오전 9시 ~ 오후 1시, 오후 5시 ~ 오후 7시)</p>
              </div>

              <div className="space-y-6">
                <TimeRangeSlider day="토요일" selectedRanges={formData.saturdayRanges} onChange={ranges => setFormData({
                ...formData,
                saturdayRanges: ranges
              })} />
                <TimeRangeSlider day="일요일" selectedRanges={formData.sundayRanges} onChange={ranges => setFormData({
                ...formData,
                sundayRanges: ranges
              })} />
              </div>
            </div>

            {/* Section 4: 기타 의견 */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  4
                </div>
                <h2 className="text-lg font-bold text-foreground">기타 의견 (선택사항)</h2>
              </div>

              <Textarea value={formData.additionalComments} onChange={e => setFormData({
              ...formData,
              additionalComments: e.target.value
            })} placeholder="기타 의견을 자유롭게 작성해 주세요" className="min-h-[120px] resize-none" />
            </div>

            {/* 제출 기한 안내 */}
            <div className="pt-4">
              
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button type="submit" className="w-full bg-gradient-to-r from-accent to-accent-hover text-accent-foreground py-6 text-lg font-semibold hover:shadow-lg transition-all" size="lg">
                설문 제출하기
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-4">
                설문에 응해 주셔서 감사합니다!
              </p>
            </div>
          </form>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 ORUN ENGLISH. All rights reserved.
          </p>
        </div>
      </footer>
    </div>;
};
export default Survey;