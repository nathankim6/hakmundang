
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadTests } from '@/utils/testStorage';
import TestList from '@/components/TestList';
import { QRDataType } from '@/types/test';
import BackButton from '@/components/BackButton';

const Tests = () => {
  const [tests, setTests] = useState<QRDataType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const loadedTests = await loadTests();
        setTests(loadedTests);
      } catch (error) {
        console.error('Error loading tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  return (
    <div className="min-h-screen w-full">
      {loading ? (
        <div className="min-h-screen p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50 flex items-center justify-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
            <div className="w-3 h-3 bg-sky-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
          </div>
        </div>
      ) : tests.length > 0 ? (
        <TestList tests={tests} />
      ) : (
        <div className="min-h-screen p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <BackButton fallbackPath="/" />
              <Link to="/admin">
                <Button variant="outline">관리자 페이지</Button>
              </Link>
            </div>
            
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl rounded-xl">
              <div className="text-center py-16">
                <div className="w-24 h-24 mb-6 rounded-full bg-indigo-50 flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">저장된 시험이 없습니다</h3>
                <p className="text-gray-500 mb-6">새로운 시험을 만들어 학생들의 성적을 관리하세요.</p>
                <Link to="/admin">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">시험 만들기</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;
