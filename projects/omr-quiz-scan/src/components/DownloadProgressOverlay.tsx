import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  visible: boolean;
  current: number;
  total: number;
  title?: string;
  subtitle?: string;
  onAbort?: () => void;
  done?: boolean;
}

const DownloadProgressOverlay: React.FC<Props> = ({
  visible, current, total, title = '리포트 일괄 다운로드', subtitle, onAbort, done,
}) => {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed top-6 right-6 z-[100] w-[360px] rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden backdrop-blur-xl"
          style={{ boxShadow: '0 20px 60px -10px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.04)' }}
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-slate-100">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${done ? 'bg-emerald-50' : 'bg-slate-900'}`}>
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate tracking-tight">
                {done ? '다운로드 완료' : title}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {done ? '파일이 저장되었습니다.' : (subtitle || '백그라운드에서 처리 중입니다')}
              </div>
            </div>
            {!done && onAbort && (
              <Button onClick={onAbort} variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Progress */}
          <div className="px-5 py-4">
            <div className="flex items-end justify-between mb-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{pct}</span>
                <span className="text-xs font-semibold text-slate-400">%</span>
              </div>
              <div className="text-xs text-slate-500 tabular-nums">
                <span className="font-semibold text-slate-700">{current}</span>
                <span className="text-slate-300 mx-1">/</span>
                <span>{total}</span>
              </div>
            </div>

            {/* Track */}
            <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${done ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900'}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
              {!done && (
                <motion.div
                  className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: ['-64px', '360px'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Download className="w-3 h-3" />
              <span>다운로드가 완료될 때까지 이 창을 닫지 마세요</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DownloadProgressOverlay;