import { useState, useEffect } from 'react';
import { Keyboard, ChevronLeft, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const shortcuts = [
  { keys: 'Ctrl+1', description: 'S', color: 'bg-yellow-400' },
  { keys: 'Ctrl+2', description: 'V', color: 'bg-amber-300' },
  { keys: 'Ctrl+3', description: 'O', color: 'bg-orange-300' },
  { keys: 'Ctrl+4', description: 'C', color: 'bg-lime-200' },
  { keys: 'Shift+1', description: '___', color: 'bg-blue-400' },
  { keys: 'Alt+1', description: '[ ]', color: 'bg-emerald-400' },
  { keys: 'Alt+2', description: '( )', color: 'bg-gray-400' },
  { keys: 'Alt+3', description: '△', color: 'bg-red-400' },
  { keys: 'Alt+4', description: '덧말', color: 'bg-purple-500' },
  { keys: '~', description: '정답', color: 'bg-pink-500' },
  { keys: 'Ctrl+Z', description: '↩', color: 'bg-slate-400' },
];

interface ChapterInfo {
  chapterNumber: number;
  label: string;
  page: number;
}

interface ShortcutsPanelProps {
  chapters?: ChapterInfo[];
  onChapterSelect?: (page: number) => void;
}

export function ShortcutsPanel({ chapters, onChapterSelect }: ShortcutsPanelProps) {
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  // Detect device type
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      // Mobile: < 768, Tablet: 768-1024, PC: > 1024
      setIsMobileOrTablet(width < 768 || width >= 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Hide panel on mobile and PC (only show on tablet 768-1024)
  // Also hide for non-admins on all non-tablet devices
  if (isMobileOrTablet) {
    return null;
  }

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[300] no-print pointer-events-auto">
      {/* Panel */}
      <div
        className={`relative bg-white/95 backdrop-blur-sm border border-slate-200 rounded-r-lg shadow-lg transition-all duration-300 overflow-visible ${
          isOpen ? 'w-28 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        <div className="p-2 w-28">
          {/* Header */}
          <div className="flex items-center gap-1 mb-1.5 pb-1 border-b border-slate-100">
            <Keyboard className="w-3 h-3 text-amber-500" />
            <span className="font-semibold text-slate-700 text-[10px]">단축키</span>
          </div>

          {/* Shortcuts List */}
          <div className="space-y-0.5">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center gap-1"
              >
                <div className={`${shortcut.color} text-white text-[8px] font-mono font-medium px-1 py-0.5 rounded min-w-[36px] text-center`}>
                  {shortcut.keys}
                </div>
                <span className="text-[9px] text-slate-600">{shortcut.description}</span>
              </div>
            ))}
          </div>

          {/* Chapter Dropdown */}
          {chapters && chapters.length > 0 && onChapterSelect && (
            <div className="mt-3 pt-2 border-t border-slate-100 relative">
              <button
                onClick={() => setIsChapterDropdownOpen(!isChapterDropdownOpen)}
                className="w-full flex items-center justify-between gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-2 py-1.5 rounded transition-colors"
              >
                <span>챕터 이동</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isChapterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isChapterDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-[400]">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.chapterNumber}
                      onClick={() => {
                        onChapterSelect(chapter.page);
                        setIsChapterDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-b-0"
                    >
                      <span className="font-medium text-blue-600">Ch.{chapter.chapterNumber}</span>
                      <span className="text-slate-500 ml-1.5">{chapter.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ${
          isOpen ? 'left-28' : 'left-0'
        } bg-amber-500 hover:bg-amber-600 text-white p-1 rounded-r-md shadow-md`}
        title={isOpen ? '닫기' : '단축키'}
      >
        {isOpen ? (
          <ChevronLeft className="w-3 h-3" />
        ) : (
          <Keyboard className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}
