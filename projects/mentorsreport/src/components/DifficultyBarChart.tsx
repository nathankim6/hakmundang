
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

interface DifficultyBarChartProps {
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
    very_hard: number; // Now required instead of optional
  };
  themeColors?: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    light: string;
    vibrant?: string;
    pastel?: string;
    accent2?: string;
    highlight?: string;
  };
}

const DifficultyBarChart: React.FC<DifficultyBarChartProps> = ({ 
  difficulty,
  themeColors = {
    primary: "#2563eb",
    secondary: "#0ea5e9",
    tertiary: "#3b82f6",
    accent: "#60a5fa",
    light: "#93c5fd"
  }
}) => {
  // Normalize difficulty values to ensure they sum up to 100%
  const normalizedDifficulty = (() => {
    const { easy, medium, hard, very_hard } = difficulty;
    const total = easy + medium + hard + very_hard;
    
    // If total is 0, set default equal distribution
    if (total === 0) {
      return {
        easy: 25,
        medium: 25,
        hard: 25,
        very_hard: 25
      };
    }
    
    // Calculate raw percentages without rounding to avoid precision loss
    const easyRaw = (easy / total) * 100;
    const mediumRaw = (medium / total) * 100;
    const hardRaw = (hard / total) * 100;
    const veryHardRaw = (very_hard / total) * 100;
    
    // First do floor on all numbers to ensure we don't exceed 100%
    let easyPerc = Math.floor(easyRaw);
    let mediumPerc = Math.floor(mediumRaw);
    let hardPerc = Math.floor(hardRaw);
    let veryHardPerc = Math.floor(veryHardRaw);
    
    // Calculate the remaining points to distribute
    const pointsToDistribute = 100 - (easyPerc + mediumPerc + hardPerc + veryHardPerc);
    
    // Create an array of entries with their fractional parts
    const fractions = [
      { key: 'easy', value: easyRaw - easyPerc },
      { key: 'medium', value: mediumRaw - mediumPerc },
      { key: 'hard', value: hardRaw - hardPerc },
      { key: 'very_hard', value: veryHardRaw - veryHardPerc }
    ].sort((a, b) => b.value - a.value);
    
    // Distribute the remaining points based on largest fractional parts
    for (let i = 0; i < pointsToDistribute; i++) {
      const item = fractions[i % fractions.length];
      if (item.key === 'easy') easyPerc += 1;
      else if (item.key === 'medium') mediumPerc += 1;
      else if (item.key === 'hard') hardPerc += 1;
      else veryHardPerc += 1;
    }
    
    return {
      easy: easyPerc,
      medium: mediumPerc,
      hard: hardPerc,
      very_hard: veryHardPerc
    };
  })();
  
  // Use enhanced theme colors for more visual variety and better contrast
  const data = [
    {
      name: "쉬움",
      value: normalizedDifficulty.easy,
      color: themeColors.vibrant || themeColors.secondary
    },
    {
      name: "보통",
      value: normalizedDifficulty.medium,
      color: themeColors.accent2 || "#D946EF" // Default to bright magenta if accent2 is not available
    },
    {
      name: "어려움",
      value: normalizedDifficulty.hard,
      color: themeColors.primary
    },
    {
      name: "매우 어려움",
      value: normalizedDifficulty.very_hard,
      color: themeColors.highlight || themeColors.tertiary
    }
  ];

  // Add subtle gradient or pattern to make it more visually appealing
  const getBarBackground = (color: string) => {
    return `linear-gradient(180deg, ${color}, ${color}CC)`;
  };

  // Custom tooltip for better visual appearance
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-2 rounded-md shadow-md border-2" style={{ borderColor: data.color }}>
          <p className="font-medium text-xs" style={{ color: data.color }}>{`${data.name}`}</p>
          <p className="font-bold" style={{ color: data.color }}>{`${data.value}%`}</p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{
            top: 15,
            right: 5,
            left: 0,
            bottom: 5,
          }}
          barSize={24}
          barGap={6}
          className="infographic-chart"
        >
          <defs>
            {data.map((entry, index) => (
              <linearGradient key={`gradient-${index}`} id={`colorBar${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.8} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 9, fontWeight: 600 }}
            tickLine={false}
            axisLine={{ stroke: '#e0e0e0', strokeWidth: 1 }}
          />
          <YAxis 
            unit="%" 
            domain={[0, 100]} 
            tick={{ fontSize: 10 }} 
            width={25}
            axisLine={{ stroke: '#e0e0e0', strokeWidth: 1 }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }} />
          <Bar
            dataKey="value"
            name="비율"
            radius={[6, 6, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-in-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#colorBar${index})`} 
                stroke={entry.color}
                strokeWidth={1}
                style={{filter: `drop-shadow(0px 2px 2px ${entry.color}40)`}}
              />
            ))}
            <LabelList 
              dataKey="value" 
              position="top" 
              formatter={(value: number) => `${value}%`}
              style={{ fontSize: 11, fontWeight: 'bold' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="flex w-full justify-between mt-1">
        {data.map((entry, idx) => (
          <div key={entry.name} className="flex flex-col items-center flex-1">
            <span
              className="text-xs font-semibold mb-0.5"
              style={{ color: entry.color }}>
              {entry.name}
            </span>
            <div 
              className="rounded-full flex justify-center items-center py-1 px-2 shadow-sm"
              style={{
                background: idx === 1 ? `linear-gradient(135deg, ${entry.color}30, white)` : `linear-gradient(135deg, ${entry.color}20, white)`, // Enhanced contrast for medium
                border: idx === 1 ? `2px solid ${entry.color}` : `1.5px solid ${entry.color}90`, // Bolder border for medium
              }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: entry.color }}>
                {entry.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DifficultyBarChart;
