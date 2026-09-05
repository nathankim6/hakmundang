
import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { CalendarDays, School, GraduationCap, FileText, UserRound } from "lucide-react";
import { getSchoolThemeColor } from '@/utils/themeColorUtils';

interface ReportInfoCardsProps {
  reportData: {
    school: string;
    grade: string;
    examScope: string;
    teacher: string;
    examInfo?: string;
  };
  themeColors: any;
}

const ReportInfoCards: React.FC<ReportInfoCardsProps> = ({ reportData, themeColors }) => {
  const [gradeThemeClass, setGradeThemeClass] = useState<string>("text-blue-600");
  
  // Determine appropriate theme class based on grade
  useEffect(() => {
    const { color } = getSchoolThemeColor(reportData.school, reportData.grade);
    setGradeThemeClass(`text-${color}-600`);
  }, [reportData.school, reportData.grade]);
  
  return (
    <>
      <div className="grid grid-cols-4 gap-3 perspective-lg">
        <Card className="col-span-2 p-4 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm transform hover:-translate-y-1 rounded-xl overflow-hidden" style={{
          background: `radial-gradient(circle at top left, ${themeColors.light}50, transparent 70%), linear-gradient(135deg, ${themeColors.pastel}, ${themeColors.accent}10, white)`,
          boxShadow: `0 4px 20px ${themeColors.light}50`
        }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r" style={{
            backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.vibrant})`
          }}></div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg group-hover:scale-110 transition-transform duration-300" style={{
              background: `linear-gradient(135deg, ${themeColors.light}, ${themeColors.accent2})`,
              boxShadow: `0 2px 10px ${themeColors.light}80`
            }}>
              <CalendarDays className="h-5 w-5 text-gray-800" />
            </div>
            <p className="text-sm font-semibold tracking-tight text-gray-800">시험 정보</p>
          </div>
          <p className="mt-1 text-gray-700 text-lg font-extrabold">{reportData.examInfo || "Not specified"}</p>
        </Card>
        
        <Card className="p-4 hover:shadow-xl transition-all duration-300 group backdrop-blur-sm transform hover:-translate-y-1 rounded-xl overflow-hidden border-0" style={{
          background: `radial-gradient(circle at bottom right, ${themeColors.light}50, transparent 70%), linear-gradient(135deg, ${themeColors.pastel}, ${themeColors.accent}10, white)`,
          boxShadow: `0 4px 20px ${themeColors.light}50`
        }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r" style={{
            backgroundImage: `linear-gradient(to right, ${themeColors.vibrant}, ${themeColors.accent2})`
          }}></div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-inner" style={{
              background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.highlight})`,
              boxShadow: `0 2px 10px ${themeColors.light}80`
            }}>
              <School className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-semibold tracking-tight text-gray-800">학교</p>
          </div>
          <p className="mt-1 text-gray-700 text-lg font-extrabold">{reportData.school}</p>
        </Card>
        
        <Card className="p-4 hover:shadow-xl transition-all duration-300 group backdrop-blur-sm transform hover:-translate-y-1 rounded-xl overflow-hidden border-0" style={{
          background: `radial-gradient(circle at top right, ${themeColors.pastel}, transparent 70%), linear-gradient(135deg, ${themeColors.light}30, ${themeColors.accent}10, white)`,
          boxShadow: `0 4px 20px ${themeColors.light}50`
        }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r" style={{
            backgroundImage: `linear-gradient(to right, ${themeColors.accent2}, ${themeColors.highlight})`
          }}></div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg group-hover:scale-110 transition-transform duration-300" style={{
              background: `linear-gradient(135deg, ${themeColors.vibrant}, ${themeColors.accent2})`,
              boxShadow: `0 2px 10px ${themeColors.light}80`
            }}>
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-semibold tracking-tight text-gray-800">학년</p>
          </div>
          <p className="mt-1 text-gray-700 text-lg font-extrabold">{reportData.grade}</p>
        </Card>
      </div>

      <Card className="col-span-4 p-4 hover:shadow-xl transition-all duration-300 group backdrop-blur-sm transform hover:-translate-y-1 rounded-xl overflow-hidden border-0 mt-2" style={{
        background: `radial-gradient(circle at center, ${themeColors.pastel}, transparent 70%), linear-gradient(135deg, ${themeColors.light}30, ${themeColors.accent}10, white)`,
        boxShadow: `0 4px 20px ${themeColors.light}50`
      }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r" style={{
          backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.vibrant}, ${themeColors.accent2})`
        }}></div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Left column - Exam scope */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg group-hover:scale-110 transition-transform duration-300" style={{
                background: `linear-gradient(135deg, ${themeColors.highlight}, ${themeColors.accent2})`,
                boxShadow: `0 2px 10px ${themeColors.light}80`
              }}>
                <FileText className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-semibold tracking-tight text-gray-800">시험 범위</p>
            </div>
            <p className="mt-1 text-slate-950 text-base font-medium">{reportData.examScope}</p>
          </div>
          
          {/* Right column - Teacher information */}
          <div className="border-l pl-4" style={{ borderColor: `${themeColors.light}` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg group-hover:scale-110 transition-transform duration-300" style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.vibrant})`,
                boxShadow: `0 2px 10px ${themeColors.light}80`
              }}>
                <UserRound className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-semibold tracking-tight text-gray-800">담당 강사</p>
            </div>
            <div className="mt-1">
              <p className="text-slate-950 text-base font-medium">{reportData.teacher}</p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default ReportInfoCards;
