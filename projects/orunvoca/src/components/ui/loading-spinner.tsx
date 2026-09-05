const orunPenguinLogo = "/lovable-uploads/fc4849c2-9734-4795-a825-89c8b12bb716.jpg";

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ 
  message = "로딩 중...", 
  subMessage,
  size = "md",
  className = ""
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: {
      container: "w-12 h-12",
      border: "border-[3px]",
      logo: "w-6 h-6",
      text: "text-sm",
      subText: "text-xs"
    },
    md: {
      container: "w-16 h-16",
      border: "border-4",
      logo: "w-8 h-8",
      text: "text-base",
      subText: "text-sm"
    },
    lg: {
      container: "w-20 h-20",
      border: "border-4",
      logo: "w-10 h-10",
      text: "text-lg",
      subText: "text-base"
    }
  };

  const s = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        {/* Spinning border */}
        <div className={`${s.container} rounded-full ${s.border} border-slate-200 border-t-indigo-500 animate-spin`} />
        {/* Centered logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={orunPenguinLogo} 
            alt="Loading" 
            className={`${s.logo} object-cover rounded-full`} 
          />
        </div>
      </div>
      {message && (
        <div className="text-center">
          <p className={`${s.text} font-medium text-slate-600`}>{message}</p>
          {subMessage && (
            <p className={`${s.subText} text-slate-400 mt-1`}>{subMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function FullPageLoading({ 
  message = "로딩 중...", 
  subMessage,
  size = "lg"
}: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
      <LoadingSpinner message={message} subMessage={subMessage} size={size} />
    </div>
  );
}
