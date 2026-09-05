import coverVol1 from '@/assets/orun-weekly-cover-vol1-c.png.asset.json';
import coverVol2 from '@/assets/orun-weekly-cover-vol2-b.png.asset.json';
import coverVol3 from '@/assets/orun-weekly-cover-vol3-b.png.asset.json';
import { VolumeInfo } from '@/types/volume';

interface CoverPageProps {
  totalQuestions: number;
  totalPages: number;
  volume?: VolumeInfo;
  title?: string;
}

export function CoverPage({
  title = "ORUN WEEKLY"
}: CoverPageProps) {
  // 고1 → VOL 1, 고2 → VOL 2, 고3 → VOL 3
  const cover = title.includes('G10')
    ? coverVol1
    : title.includes('G11')
      ? coverVol2
      : coverVol3;

  return (
    <div className="a4-page animate-fade-in" style={{ position: 'relative', padding: 0, overflow: 'hidden' }}>
      <img
        src={cover.url}
        alt="ORUN WEEKLY 표지"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}
