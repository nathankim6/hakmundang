
import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  image: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  buttonColor: string;
  onButtonClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  badge,
  badgeColor,
  title,
  description,
  buttonColor,
  onButtonClick
}) => {
  // Create a mapping for badge colors to ensure better visibility
  const getBadgeGradient = (color: string) => {
    const colorMap: Record<string, string> = {
      'yellow': 'from-yellow-400 to-yellow-500',
      'pink': 'from-pink-400 to-pink-500',
      'amber': 'from-amber-400 to-amber-500'
    };
    
    return colorMap[color] || `from-${color}-400 to-${color}-500`;
  };

  return (
    <div className="relative group transform transition-all duration-500 hover:scale-105">
      <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-104 object-cover transition-all duration-500 transform group-hover:opacity-80"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 rounded-b-xl">
        <div className="flex items-center mb-1 p-1 bg-black/60 backdrop-blur-sm rounded-lg">
          <div className={`bg-gradient-to-br ${getBadgeGradient(badgeColor)} rounded-full p-1 mr-2 shadow-inner`}>
            <Star className="h-3 w-3 text-white" fill="white" />
          </div>
          <span className={`text-${badgeColor}-300 text-sm font-medium`}>{badge}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-gray-300 text-xs mb-2">{description}</p>
        <Button 
          variant="default" 
          size="sm" 
          className={`w-full bg-gradient-to-r ${buttonColor} hover:from-${badgeColor}-700 hover:to-purple-700`}
          onClick={onButtonClick}
        >
          자세히 보기 <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
