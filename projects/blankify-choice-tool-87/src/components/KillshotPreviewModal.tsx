
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight, X, Download, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KillshotPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KillshotPreviewModal: React.FC<KillshotPreviewModalProps> = ({ isOpen, onClose }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const images = [
    "/lovable-uploads/6d51c0a1-2c3d-428e-bf49-64363675ca2b.png",
    "/lovable-uploads/4058f487-25f5-47ed-ac57-c15f82eaf34d.png",
    "/lovable-uploads/b37a6ad1-add6-4bfc-9814-8fbcc7630efb.png",
    "/lovable-uploads/985686c5-34ab-42b1-b8ee-3e0d268f1011.png",
    "/lovable-uploads/7ca79ad8-2507-432d-9838-2a8d7559c823.png",
    "/lovable-uploads/7c6a86d5-8739-4c50-8d64-212403cfa35b.png",
    "/lovable-uploads/b0dfad7a-7ae7-4bdb-8f79-4253ab18191f.png"
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
        <div className="relative w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4">
          <DialogHeader className="pb-2 text-center">
            <DialogTitle className="text-2xl font-bold text-white flex items-center justify-center">
              <span className="px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">킬샷 유형서 미리보기</span>
            </DialogTitle>
            <p className="text-sm text-white/80">핵심 유형 집중 훈련 문제집</p>
          </DialogHeader>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
        </div>
        
        <Carousel className="w-full py-6 px-8 bg-gray-50" setApi={setApi}>
          <div className="relative">
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index} className="flex justify-center">
                  <div className="relative group overflow-hidden rounded-lg shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
                    <img 
                      src={img} 
                      alt={`킬샷 페이지 ${index + 1}`} 
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
                  ? "bg-amber-500 scale-110" 
                  : "bg-gray-300 hover:bg-amber-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KillshotPreviewModal;
