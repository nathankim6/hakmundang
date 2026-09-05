
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestHeader = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      className="mb-4 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
      onClick={() => navigate('/')}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      뒤로가기
    </Button>
  );
};

export default TestHeader;
