
import React from "react";

interface NormalDistributionProps {
  score: number;
}

const NormalDistribution: React.FC<NormalDistributionProps> = ({ score }) => {
  // IQ distribution properties
  const MEAN_IQ = 100;
  const SD_IQ = 15;

  // Calculate z-score
  const zScore = (score - MEAN_IQ) / SD_IQ;
  
  // Calculate position along the curve (0-100%)
  const position = Math.min(Math.max((zScore * 15) + 50, 0), 100);
  
  // Generate the normal distribution SVG path
  const generateNormalCurvePath = () => {
    const points = [];
    const width = 100;
    const height = 70;
    const sigma = width / 6; // Standard deviation controls width of bell curve
    const mu = width / 2;    // Mean (center of bell curve)
    
    const normalPdf = (x: number) => {
      return Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * Math.PI));
    };
    
    const maxY = normalPdf(mu);
    
    for (let x = 0; x <= width; x += 1) {
      const y = normalPdf(x) / maxY * height;
      points.push([x, height - y]);
    }
    
    return `M0,${height} ` + points.map(p => `L${p[0]},${p[1]}`).join(' ');
  };
  
  return (
    <div className="distribution-graph mt-4 mb-12 border border-blue-100 rounded-lg p-4 bg-gradient-to-br from-white to-blue-50">
      <div className="text-center mb-2 font-semibold text-gray-700">정규분포 곡선에서 내 위치</div>
      <svg className="distribution-curve" viewBox="0 0 100 70" preserveAspectRatio="none">
        <path 
          d={generateNormalCurvePath()} 
          fill="url(#gradient)" 
          stroke="#6E59A5" 
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9b87f5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9b87f5" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="distribution-line"></div>
      
      {/* Standard deviation markers with improved spacing */}
      <div className="flex justify-between px-1 pt-1 mt-20 relative">
        <div className="flex flex-col items-center">
          <div className="marker h-4 absolute -top-4 left-[5%]"></div>
          <span className="text-xs text-gray-600 font-medium">55</span>
          <span className="text-xs text-gray-500 mt-2">-3σ</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="marker h-4 absolute -top-4 left-[20%]"></div>
          <span className="text-xs text-gray-600 font-medium">70</span>
          <span className="text-xs text-gray-500 mt-2">-2σ</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="marker h-4 absolute -top-4 left-[35%]"></div>
          <span className="text-xs text-gray-600 font-medium">85</span>
          <span className="text-xs text-gray-500 mt-2">-1σ</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="marker h-4 absolute -top-4 left-[50%]"></div>
          <span className="text-xs text-gray-600 font-medium">100</span>
          <span className="text-xs text-gray-500 mt-2">Mean</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="marker h-4 absolute -top-4 left-[65%]"></div>
          <span className="text-xs text-gray-600 font-medium">115</span>
          <span className="text-xs text-gray-500 mt-2">+1σ</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="marker h-4 absolute -top-4 left-[80%]"></div>
          <span className="text-xs text-gray-600 font-medium">130</span>
          <span className="text-xs text-gray-500 mt-2">+2σ</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="marker h-4 absolute -top-4 left-[95%]"></div>
          <span className="text-xs text-gray-600 font-medium">145</span>
          <span className="text-xs text-gray-500 mt-2">+3σ</span>
        </div>
      </div>
      
      {/* User's score marker */}
      {score && (
        <>
          <div 
            className="score-marker" 
            style={{ 
              left: `${position}%`,
              height: "30px",
              top: "40px"
            }}
          ></div>
          <div 
            className="score-label" 
            style={{ 
              left: `${position}%`,
              top: "16px"
            }}
          >
            {score}
          </div>
        </>
      )}
    </div>
  );
};

export default NormalDistribution;
