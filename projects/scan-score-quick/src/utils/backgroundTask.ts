// 비-React 컨텍스트에서 사용 가능한 백그라운드 다운로드 보조 유틸

let wakeLockHandle: any = null;

export async function acquireWakeLock() {
  try {
    // @ts-ignore
    if (navigator.wakeLock?.request) {
      // @ts-ignore
      wakeLockHandle = await navigator.wakeLock.request('screen');
    }
  } catch (e) {
    console.warn('WakeLock unavailable', e);
  }
}

export async function releaseWakeLock() {
  try {
    await wakeLockHandle?.release?.();
  } catch {}
  wakeLockHandle = null;
}

/**
 * 무음 오디오 keep-alive — 페이지가 "오디오 재생 중" 상태면
 * 브라우저(Chrome/Edge/Safari)가 백그라운드 throttling을 적용하지 않습니다.
 * PiP보다 더 안정적이며, 다른 창이 완전히 가려도(occlusion) 유지됩니다.
 */
let silentAudioCtx: AudioContext | null = null;
let silentAudioGain: GainNode | null = null;
let silentAudioOsc: OscillatorNode | null = null;
let silentAudioVisibilityHandler: (() => void) | null = null;

/**
 * 동기적으로 AudioContext를 생성/시작합니다.
 * user gesture가 만료되기 전에 호출해야 하므로 click 핸들러 진입 즉시
 * (다른 await 이전에) 호출하세요. resume()은 비동기지만 await하지 않고
 * 백그라운드에서 처리합니다 — 호출 시점에 gesture가 살아있으면 충분합니다.
 */
export function enableSilentAudioKeepAlive(): boolean {
  try {
    if (silentAudioCtx) {
      // 이미 있으면 재개만 시도
      if (silentAudioCtx.state === 'suspended') {
        silentAudioCtx.resume().catch(() => {});
      }
      return true;
    }
    // @ts-ignore
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return false;
    const ctx: AudioContext = new Ctor();
    // gesture가 살아있는 동안 동기적으로 resume 시작 (await 하지 않음)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    osc.frequency.value = 1;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    silentAudioCtx = ctx;
    silentAudioGain = gain;
    silentAudioOsc = osc;

    // 탭이 백그라운드 → 포그라운드 전환 시 일부 브라우저가 ctx를 suspend함.
    // 다시 보이게 되면 자동 재개.
    silentAudioVisibilityHandler = () => {
      if (silentAudioCtx && silentAudioCtx.state === 'suspended') {
        silentAudioCtx.resume().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', silentAudioVisibilityHandler);
    return true;
  } catch (e) {
    console.warn('Silent audio keep-alive 실패', e);
    return false;
  }
}

export async function disableSilentAudioKeepAlive() {
  try {
    silentAudioOsc?.stop();
    silentAudioOsc?.disconnect();
    silentAudioGain?.disconnect();
    await silentAudioCtx?.close();
  } catch {}
  if (silentAudioVisibilityHandler) {
    document.removeEventListener('visibilitychange', silentAudioVisibilityHandler);
    silentAudioVisibilityHandler = null;
  }
  silentAudioCtx = null;
  silentAudioGain = null;
  silentAudioOsc = null;
}

export function ensureNotificationPermission() {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  } catch {}
}

export function showBrowserNotification(title: string, body: string) {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const fire = () => {
      const n = new Notification(title, { body, icon: '/favicon.ico' });
      n.onclick = () => { window.focus(); n.close(); };
    };
    if (Notification.permission === 'granted') {
      fire();
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((p) => { if (p === 'granted') fire(); }).catch(() => {});
    }
  } catch (e) {
    console.warn('notify failed', e);
  }
}

/**
 * 진행률 오버레이 전역 이벤트 — 어디서든 호출 가능
 */
export type DownloadProgressEvent = {
  visible: boolean;
  current: number;
  total: number;
  title?: string;
  subtitle?: string;
  done?: boolean;
  onAbort?: () => void;
};

export const DOWNLOAD_PROGRESS_EVENT = 'app:download-progress';

export function emitDownloadProgress(detail: DownloadProgressEvent) {
  window.dispatchEvent(new CustomEvent(DOWNLOAD_PROGRESS_EVENT, { detail }));
}

/**
 * Picture-in-Picture 트릭으로 백그라운드 throttling 회피
 * - 작은 canvas를 video로 스트리밍해서 PiP로 띄움
 * - PiP가 활성화되면 브라우저가 탭을 "보이는" 상태로 간주하여
 *   다른 창에서 작업해도 setTimeout/rAF/layout이 throttle되지 않음
 */
let pipVideo: HTMLVideoElement | null = null;
let pipCanvas: HTMLCanvasElement | null = null;
let pipStream: MediaStream | null = null;
let pipRafId: number | null = null;

export async function enablePiPKeepAlive(label = '다운로드 진행 중') {
  try {
    if (pipVideo && document.pictureInPictureElement === pipVideo) return true;
    // PiP API 미지원
    // @ts-ignore
    if (!document.pictureInPictureEnabled) return false;

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d')!;

    let frame = 0;
    const draw = () => {
      // 그라디언트 배경
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0, '#0f172a');
      g.addColorStop(1, '#1e293b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 펄스 점
      const r = 6 + Math.sin(frame / 15) * 2;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(24, 24, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 16px -apple-system, system-ui, sans-serif';
      ctx.fillText('ORUN', 44, 30);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 14px -apple-system, system-ui, sans-serif';
      ctx.fillText(label, 16, 90);

      ctx.fillStyle = '#64748b';
      ctx.font = '400 11px -apple-system, system-ui, sans-serif';
      ctx.fillText('이 창은 닫지 마세요', 16, 115);
      ctx.fillText('백그라운드 처리 유지용', 16, 132);

      // 진행 바 애니메이션
      const barW = canvas.width - 32;
      ctx.fillStyle = '#334155';
      ctx.fillRect(16, 150, barW, 6);
      ctx.fillStyle = '#22c55e';
      const w = ((frame % 120) / 120) * barW;
      ctx.fillRect(16, 150, w, 6);

      frame++;
      pipRafId = requestAnimationFrame(draw);
    };
    draw();

    // @ts-ignore
    const stream: MediaStream = canvas.captureStream(15);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    video.style.position = 'fixed';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    document.body.appendChild(video);
    await video.play().catch(() => {});

    // @ts-ignore
    await video.requestPictureInPicture();

    pipCanvas = canvas;
    pipStream = stream;
    pipVideo = video;

    video.addEventListener('leavepictureinpicture', () => {
      // 사용자가 PiP를 닫으면 정리만 함
      cleanupPiP();
    });

    return true;
  } catch (e) {
    console.warn('PiP keep-alive 활성화 실패', e);
    cleanupPiP();
    return false;
  }
}

function cleanupPiP() {
  try {
    if (pipRafId != null) cancelAnimationFrame(pipRafId);
    pipRafId = null;
    pipStream?.getTracks().forEach((t) => t.stop());
    pipStream = null;
    if (pipVideo) {
      try { pipVideo.pause(); } catch {}
      pipVideo.srcObject = null;
      pipVideo.remove();
    }
    pipVideo = null;
    pipCanvas = null;
  } catch {}
}

export async function disablePiPKeepAlive() {
  try {
    // @ts-ignore
    if (document.pictureInPictureElement) {
      // @ts-ignore
      await document.exitPictureInPicture().catch(() => {});
    }
  } catch {}
  cleanupPiP();
}