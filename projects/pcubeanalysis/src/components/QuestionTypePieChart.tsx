
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface QuestionTypePieChartProps {
  objectivePercentage: number;
  subjectivePercentage: number;
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

const QuestionTypePieChart: React.FC<QuestionTypePieChartProps> = ({
  objectivePercentage,
  subjectivePercentage,
  themeColors = {
    primary: "#2563eb",
    secondary: "#0ea5e9",
    tertiary: "#3b82f6",
    accent: "#60a5fa",
    light: "#93c5fd"
  }
}) => {
  // Normalize percentages to ensure they sum to 100% and round to whole numbers
  const total = objectivePercentage + subjectivePercentage;
  let objPercentage = Math.round(objectivePercentage / total * 100);
  let subjPercentage = Math.round(subjectivePercentage / total * 100);
  
  // Adjust to ensure they sum to exactly 100%
  if (objPercentage + subjPercentage > 100) {
    // If sum > 100, adjust the larger value
    if (objPercentage > subjPercentage) {
      objPercentage = 100 - subjPercentage;
    } else {
      subjPercentage = 100 - objPercentage;
    }
  } else if (objPercentage + subjPercentage < 100) {
    // If sum < 100, adjust the larger value
    if (objPercentage > subjPercentage) {
      objPercentage += 100 - (objPercentage + subjPercentage);
    } else {
      subjPercentage += 100 - (objPercentage + subjPercentage);
    }
  }
  
  const data = [
    { name: "객관식", value: objPercentage },
    { name: "서답형", value: subjPercentage },
  ];

  // Enhanced color scheme with gradients
  const COLORS = [
    themeColors.vibrant || themeColors.primary, 
    themeColors.accent2 || themeColors.secondary
  ];

  // Custom tooltip with improved styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = data.name === "객관식" ? COLORS[0] : COLORS[1];
      
      return (
        <div className="bg-white/90 backdrop-blur-sm p-2.5 rounded-lg shadow-xl border-2 transition-all duration-300" 
             style={{ 
               borderColor: color,
               boxShadow: `0 10px 25px -5px ${color}40`
             }}>
          <p className="font-semibold text-base" style={{ color }}>{data.name}</p>
          <p className="font-bold text-xl mt-1" style={{ color }}>{`${data.value}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom label renderer that shows percentages inside the pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    const RADIAN = Math.PI / 180;
    // Calculate the position for the text
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Determine color based on segment - inverse for better readability
    const color = "white";
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={color}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ 
          fontWeight: 'bold', 
          fontSize: '15px',
          textShadow: '-1px -1px 0 rgba(0,0,0,0.3), 1px -1px 0 rgba(0,0,0,0.3), -1px 1px 0 rgba(0,0,0,0.3), 1px 1px 0 rgba(0,0,0,0.3)',
        }}
      >
        {`${value}%`}
      </text>
    );
  };

  return (
    <div className="h-full w-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient key={`gradient-${index}`} id={`colorPie${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`${color}`} stopOpacity={1} />
                <stop offset="100%" stopColor={`${color}90`} stopOpacity={0.8} />
              </linearGradient>
            ))}
            {/* Add radial gradients for a more 3D effect */}
            {COLORS.map((color, index) => (
              <radialGradient key={`radial-${index}`} id={`radialPie${index}`} cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                <stop offset="0%" stopColor={`${color}ff`} stopOpacity={1} />
                <stop offset="70%" stopColor={`${color}dd`} stopOpacity={1} />
                <stop offset="100%" stopColor={`${color}aa`} stopOpacity={1} />
              </radialGradient>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={90}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1800}
            animationEasing="ease-out"
            paddingAngle={6}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#radialPie${index})`} 
                stroke={COLORS[index]}
                strokeWidth={3}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            iconType="circle" 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            formatter={(value) => {
              return <span style={{ color: value === "객관식" ? COLORS[0] : COLORS[1], fontWeight: "bold" }}>{value}</span>;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuestionTypePieChart;
