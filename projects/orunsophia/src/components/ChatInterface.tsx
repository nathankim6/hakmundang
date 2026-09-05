import React, { useState, useRef, useEffect } from 'react';
import Header from './Header'; // Import Header
import Footer from './Footer'; // Import Footer
import { Send, Loader2, Image, Sparkles, X, ZoomIn, ZoomOut, Maximize, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from './ImageUploader';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  image?: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: '안녕하세요! 옳은영어 AI 조교 Sophia입니다. 영어 공부 중 궁금한 점, 모르는 단어, 해석이 필요한 문장 등 어떤 질문이든 물어보세요. 사진으로 문제를 찍어서 보내도 됩니다.',
    sender: 'ai',
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedViewImage, setSelectedViewImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's an uploaded image in localStorage
    const savedImage = localStorage.getItem('uploadedImage');
    
    if (savedImage) {
      setSelectedImage(savedImage);
      setInputValue("이 문제를 풀이하고 정답과 해설을 제공해주세요.");
      
      // Clear localStorage after retrieving the image
      localStorage.removeItem('uploadedImage');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Send message button clicked");
    if (!inputValue.trim() && !selectedImage) return;
    let messageText = inputValue.trim() || "이 문제를 해설해주세요.";
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      image: selectedImage || undefined
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setSelectedImage(null);
    setIsLoading(true);
    
    try {
      const historyMessages = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      const message = selectedImage || inputValue;
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: message,
          history: historyMessages
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || !data.message) {
        throw new Error('No response from AI');
      }
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error('Chat API error:', error);
      toast({
        title: "오류 발생",
        description: "AI 응답을 가져오는데 문제가 발생했습니다. 나중에 다시 시도해주세요.",
        variant: "destructive",
        className: "mobile-toast"
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '죄송합니다. 요청을 처리하는 중에 문제가 발생했습니다. 나중에 다시 시도해 주세요.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelected = (imageData: string) => {
    console.log("Image selected");
    setSelectedImage(imageData);
    if (!inputValue.trim()) {
      setInputValue("이 문제를 풀이하고 정답과 해설을 제공해주세요.");
    }
  };

  const handleImageClick = (imageUrl: string) => {
    console.log("Image clicked for viewing");
    setSelectedViewImage(imageUrl);
    setImageScale(1);
  };

  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setImageScale(1);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatAIResponse = (text: string): React.ReactNode => {
    const parts = text.split('\n');
    return (
      <div className="space-y-3">
        {parts.map((part, idx) => {
          // 헤더 - 큰 제목
          if (part.startsWith('# ')) {
            return (
              <motion.h3 
                key={idx} 
                className="text-lg font-bold text-toss-text border-b border-toss-border pb-2 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <Sparkles className="h-4 w-4 text-toss-blue" />
                <span>{part.substring(2)}</span>
              </motion.h3>
            );
          }
          
          // 소제목
          if (part.startsWith('## ')) {
            return (
              <motion.h4 
                key={idx} 
                className="text-md font-medium text-toss-gray flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <div className="w-1 h-4 bg-toss-blue rounded-full"></div>
                {part.substring(3)}
              </motion.h4>
            );
          }
          
          // 불릿 포인트
          if (part.startsWith('- ') || part.startsWith('* ')) {
            return (
              <motion.div 
                key={idx} 
                className="flex items-start gap-3 pl-2 group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-toss-blue mt-2"></div>
                <p className="text-toss-text group-hover:text-toss-gray transition-colors flex-1">
                  {part.substring(2)}
                </p>
              </motion.div>
            );
          }
          
          // 숫자 리스트
          if (/^\d+\./.test(part)) {
            const number = part.split('.')[0];
            return (
              <motion.div 
                key={idx} 
                className="flex items-start gap-3 pl-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <span className="text-toss-blue font-medium mr-2">{number}.</span>
                <p className="text-toss-text flex-1">{part.substring(number.length + 1).trim()}</p>
              </motion.div>
            );
          }
          
          // 일반 텍스트
          if (part.trim().length > 0) {
            return (
              <motion.p 
                key={idx} 
                className="leading-relaxed text-toss-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                {part}
              </motion.p>
            );
          }
          
          return <div key={idx} className="h-2"></div>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Header /> {/* Add Header at the top */}
      
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col mobile-chat-container toss-chat-container overflow-hidden h-full">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-toss-border/10">
            <div className="flex items-center">
              <button 
                onClick={handleGoBack}
                className="mr-2 p-2 rounded-full hover:bg-toss-secondary transition-colors touch-target touch-feedback"
              >
                <ArrowLeft className="h-5 w-5 text-toss-gray" />
              </button>
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/lovable-uploads/4bdbca69-6a79-43bb-a58f-fc20cc3b97d9.png" className="object-cover" />
                <AvatarFallback className="bg-toss-blue/10 text-toss-blue">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <h3 className="text-base font-medium">Sophia</h3>
            </div>
            <div className="flex items-center space-x-1">
              <span className="px-2 py-1 text-xs bg-toss-secondary rounded-full text-toss-textSecondary">AI 조교</span>
            </div>
          </div>
          
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4 bg-white smooth-scroll">
            <div className="space-y-6 pr-2">
              {messages.map((message, index) => (
                <div key={message.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  {index > 0 && (
                    <div className="toss-divider mb-4">
                      <div className="toss-divider-content">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                      {message.sender === 'ai' && (
                        <motion.div 
                          className="flex items-center mb-1"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src="/lovable-uploads/4bdbca69-6a79-43bb-a58f-fc20cc3b97d9.png" className="object-cover" />
                            <AvatarFallback className="bg-toss-blue/10 text-toss-blue">
                              <Sparkles className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-toss-textSecondary">Sophia</span>
                        </motion.div>
                      )}
                      
                      <motion.div 
                        className={cn(
                          "p-4 rounded-2xl max-w-full",
                          message.sender === 'user' 
                            ? "bg-toss-blue text-white" 
                            : "bg-toss-secondary text-toss-text border border-toss-border/10"
                        )}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        {message.image && (
                          <div 
                            className="mb-3 rounded-lg overflow-hidden border border-toss-border/20 aspect-square w-full max-w-[240px] cursor-pointer" 
                            onClick={() => handleImageClick(message.image!)}
                          >
                            <img 
                              src={message.image} 
                              alt="업로드된 이미지" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        
                        {message.sender === 'ai' 
                          ? formatAIResponse(message.text)
                          : (
                            <p className={`${isMobile ? 'text-sm' : 'text-base'} tracking-wide`}>
                              {message.text}
                            </p>
                          )
                        }
                      </motion.div>
                      
                      {message.sender === 'user' && (
                        <motion.div 
                          className="flex items-center mt-1 text-xs text-toss-textSecondary"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <span>사용자</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Chat Input */}
          <motion.form 
            onSubmit={handleSendMessage} 
            className="border-t border-toss-border/10 p-3 flex gap-2 bg-white w-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <ImageUploader onImageSelected={handleImageSelected} />
            
            {selectedImage && (
              <div className="flex items-center bg-toss-secondary rounded-md px-2 py-1 text-xs text-toss-textSecondary">
                <Image className="h-3 w-3 mr-1" />
                이미지 첨부됨
              </div>
            )}
            
            <input 
              type="text" 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              placeholder={isMobile ? "질문을 입력하세요..." : "영어 관련 질문을 입력하세요..."} 
              disabled={isLoading} 
              className="flex-1 bg-white text-toss-text border border-toss-border rounded-full py-2 px-4 outline-none focus:border-toss-blue focus:ring-1 focus:ring-toss-blue/20 min-w-0" 
            />
            
            <motion.button 
              type="submit" 
              className={cn(
                "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-colors touch-target touch-feedback",
                isLoading 
                  ? "bg-toss-secondary text-toss-textSecondary" 
                  : "bg-toss-blue text-white"
              )}
              disabled={isLoading}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </motion.button>
          </motion.form>

          {/* Image View Dialog */}
          <Dialog open={!!selectedViewImage} onOpenChange={open => !open && setSelectedViewImage(null)}>
            <DialogContent className="sm:max-w-4xl bg-white border border-toss-border/20 p-0 overflow-hidden rounded-xl">
              <div className="relative">
                <div className="bg-toss-blue text-white py-2 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    <span className="font-medium">이미지 보기</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleZoomIn} 
                      type="button"
                      className="p-2 rounded-full hover:bg-white/10 transition-colors touch-target touch-feedback" 
                      title="확대"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={handleZoomOut}
                      type="button"
                      className="p-2 rounded-full hover:bg-white/10 transition-colors touch-target touch-feedback" 
                      title="축소"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={handleResetZoom}
                      type="button"
                      className="p-2 rounded-full hover:bg-white/10 transition-colors touch-target touch-feedback" 
                      title="원래 크기로"
                    >
                      <Maximize className="h-4 w-4" />
                    </button>
                    <DialogClose className="p-2 rounded-full hover:bg-white/10 transition-colors touch-target touch-feedback">
                      <X className="h-4 w-4" />
                    </DialogClose>
                  </div>
                </div>
                
                <div className="h-[80vh] flex items-center justify-center bg-toss-background p-4 overflow-auto">
                  {selectedViewImage && (
                    <div 
                      className="relative cursor-move" 
                      style={{
                        transform: `scale(${imageScale})`,
                        transition: 'transform 0.2s ease-out'
                      }}
                    >
                      <img 
                        src={selectedViewImage} 
                        alt="확대된 이미지" 
                        className="max-h-full object-contain" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Footer /> {/* Add Footer at the bottom */}
    </div>
  );
};

export default ChatInterface;
