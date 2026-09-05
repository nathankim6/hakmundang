
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkbookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkbookPreviewModal: React.FC<WorkbookPreviewModalProps> = ({ isOpen, onClose }) => {
  const images = [
    "/lovable-uploads/006c67fa-977d-44a3-ad1d-d391bd03fd5f.png",
    "/lovable-uploads/9f6f5c9c-1362-42d3-b60f-4cdcecafe48b.png",
    "/lovable-uploads/ec48de39-04a5-441e-8c18-a2ed5988c9cd.png",
    "/lovable-uploads/d7edeab3-f757-4abd-aa1a-a4fa49a117be.png",
    "/lovable-uploads/6164645a-4a11-4c6a-99c8-b1da6fa15c85.png",
    "/lovable-uploads/07191223-6dba-4b48-aeed-464af8ddbb47.png"
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 bg-white border-0 shadow-xl rounded-xl overflow-hidden">
        <div className="relative w-full bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4">
          <DialogHeader className="pb-2 text-center">
            <DialogTitle className="text-2xl font-bold text-white flex items-center justify-center">
              <span className="px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">뉴베리타스 워크북 미리보기</span>
            </DialogTitle>
            <p className="text-sm text-white/80">영어 지문 분석과 다양한 학습 자료를 담은 워크북</p>
          </DialogHeader>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400" />
        </div>
        
        <Carousel className="w-full py-6 px-8 bg-gray-50">
          <div className="relative">
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index} className="flex justify-center">
                  <div className="relative group overflow-hidden rounded-lg shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
                    <img 
                      src={img} 
                      alt={`워크북 페이지 ${index + 1}`} 
                      className="w-full h-auto max-h-[70vh] object-contain bg-white"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-4 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-center">
                        <span>페이지 {index + 1}/{images.length}</span>
                        <span className="text-xs font-normal bg-blue-600/80 px-2 py-1 rounded-full">NEW VERITAS</span>
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
        
        <div className="flex items-center justify-center gap-1 p-4 bg-white border-t border-gray-100">
          {images.map((_, index) => (
            <div 
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300 hover:bg-blue-500 cursor-pointer transition-colors duration-200"
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkbookPreviewModal;
