let audioContext: AudioContext | null = null;

// 오디오 컨텍스트 초기화 (사용자 상호작용 후에 호출)
export const initializeAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // iOS Safari에서 오디오 컨텍스트 활성화
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
};

// 정답 효과음 재생
export const playCorrectSound = () => {
  const context = initializeAudioContext();
  if (!context) return;

  try {
    // 성공 소리 - 상승하는 화음
    const oscillator1 = context.createOscillator();
    const oscillator2 = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(context.destination);
    
    // 첫 번째 음 (C5)
    oscillator1.frequency.setValueAtTime(523.25, context.currentTime);
    oscillator1.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
    oscillator1.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
    
    // 두 번째 음 (화음)
    oscillator2.frequency.setValueAtTime(659.25, context.currentTime);
    oscillator2.frequency.setValueAtTime(783.99, context.currentTime + 0.1);
    oscillator2.frequency.setValueAtTime(1046.5, context.currentTime + 0.2); // C6
    
    // 볼륨 조절
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
    
    oscillator1.start(context.currentTime);
    oscillator2.start(context.currentTime);
    oscillator1.stop(context.currentTime + 0.4);
    oscillator2.stop(context.currentTime + 0.4);
  } catch (error) {
    console.log('오디오 재생 중 오류:', error);
  }
};

// 오답 효과음 재생
export const playIncorrectSound = () => {
  const context = initializeAudioContext();
  if (!context) return;

  try {
    // 실패 소리 - 하강하는 음
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // 주파수 하강 (A4 -> F4 -> D4)
    oscillator.frequency.setValueAtTime(440, context.currentTime);
    oscillator.frequency.setValueAtTime(349.23, context.currentTime + 0.15);
    oscillator.frequency.setValueAtTime(293.66, context.currentTime + 0.3);
    
    // 볼륨 조절
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    
    oscillator.type = 'triangle'; // 부드러운 소리
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  } catch (error) {
    console.log('오디오 재생 중 오류:', error);
  }
};

// 힌트 효과음 재생
export const playHintSound = () => {
  const context = initializeAudioContext();
  if (!context) return;

  try {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // 짧은 벨 소리
    oscillator.frequency.setValueAtTime(800, context.currentTime);
    oscillator.frequency.setValueAtTime(1000, context.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.05, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    
    oscillator.type = 'sine';
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  } catch (error) {
    console.log('오디오 재생 중 오류:', error);
  }
};

// 버튼 클릭 효과음
export const playClickSound = () => {
  const context = initializeAudioContext();
  if (!context) return;

  try {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.setValueAtTime(600, context.currentTime);
    gainNode.gain.setValueAtTime(0.03, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    
    oscillator.type = 'square';
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  } catch (error) {
    console.log('오디오 재생 중 오류:', error);
  }
};