import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Home, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const LevelTestComplete = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center border-0 shadow-xl bg-white/80 backdrop-blur">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-800">수고하셨습니다!</h1>
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>

            <p className="text-gray-600 mb-2">
              시험이 성공적으로 제출되었습니다.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              결과는 담당 선생님께서 확인 후 안내드릴 예정입니다.
            </p>

            <Button 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md"
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LevelTestComplete;
