import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import orunWatermark from "@/assets/orun-watermark-logo.png";

interface StudyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped?: boolean;
  onFlip?: () => void;
  difficulty?: "easy" | "medium" | "hard";
}

const StudyCard = React.forwardRef<HTMLDivElement, StudyCardProps>(({
  className,
  front,
  back,
  isFlipped = false,
  onFlip,
  difficulty,
  ...props
}, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    if (isFlipped) setIsHovered(false);
  }, [isFlipped]);

  const canHover = !isFlipped && isHovered;

  return (
    <>
      {/* Mobile & Tablet: compact warm-sand card */}
      <div
        ref={ref}
        className={cn(
          "lg:hidden group relative w-full cursor-pointer touch-manipulation overflow-hidden",
          "py-2 px-2 min-h-[52px] rounded-xl",
          "flex items-center justify-center transition-all duration-300",
          isFlipped ? "warm-sand-card-ink" : "warm-sand-card",
          className
        )}
        style={{
          transform: canHover ? "translateY(-1px)" : "translateY(0)",
        }}
        onClick={onFlip}
        {...props}
      >
        {!isFlipped ? (
          <div className="relative z-10 text-center w-full">{front}</div>
        ) : (
          <div className="relative z-10 text-center w-full">
            <img
              src={orunWatermark}
              alt=""
              className="absolute inset-0 m-auto w-14 h-14 object-contain opacity-[0.12] pointer-events-none"
              style={{ mixBlendMode: "normal" }}
            />
            {back}
          </div>
        )}
      </div>

      {/* Desktop: 3D flip card with warm-sand / ink sides */}
      <div
        className={cn("hidden lg:block relative w-full cursor-pointer touch-manipulation", className)}
        style={{
          perspective: "1200px",
          transform: canHover ? "translateY(-3px)" : "translateY(0)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)"
        }}
        onClick={onFlip}
        onMouseEnter={() => !isFlipped && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <div
          className="card-flip w-full relative"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          {/* Front — warm sand paper */}
          <Card
            className={cn(
              "card-front w-full flex flex-col items-start justify-start py-4 px-3",
              "warm-sand-card transition-all duration-200",
              canHover ? "shadow-[0_22px_48px_-28px_rgba(139,115,85,0.35)]" : "",
              isFlipped ? "invisible" : "visible"
            )}
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            <div className="relative z-20 w-full h-full flex flex-col">
              {front}

              {difficulty && (
                <div className="absolute top-0 right-0 px-1.5 py-0.5 rounded-md text-[9px] font-medium uppercase tracking-[0.14em] border border-[#d8d0c2] bg-[#f5f0e8] text-[#6b5f4e] font-mono">
                  {difficulty}
                </div>
              )}
            </div>
          </Card>

          {/* Back — warm ink */}
          <Card
            className={cn(
              "card-back absolute inset-0 w-full h-full flex flex-col items-center justify-center py-4 px-3",
              "warm-sand-card-ink",
              "shadow-[0_22px_52px_-28px_rgba(15,23,42,0.55)]"
            )}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <img
              src={orunWatermark}
              alt=""
              className="absolute top-3 left-1/2 -translate-x-1/2 w-11 h-11 object-contain opacity-[0.14] pointer-events-none"
              style={{ mixBlendMode: "normal" }}
            />

            <div className="relative z-20 w-full h-full flex flex-col justify-center items-center">
              {back}
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden xl:block">
              <span className="text-[9px] tracking-[0.16em] uppercase font-mono text-[#9a8f7c] inline-flex items-center gap-1">
                <RotateCcw className="w-2.5 h-2.5" />
                Flip
              </span>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
});

StudyCard.displayName = "StudyCard";
export { StudyCard };
