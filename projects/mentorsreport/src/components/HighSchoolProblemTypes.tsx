
import React from 'react';
import { BarChart, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProblemType = {
  id: string;
  name: string;
  category: string;
  questionType: 'objective' | 'subjective';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
};

interface HighSchoolProblemTypesProps {
  problemTypes: ProblemType[];
  onAddProblemType: () => void;
  onAddMultiple: (count: number) => void;
  onRemoveType: (id: string) => void;
  onRemoveAll: () => void;
  onUpdateType: (id: string, field: keyof ProblemType, value: string) => void;
  addCount: number;
  onAddCountChange: (count: number) => void;
}

const HighSchoolProblemTypes: React.FC<HighSchoolProblemTypesProps> = ({
  problemTypes,
  onAddProblemType,
  onAddMultiple,
  onRemoveType,
  onRemoveAll,
  onUpdateType,
  addCount,
  onAddCountChange
}) => {
  // Category options for high school problem types
  const categoryOptions = ["교과서", "부교재(모의고사)", "단어장", "핸드아웃"];
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <BarChart className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-800">문제 유형</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              min="1" 
              max="40" 
              value={addCount} 
              onChange={e => onAddCountChange(Math.min(40, Math.max(1, parseInt(e.target.value) || 1)))} 
              className="w-20 text-center" 
              placeholder="개수" 
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => onAddMultiple(addCount)} 
              className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all duration-300"
            >
              <Plus className="h-4 w-4" /> 유형 추가
            </Button>
          </div>
          {problemTypes.length > 0 && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onRemoveAll} 
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 transition-all duration-300"
            >
              <Trash2 className="h-4 w-4" /> 전체 삭제
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50/80 rounded-lg text-sm font-medium text-gray-600">
          <div className="col-span-1 flex items-center">번호</div>
          <div className="col-span-2 flex items-center">대분류</div>
          <div className="col-span-3 flex items-center">소분류</div>
          <div className="col-span-3 flex items-center">문제 유형</div>
          <div className="col-span-2 flex items-center">난이도</div>
          <div className="col-span-1"></div>
        </div>
        
        <div className="space-y-3">
          {problemTypes.map((type, index) => (
            <div 
              key={type.id} 
              className="flex flex-col md:flex-row gap-2 items-center p-3 rounded-xl hover:bg-blue-50/50 transition-all duration-300 border border-gray-100/80 shadow-sm hover:shadow-md"
            >
              <div className="flex-none w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm shadow-inner">
                {index + 1}
              </div>
              
              <div className="w-full md:w-auto flex-grow md:flex-grow-0">
                <Select 
                  value={type.category} 
                  onValueChange={value => onUpdateType(type.id, 'category', value)}
                >
                  <SelectTrigger className="w-full md:w-[160px] bg-white/80 border-gray-200">
                    <SelectValue placeholder="대분류 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 w-full">
                <Input 
                  value={type.name} 
                  onChange={e => onUpdateType(type.id, 'name', e.target.value)} 
                  placeholder="하위 유형을 입력하세요" 
                  className="w-full bg-white/80 border-gray-200 focus:border-blue-300 transition-all" 
                />
              </div>

              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <Select 
                  value={type.questionType} 
                  onValueChange={value => onUpdateType(type.id, 'questionType', value)}
                >
                  <SelectTrigger className="min-w-[120px] w-full md:w-auto bg-white/80 border-gray-200">
                    <SelectValue placeholder="문제 유형" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="objective">객관식</SelectItem>
                    <SelectItem value="subjective">서답형</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={type.difficulty} 
                  onValueChange={value => onUpdateType(type.id, 'difficulty', value)}
                >
                  <SelectTrigger className="min-w-[120px] w-full md:w-auto bg-white/80 border-gray-200">
                    <SelectValue placeholder="난이도" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">쉬움</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="hard">어려움</SelectItem>
                    <SelectItem value="very_hard">매우 어려움</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemoveType(type.id)} 
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HighSchoolProblemTypes;
