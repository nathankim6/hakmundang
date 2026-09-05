
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Sparkles, MessageCircle, Calendar, ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import AnimatedCard from '@/components/AnimatedCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QAHistory {
  id: string;
  title: string;
  student_name: string;
  question: string;
  created_at: string;
  tags: string[];
}

const Storage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [qaHistory, setQaHistory] = useState<QAHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [activeSort, setActiveSort] = useState('최신순');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQAHistory();
  }, [activeSort]);

  const fetchQAHistory = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('qa_history')
        .select('id, title, student_name, question, created_at, tags')

      if (activeSort === '최신순') {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setQaHistory(data || []);
    } catch (error) {
      console.error('Error fetching QA history:', error);
      toast({
        title: "데이터 로드 실패",
        description: "질문 내역을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuestions = qaHistory.filter(qa => {
    const matchesSearch = searchTerm === '' || 
      qa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qa.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === '전체' || 
      qa.tags?.includes(activeCategory);
    
    return matchesSearch && matchesCategory;
  });
  
  const handleQuestionClick = (id: string) => {
    navigate(`/chat?question=${id}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-toss-background pb-16">
      <Header />
      
      <main className="flex-grow">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="relative mb-4">
            <div className="flex items-center bg-white rounded-full border border-toss-border/30 overflow-hidden">
              <Search className="h-5 w-5 text-toss-textSecondary ml-4" />
              <input
                type="text"
                placeholder="질문 내용이나 이름으로 검색"
                className="py-3 px-3 w-full outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-3 hover:bg-toss-secondary flex items-center justify-center"
              >
                <SlidersHorizontal className="h-5 w-5 text-toss-textSecondary" />
              </button>
            </div>
          </div>
          
          {showFilters && (
            <motion.div 
              className="bg-white rounded-lg p-4 mb-4 border border-toss-border/30"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="mb-3">
                <p className="text-sm font-medium mb-2">분류</p>
                <div className="flex flex-wrap gap-2">
                  {['전체', '문법', '어휘', '독해', '작문', '회화'].map(category => (
                    <button 
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full",
                        activeCategory === category 
                          ? "bg-toss-blue text-white" 
                          : "bg-toss-secondary text-toss-textSecondary hover:bg-toss-secondary/70"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">정렬</p>
                <div className="flex flex-wrap gap-2">
                  {['최신순'].map(sort => (
                    <button 
                      key={sort}
                      onClick={() => setActiveSort(sort)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full",
                        activeSort === sort 
                          ? "bg-toss-blue text-white" 
                          : "bg-toss-secondary text-toss-textSecondary hover:bg-toss-secondary/70"
                      )}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-3 pr-2">
              {isLoading ? (
                <div className="bg-white rounded-lg p-6 text-center">
                  <p className="text-toss-textSecondary">데이터를 불러오는 중...</p>
                </div>
              ) : filteredQuestions.length > 0 ? (
                filteredQuestions.map((qa, index) => (
                  <AnimatedCard 
                    key={qa.id} 
                    className="hover:border-toss-blue/50 transition-all" 
                    delay={index * 0.05}
                    onClick={() => handleQuestionClick(qa.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 mt-1">
                          <div className="bg-toss-secondary text-toss-blue w-full h-full flex items-center justify-center">
                            <Sparkles className="h-4 w-4" />
                          </div>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">{qa.title}</h3>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            {qa.tags?.map(tag => (
                              <span 
                                key={tag} 
                                className="bg-toss-secondary text-xs px-2 py-0.5 rounded-full text-toss-textSecondary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-toss-textSecondary">
                            <div className="flex items-center gap-3">
                              <span>{qa.student_name}</span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(qa.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))
              ) : (
                <div className="bg-white rounded-lg p-6 text-center">
                  <p className="text-toss-textSecondary">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Storage;
