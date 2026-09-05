import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import TimerComponent from '@/components/TimerComponent';
import { Timer as TimerIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';

const Timer = () => {
  const [showTimer, setShowTimer] = useState(true);
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50">
      <PageHeader
        title="시험 타이머"
        subtitle="시험 시간을 관리하세요"
        backPath="/"
      />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">타이머 사용 방법</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>시작 버튼을 눌러 타이머를 시작합니다</li>
            <li>일시정지 버튼으로 타이머를 일시 중지할 수 있습니다</li>
            <li>리셋 버튼으로 타이머를 초기화합니다</li>
            <li>기본 시간(15분, 30분, 45분, 60분)을 선택하거나 직접 입력할 수 있습니다</li>
            <li>타이머가 끝나면 알림음이 재생됩니다</li>
          </ul>
          
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={() => setShowTimer(prev => !prev)}
              variant="outline"
              className="border-indigo-400 hover:bg-indigo-50"
            >
              {showTimer ? '타이머 숨기기' : '타이머 표시하기'}
            </Button>
            
            <Button 
              onClick={() => setShowFloatingTimer(prev => !prev)}
              variant="outline"
              className="border-emerald-400 hover:bg-emerald-50"
            >
              {showFloatingTimer ? '플로팅 타이머 숨기기' : '플로팅 타이머 표시하기'}
            </Button>
          </div>
          
          {showTimer && (
            <div className="flex justify-center mb-8">
              <TimerComponent 
                initialMinutes={45} 
                expandable={false}
              />
            </div>
          )}
          
          <div className="bg-indigo-50 p-4 rounded-md">
            <h3 className="font-medium text-indigo-700 mb-2">시험 중 사용 팁</h3>
            <p className="text-gray-700 text-sm">
              시험을 보기 전에 타이머를 설정하고 시작하세요. 플로팅 타이머를 사용하면 다른 페이지로 이동해도 타이머를 계속 볼 수 있습니다.
              시간이 부족할 경우, 남은 문제의 우선순위를 정하여 가능한 많은 문항을 풀 수 있도록 하세요.
            </p>
          </div>
        </div>
      </div>
      
      {showFloatingTimer && (
        <div className="fixed bottom-6 right-6 z-50">
          <TimerComponent 
            initialMinutes={45} 
            onClose={() => setShowFloatingTimer(false)}
          />
        </div>
      )}
      
      {!showFloatingTimer && (
        <Button 
          onClick={() => setShowFloatingTimer(true)}
          className="fixed bottom-6 right-6 z-50 bg-indigo-500 hover:bg-indigo-600 shadow-lg"
          size="icon"
        >
          <TimerIcon className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default Timer;
