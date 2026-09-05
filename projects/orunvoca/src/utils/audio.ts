import { initializeAudioContext } from '@/utils/sound-effects';

export const isIOS = (() => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform = (navigator as any).platform || '';
  const iOSPlatforms = /(iPhone|iPad|iPod)/i.test(ua);
  const iPadOS13Up = /Mac/i.test(platform) && 'ontouchend' in document;
  return iOSPlatforms || iPadOS13Up;
})();

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function playBase64AudioWebAudio(base64: string) {
  const ctx = initializeAudioContext();
  if (!ctx) return;
  // Ensure context is resumed (iOS requires this to be in a user gesture)
  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch {}
  }

  const buffer = base64ToArrayBuffer(base64);
  const audioBuffer: AudioBuffer = await new Promise((resolve, reject) => {
    // Safari sometimes uses callback form
    // @ts-ignore
    if (ctx.decodeAudioData.length === 1) {
      // Promise form
      // @ts-ignore
      ctx.decodeAudioData(buffer).then(resolve).catch(reject);
    } else {
      // Callback form
      // @ts-ignore
      ctx.decodeAudioData(buffer, resolve, reject);
    }
  });

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start(0);
}
