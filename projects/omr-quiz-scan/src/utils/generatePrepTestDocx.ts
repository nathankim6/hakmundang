import { saveAs } from 'file-saver';
import beatAsset from '@/assets/beat-prep-docx.asset.json';

export const n = async () => {
  const res = await fetch(beatAsset.url);
  const blob = await res.blob();
  saveAs(blob, '브래니악_BEAT_초등부.docx');
};

export const generatePrepTestDocx = n;
