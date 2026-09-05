import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Sparkles, FileText, ArrowRight, Layers, GraduationCap, LogOut, Shield, Settings, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddWorkbookModal from '@/components/AddWorkbookModal';
import { WorkbookCoverThumbnail } from '@/components/WorkbookCoverThumbnail';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/orun-academy-logo-new.jpg';
import orunAcademyBadge from '@/assets/orun-academy-badge.jpg';

// Define workbooks with their access control IDs
const workbooks = [
  {
    id: 'weekly-g10',
    title: 'ORUN WEEKLY',
    subtitle: '고1 구문/어법 주간지',
    description: '고1 내신 및 수능 대비 주간 구문/어법 훈련 (20주×90문장)',
    totalQuestions: 1800,
    category: 'TOP/고1',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    accessId: 'weekly-g10'
  },
  {
    id: 'weekly-g11',
    title: 'ORUN WEEKLY',
    subtitle: '고2 구문/어법 주간지',
    description: '고2 내신 및 수능 대비 주간 구문/어법 훈련 (20주×90문장)',
    totalQuestions: 1800,
    category: '고2',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    accessId: 'weekly-g11'
  },
  {
    id: 'syntax-10000',
    title: 'ORUN WEEKLY',
    subtitle: '고3 구문/어법 주간지',
    description: '고3 내신 및 수능 대비 주간 구문/어법 훈련',
    totalQuestions: 10000,
    category: '고3',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    volumes: [
      { volumeId: 1, accessId: 'syntax10000-vol1', name: 'Vol.1', range: '1~3000' },
      { volumeId: 2, accessId: 'syntax10000-vol2', name: 'Vol.2', range: '3001~6000' },
      { volumeId: 3, accessId: 'syntax10000-vol3', name: 'Vol.3', range: '6001~10000' },
    ]
  }
];

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin, logout, canAccessWorkbook } = useAuth();

  // Check if user can access any volume of Syntax 10000
  const canAccessAnySyntax10000 = () => {
    return canAccessWorkbook('syntax10000-vol1') || 
           canAccessWorkbook('syntax10000-vol2') || 
           canAccessWorkbook('syntax10000-vol3');
  };

  const getWorkbookAccess = (workbook: typeof workbooks[number]) => {
    if (workbook.id === 'syntax-10000') return canAccessAnySyntax10000();
    if ('accessId' in workbook && workbook.accessId) return canAccessWorkbook(workbook.accessId);
    return false;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden relative">
      {/* User Actions - Top Right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-full border border-amber-300 transition-all"
          >
            <Settings className="w-4 h-4" />
            코드 관리
          </Link>
        )}
        {isAdmin && (
          <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-300">
            <Shield className="w-3 h-3" />
            관리자
          </span>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full border border-slate-200 transition-all"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>

      {/* Elegant Light Background with Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='none' stroke='%239a7f4d' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-0 left-0 w-64 h-64 opacity-10" style={{
          background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.15) 0%, transparent 50%)'
        }} />
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{
          background: 'linear-gradient(225deg, rgba(201, 169, 97, 0.15) 0%, transparent 50%)'
        }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10" style={{
          background: 'linear-gradient(45deg, rgba(201, 169, 97, 0.15) 0%, transparent 50%)'
        }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10" style={{
          background: 'linear-gradient(315deg, rgba(201, 169, 97, 0.15) 0%, transparent 50%)'
        }} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-300/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <header className="relative z-10 pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <img src={orunAcademyBadge} alt="ORUN Academy" className="h-16 w-auto mx-auto mb-8 animate-fade-in block" />
          <h1 className="font-orbitron font-bold text-4xl sm:text-6xl md:text-8xl text-amber-500 mx-auto animate-fade-in text-center leading-none tracking-[0.06em] whitespace-nowrap" style={{
            animationDelay: '0.1s'
          }}>
            ORUN WEEKLY
          </h1>
        </div>
      </header>

      {/* Workbooks Section */}
      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-end mb-12">
            <Button className="bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 hover:text-amber-50 gap-2 shadow-lg shadow-slate-200/50" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">문제집 추가</span>
            </Button>
          </div>

          {/* Workbook Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workbooks.map((workbook, index) => {
              const hasAccess = getWorkbookAccess(workbook);

              return (
                <div
                  key={workbook.id}
                  className="group block animate-fade-in"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <article className={`relative h-full overflow-hidden rounded-2xl bg-white border shadow-lg shadow-slate-200/40 transition-all duration-500 backdrop-blur-sm ${
                    hasAccess 
                      ? 'border-slate-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-200/40' 
                      : 'border-slate-200 opacity-70'
                  }`}>
                    {/* Lock overlay for inaccessible workbooks */}
                    {!hasAccess && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                        <div className="text-center">
                          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">접근 권한이 없습니다</p>
                        </div>
                      </div>
                    )}

                    {/* Hover Gradient Overlay */}
                    {hasAccess && (
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                    
                    {/* Card Header with Cover Thumbnail */}
                    <div className="relative">
                      <WorkbookCoverThumbnail variant={workbook.id as 'syntax-10000' | 'syntax-2320' | 'weekly-g10' | 'weekly-g11'} />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-amber-700 text-xs font-semibold border border-amber-300/50 shadow-sm">
                        {workbook.category}
                      </div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    </div>

                    {/* Card Content */}
                    <div className="relative p-6 -mt-8">
                      <h4 className={`text-2xl font-bold mb-1 transition-colors duration-300 ${
                        hasAccess ? 'text-slate-900 group-hover:text-amber-600' : 'text-slate-400'
                      }`}>
                        {workbook.title}
                      </h4>
                      <p className={`text-sm mb-3 font-medium ${hasAccess ? 'text-amber-600' : 'text-slate-400'}`}>
                        {workbook.subtitle}
                      </p>
                      <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                        {workbook.description}
                      </p>

                      {/* Volume Links for Syntax 10000 */}
                      {workbook.volumes && hasAccess && (
                        <div className="space-y-2 mb-4">
                          {workbook.volumes.map((vol) => {
                            const volHasAccess = canAccessWorkbook(vol.accessId);
                            return (
                              <Link
                                key={vol.volumeId}
                                to={volHasAccess ? `/workbook/syntax-10000?volume=${vol.volumeId}` : '#'}
                                onClick={(e) => !volHasAccess && e.preventDefault()}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                  volHasAccess
                                    ? 'bg-white border-slate-200 hover:bg-amber-50 hover:border-amber-300/50'
                                    : 'bg-slate-50/50 border-slate-200 opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {volHasAccess ? (
                                    <BookOpen className="w-4 h-4 text-amber-600" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-slate-400" />
                                  )}
                                  <span className={`font-medium ${volHasAccess ? 'text-slate-700' : 'text-slate-400'}`}>
                                    {vol.name}
                                  </span>
                                  <span className="text-xs text-slate-400">({vol.range})</span>
                                </div>
                                {volHasAccess && (
                                  <ArrowRight className="w-4 h-4 text-amber-600" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* Direct link for weekly workbooks */}
                      {!workbook.volumes && hasAccess && (
                        <Link
                          to={`/workbook/${workbook.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border bg-white border-slate-200 hover:bg-amber-50 hover:border-amber-300/50 transition-all mb-4"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-amber-600" />
                            <span className="font-medium text-slate-700">워크북 열기</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-amber-600" />
                        </Link>
                      )}
                      
                      {/* Stats Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm font-medium">{workbook.totalQuestions.toLocaleString()}문장</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-amber-200/40 py-12 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                <img src={logo} alt="ORUN" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-sm font-medium text-amber-600">ORUN English</div>
                <div className="text-xs text-slate-500">Weekly Grammar Training</div>
              </div>
            </div>
            
            <div className="text-xs text-slate-400">
              © 2026 ORUN Academy
            </div>
          </div>
        </div>
      </footer>

      <AddWorkbookModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
};

export default Home;
