export function AccessCodeHeader() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <img 
        src="/lovable-uploads/ba25df4b-a62d-4a3d-97c3-7d969e304813.png" 
        alt="ORUN ACADEMY Logo" 
        className="w-24 h-24 object-contain"
      />
      <h1 className="text-3xl font-light animate-title bg-gradient-to-r from-[#403E43] via-[#555555] to-[#403E43] bg-clip-text text-transparent relative group transition-all duration-300">
        <span className="inline-block transform hover:scale-105 transition-transform duration-300 relative">
          ORUN AI QUIZ MAKER
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
        </span>
      </h1>
    </div>
  );
}