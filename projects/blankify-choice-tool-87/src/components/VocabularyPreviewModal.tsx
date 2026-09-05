
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight, X, Download, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VocabularyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VocabularyPreviewModal: React.FC<VocabularyPreviewModalProps> = ({ isOpen, onClose }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Updated with new vocabulary images
  const images = [
    "/lovable-uploads/3e408ecb-1d55-4cb5-9380-df151b504eca.png",
    "/lovable-uploads/b046eef5-b4d3-49bb-ad19-354ad3e61837.png",
    "/lovable-uploads/c2552b03-2073-4260-b362-d7a4f9f4ecac.png",
    "/lovable-uploads/f6b949be-9d1f-42d8-bbba-95bdd309be3e.png"
  ];
  
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap() || 0);
    };
    
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleDotClick = (index: number) => {
    api?.scrollTo(index);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 bg-white border-0 shadow-xl rounded-xl overflow-hidden">
        <div className="relative w-full bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
          <DialogHeader className="pb-2 text-center">
            <DialogTitle className="text-2xl font-bold text-white flex items-center justify-center">
              <span className="px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">뉴베리타스 단어장 미리보기</span>
            </DialogTitle>
            <p className="text-sm text-white/80">핵심 어휘와 예문을 포함한 영어 학습 단어장</p>
          </DialogHeader>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
        </div>
        
        <Carousel className="w-full py-6 px-8 bg-gray-50" setApi={setApi}>
          <div className="relative">
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index} className="flex justify-center">
                  <div className="relative group overflow-hidden rounded-lg shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
                    <img 
                      src={img} 
                      alt={`단어장 페이지 ${index + 1}`} 
                      className="w-full h-auto max-h-[70vh] object-contain bg-white"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-4 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-center">
                        <span>페이지 {index + 1}/{images.length}</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30">
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="absolute -left-4 bg-white w-10 h-10 shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-100">
              <ChevronLeft className="h-5 w-5" />
            </CarouselPrevious>
            <CarouselNext className="absolute -right-4 bg-white w-10 h-10 shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-100">
              <ChevronRight className="h-5 w-5" />
            </CarouselNext>
          </div>
        </Carousel>
        
        <div className="flex items-center justify-center gap-2 p-4 bg-white border-t border-gray-100">
          {images.map((_, index) => (
            <button 
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                currentIndex === index 
                  ? "bg-yellow-500 scale-110" 
                  : "bg-gray-300 hover:bg-yellow-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VocabularyPreviewModal;
