/**
 * 오디오 Blob을 WAV 포맷으로 변환합니다.
 * WAV는 모든 브라우저에서 재생 가능한 범용 포맷입니다.
 */
export async function convertToWav(audioBlob: Blob): Promise<Blob> {
  // 원본이 이미 WAV인 경우 그대로 반환
  if (audioBlob.type === "audio/wav" || audioBlob.type === "audio/wave") {
    return audioBlob;
  }

  // 압축 포맷의 경우 WAV로 변환하면 10~20배 커질 수 있음
  // 원본이 5MB 이상이면 변환된 WAV가 50MB를 초과할 가능성이 높으므로 스킵
  if (audioBlob.size > 5 * 1024 * 1024) {
    console.warn(`[WAV Convert] Skipping conversion: source ${(audioBlob.size / 1024 / 1024).toFixed(1)}MB, estimated WAV would exceed 50MB`);
    throw new Error("Source too large for WAV conversion");
  }

  const audioContext = new AudioContext();
  
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // 변환 전 예상 WAV 크기 계산 (헤더 44 + samples * channels * 2bytes)
    const estimatedWavSize = 44 + audioBuffer.length * audioBuffer.numberOfChannels * 2;
    if (estimatedWavSize > 50 * 1024 * 1024) {
      console.warn(`[WAV Convert] Estimated WAV size ${(estimatedWavSize / 1024 / 1024).toFixed(1)}MB exceeds 50MB, skipping`);
      throw new Error("Estimated WAV size exceeds limit");
    }

    // AudioBuffer → WAV Blob
    const wavBuffer = audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: "audio/wav" });
  } finally {
    await audioContext.close();
  }
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  // Interleave channels
  let interleaved: Float32Array;
  if (numChannels === 1) {
    interleaved = buffer.getChannelData(0);
  } else {
    const length = buffer.length * numChannels;
    interleaved = new Float32Array(length);
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        interleaved[i * numChannels + ch] = buffer.getChannelData(ch)[i];
      }
    }
  }
  
  const dataLength = interleaved.length * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;
  
  const wavBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(wavBuffer);
  
  // WAV Header
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, "WAVE");
  
  // fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // sub-chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // byte rate
  view.setUint16(32, numChannels * (bitDepth / 8), true); // block align
  view.setUint16(34, bitDepth, true);
  
  // data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);
  
  // Write PCM samples (float32 → int16)
  const offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]));
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset + i * 2, int16, true);
  }
  
  return wavBuffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
