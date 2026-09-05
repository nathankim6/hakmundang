import { VOLUMES, VolumeInfo } from '@/types/volume';
import { useAuth } from '@/contexts/AuthContext';
import { Lock } from 'lucide-react';

interface VolumeSelectorProps {
  currentVolume: number;
  onVolumeChange: (volumeId: number) => void;
}

// Map volume IDs to their access code identifiers
const VOLUME_ACCESS_MAP: Record<number, string> = {
  1: 'syntax10000-vol1',
  2: 'syntax10000-vol2',
  3: 'syntax10000-vol3',
};

export function VolumeSelector({ currentVolume, onVolumeChange }: VolumeSelectorProps) {
  const { canAccessWorkbook } = useAuth();

  return (
    <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
      {VOLUMES.map((volume) => {
        const accessId = VOLUME_ACCESS_MAP[volume.id];
        const hasAccess = canAccessWorkbook(accessId);
        
        return (
          <button
            key={volume.id}
            onClick={() => hasAccess && onVolumeChange(volume.id)}
            disabled={!hasAccess}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
              !hasAccess
                ? 'text-muted-foreground/50 cursor-not-allowed opacity-60'
                : currentVolume === volume.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {!hasAccess && <Lock className="h-3 w-3" />}
            <span className="hidden sm:inline">{volume.name}</span>
            <span className="sm:hidden">V{volume.id}</span>
            <span className="ml-1 text-[10px] opacity-70">
              ({volume.startQuestion.toLocaleString()}-{volume.endQuestion.toLocaleString()})
            </span>
          </button>
        );
      })}
    </div>
  );
}
