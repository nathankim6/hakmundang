
import React, { useEffect, useRef, useState } from "react";

interface AutoResizeTextProps {
  text: string;
  maxFontSize?: number;
  minFontSize?: number;
  containerClassName?: string;
  textClassName?: string;
  style?: React.CSSProperties;
}

// 이 컴포넌트는 텍스트가 한 줄로 영역을 넘기지 않는 폰트 크기를 찾아서 적용합니다
const AutoResizeText: React.FC<AutoResizeTextProps> = ({
  text,
  maxFontSize = 18,
  minFontSize = 10,
  containerClassName = "",
  textClassName = "",
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    let currentFontSize = maxFontSize;

    // 너비에 맞춰 폰트 크기 줄이기
    while (
      currentFontSize > minFontSize &&
      textRef.current.scrollWidth > containerWidth
    ) {
      currentFontSize -= 1;
      textRef.current.style.fontSize = `${currentFontSize}px`;
    }
    setFontSize(currentFontSize);
  }, [text, maxFontSize, minFontSize]);

  return (
    <div
      ref={containerRef}
      className={`w-full min-w-0 ${containerClassName}`}
      style={style}
    >
      <span
        ref={textRef}
        className={`block truncate font-noto ${textClassName}`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: "1.2",
          transition: "font-size 0.2s",
        }}
        title={text}
      >
        {text}
      </span>
    </div>
  );
};

export default AutoResizeText;
