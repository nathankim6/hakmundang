
import { cn } from "@/lib/utils";

interface ClassSelectorProps {
  selectedClass: string;
  classes: any[];
  onClassSelect: (classId: string) => void;
}

// 학교 로고 매핑
const schoolLogos: Record<string, string> = {
  '구암고': '/lovable-uploads/guam-logo.png',
  '당곡고': '/lovable-uploads/danggok-logo.png',
  '성남고': '/lovable-uploads/seongnam-logo.png',
  '숭의여고': '/lovable-uploads/soongeui-logo.png',
  '영등포고': '/lovable-uploads/yeongdeungpo-logo-new.png',
  '정시반': '/lovable-uploads/jeongsi-logo.webp',
};

export const ClassSelector = ({
  selectedClass,
  classes,
  onClassSelect,
}: ClassSelectorProps) => {
  // Group classes by school name
  const groupedClasses = classes.reduce((acc: Record<string, any[]>, cls) => {
    // Extract school name from class name (assuming format "SchoolName+Number")
    const schoolName = cls.name.replace(/[0-9]+$/, '').trim();
    
    if (!acc[schoolName]) {
      acc[schoolName] = [];
    }
    
    acc[schoolName].push(cls);
    return acc;
  }, {});

  // Sort school names alphabetically
  const sortedSchoolNames = Object.keys(groupedClasses).sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-primary" />
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          반 선택
        </label>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
        {sortedSchoolNames.map((schoolName) => {
          const logoUrl = schoolLogos[schoolName];
          
          return (
            <div 
              key={schoolName} 
              className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-200"
            >
              {/* School Header with Logo */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                {logoUrl ? (
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-white shadow-sm border border-slate-100 flex-shrink-0">
                    <img 
                      src={logoUrl} 
                      alt={`${schoolName} 로고`}
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {schoolName.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                  {schoolName}
                </h3>
              </div>
              
              {/* Class Buttons */}
              <div className="space-y-1">
                {groupedClasses[schoolName].map((cls) => {
                  const isSelected = selectedClass === cls.id;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => onClassSelect(cls.id)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                        isSelected
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate">{cls.name}</span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0",
                          isSelected 
                            ? "bg-white/20 text-white" 
                            : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                        )}>
                          {cls.teacher}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
