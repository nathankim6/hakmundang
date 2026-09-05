import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TimeRange {
  start: number;
  end: number;
}

interface TimeRangeSliderProps {
  day: string;
  selectedRanges: TimeRange[];
  onChange: (ranges: TimeRange[]) => void;
  minHour?: number;
  maxHour?: number;
}

export const TimeRangeSlider = ({ day, selectedRanges, onChange, minHour = 9, maxHour = 22 }: TimeRangeSliderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentRange, setCurrentRange] = useState<TimeRange | null>(null);
  const [startHour, setStartHour] = useState<number | null>(null);

  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => i + minHour);

  const formatHour = (hour: number) => {
    const period = hour < 12 ? '오전' : '오후';
    let displayHour = hour;
    if (hour > 12) {
      displayHour = hour - 12;
    }
    return `${period}\n${displayHour}`;
  };

  const handleMouseDown = (hour: number) => {
    // Check if clicking on already selected hour for toggle functionality
    const clickedRangeIndex = selectedRanges.findIndex(range => 
      hour >= range.start && hour <= range.end
    );
    
    if (clickedRangeIndex !== -1) {
      // Remove the range if clicking on already selected area
      onChange(selectedRanges.filter((_, i) => i !== clickedRangeIndex));
      return;
    }
    
    // Start dragging - range will be added on mouse up
    setIsDragging(true);
    setStartHour(hour);
    setCurrentRange({ start: hour, end: hour });
  };

  const handleTouchStart = (hour: number, e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseDown(hour);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const hourAttr = element?.getAttribute('data-hour');
    
    if (hourAttr) {
      const hour = parseInt(hourAttr);
      handleMouseEnter(hour);
    }
  };

  const handleMouseEnter = (hour: number) => {
    if (isDragging && startHour !== null) {
      setCurrentRange({
        start: Math.min(startHour, hour),
        end: Math.max(startHour, hour)
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && currentRange) {
      // Always add the range when mouse is released
      onChange([...selectedRanges, currentRange]);
    }
    setIsDragging(false);
    setCurrentRange(null);
    setStartHour(null);
  };

  const removeRange = (index: number) => {
    onChange(selectedRanges.filter((_, i) => i !== index));
  };

  const isHourInRange = (hour: number, range: TimeRange) => {
    return hour >= range.start && hour <= range.end;
  };

  const isHourInCurrentRange = (hour: number) => {
    return currentRange && isHourInRange(hour, currentRange);
  };

  const isHourInSelectedRange = (hour: number) => {
    return selectedRanges.some(range => isHourInRange(hour, range));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-display font-bold text-foreground tracking-wide">{day}</Label>
        {selectedRanges.length > 0 && (
          <span className="text-xs text-muted-foreground font-body font-medium">
            {selectedRanges.length}개 시간대 선택됨
          </span>
        )}
      </div>

      <div 
        className="relative bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-4 md:p-5 select-none border border-border/30 shadow-sm"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        <div className="space-y-2">
          {/* First row - 7 items */}
          <div className="flex gap-1 justify-center">
            {hours.slice(0, 7).map((hour) => {
              const isInCurrent = isHourInCurrentRange(hour);
              const isInSelected = isHourInSelectedRange(hour);
              
              return (
                <div
                  key={hour}
                  data-hour={hour}
                  className={`w-16 h-16 md:w-14 md:h-14 rounded-lg cursor-pointer transition-all duration-300 border-2 flex flex-col items-center justify-center touch-manipulation shadow-sm hover:shadow-md ${
                    isInCurrent
                      ? "bg-gradient-to-br from-accent to-accent/80 border-accent text-accent-foreground scale-105 shadow-glow"
                      : isInSelected
                      ? "bg-gradient-to-br from-primary to-primary-light border-primary text-primary-foreground shadow-primary"
                      : "bg-background/90 border-border/50 hover:border-primary/50 text-foreground hover:scale-105"
                  }`}
                  onMouseDown={() => handleMouseDown(hour)}
                  onMouseEnter={() => handleMouseEnter(hour)}
                  onTouchStart={(e) => handleTouchStart(hour, e)}
                >
                  <span className="text-xs md:text-[10px] font-body font-bold leading-tight text-center whitespace-pre-line">
                    {formatHour(hour)}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Second row - 7 items */}
          <div className="flex gap-1 justify-center">
            {hours.slice(7, 14).map((hour) => {
              const isInCurrent = isHourInCurrentRange(hour);
              const isInSelected = isHourInSelectedRange(hour);
              
              return (
                <div
                  key={hour}
                  data-hour={hour}
                  className={`w-16 h-16 md:w-14 md:h-14 rounded-lg cursor-pointer transition-all duration-300 border-2 flex flex-col items-center justify-center touch-manipulation shadow-sm hover:shadow-md ${
                    isInCurrent
                      ? "bg-gradient-to-br from-accent to-accent/80 border-accent text-accent-foreground scale-105 shadow-glow"
                      : isInSelected
                      ? "bg-gradient-to-br from-primary to-primary-light border-primary text-primary-foreground shadow-primary"
                      : "bg-background/90 border-border/50 hover:border-primary/50 text-foreground hover:scale-105"
                  }`}
                  onMouseDown={() => handleMouseDown(hour)}
                  onMouseEnter={() => handleMouseEnter(hour)}
                  onTouchStart={(e) => handleTouchStart(hour, e)}
                >
                  <span className="text-xs md:text-[10px] font-body font-bold leading-tight text-center whitespace-pre-line">
                    {formatHour(hour)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedRanges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRanges.map((range, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-4 py-2 rounded-full text-sm md:text-xs font-body font-semibold border border-primary/20 shadow-sm"
            >
              <span>
                {formatHour(range.start).replace('\n', ' ')}시 - {formatHour(range.end + 1).replace('\n', ' ')}시
              </span>
              <button
                type="button"
                onClick={() => removeRange(index)}
                className="hover:bg-primary/20 rounded-full p-1 transition-colors touch-manipulation"
              >
                <X className="w-4 h-4 md:w-3 md:h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground font-body">
        💡 터치하거나 드래그하여 시간대를 선택하세요
      </p>
    </div>
  );
};
