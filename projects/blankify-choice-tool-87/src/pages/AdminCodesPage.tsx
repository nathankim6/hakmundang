
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

const AdminCodesPage = () => {
  const { accessCodes, addCode, removeCode } = useAccessCode();
  const [newCode, setNewCode] = useState('');
  const navigate = useNavigate();

  const handleAddCode = () => {
    if (newCode.trim()) {
      addCode(newCode.trim());
      setNewCode('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCode();
    }
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-50">
        {/* Header with back button */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/50 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Button>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              코드 관리
            </h1>
            <div className="w-24"></div> {/* Empty div for balance */}
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="text-2xl font-bold">액세스 코드 관리</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <Input
                      placeholder="새 액세스 코드 입력"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-grow"
                    />
                    <Button 
                      onClick={handleAddCode}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      추가
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-700">현재 코드 목록</h3>
                    {accessCodes.length === 0 ? (
                      <p className="text-gray-500 italic">등록된 코드가 없습니다.</p>
                    ) : (
                      <div className="rounded-md border overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">코드</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {accessCodes.map((code, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeCode(code)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="w-full mt-auto bg-gradient-to-r from-slate-800 to-gray-900 text-white">
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminCodesPage;
