
import { Cake } from "lucide-react";
import { Employee } from "@/lib/types";

interface MonthlyBirthdayListProps {
  employees: Employee[];
}

export const MonthlyBirthdayList = ({ employees }: MonthlyBirthdayListProps) => {
  return (
    <div className="app-card overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <div className="bg-white dark:bg-slate-700 p-2 rounded-full shadow-sm">
            <Cake className="h-5 w-5 text-pink-500" />
          </div>
          이달의 생일
        </h3>
      </div>
      
      <div className="p-4">
        {employees.length > 0 ? (
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
            {employees.map(employee => (
              <div 
                key={employee.id} 
                className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-pink-50 to-pink-50/70 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-100 dark:border-pink-900/30 hover:shadow-md transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-pink-200 dark:bg-pink-800 overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-700 shadow-sm">
                  <img src={employee.avatar} alt={employee.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800 dark:text-slate-200">{employee.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center flex-wrap gap-1 mt-1">
                    <span className="bg-gradient-to-r from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/50 text-pink-800 dark:text-pink-300 px-2 py-0.5 rounded-full text-[10px] uppercase font-medium shadow-sm">
                      {employee.position}
                    </span>
                    <span className="mx-1 opacity-50">•</span>
                    <span className="whitespace-nowrap font-mono">
                      {employee.birthdayMonth}월 {employee.birthdayDay}일
                      {employee.calendarType === 'lunar' ? ' (음력)' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
              <Cake className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-muted-foreground">이번 달 생일자가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
