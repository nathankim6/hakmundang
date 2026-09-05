import { useState, useEffect, useRef } from 'react';

interface CorrectionInputProps {
  position: { x: number; y: number };
  onSubmit: (correction: string) => void;
  onClose: () => void;
}

export function CorrectionInput({ position, onSubmit, onClose }: CorrectionInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="correction-input-overlay">
      <div className="correction-input-backdrop" onClick={onClose} />
      <div 
        className="correction-input-container"
        style={{
          left: Math.max(100, Math.min(position.x - 90, window.innerWidth - 200)),
          top: Math.max(10, position.y - 100)
        }}
      >
        <form onSubmit={handleSubmit}>
          <label className="correction-input-label">덧말 입력</label>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="correction-input-field"
            placeholder="덧말을 입력하세요"
          />
          <div className="correction-input-buttons">
            <button type="submit" className="correction-input-submit">
              확인
            </button>
            <button type="button" onClick={onClose} className="correction-input-cancel">
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
