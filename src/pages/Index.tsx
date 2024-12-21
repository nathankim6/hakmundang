import { QuestionGenerator } from "@/components/QuestionGenerator";
import { APIConfig } from "@/components/APIConfig";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Index = () => {
  const schoolLogos = [
    "/lovable-uploads/20b0f2ff-cdcf-4f03-b11f-c7784911d0ab.png",
    "/lovable-uploads/8c42d23c-0b51-4c0e-894f-44f25e8c3202.png",
    "/lovable-uploads/9135553c-1b3b-4f9f-9546-bcdaafecaca2.png",
    "/lovable-uploads/6b080863-9a5f-4957-b206-137f8d73767b.png",
    "/lovable-uploads/dc8d1110-fbd3-4209-a668-776accfb9f17.png",
    "/lovable-uploads/6abcb1db-6129-4b59-b2d2-0abc598ea391.png"
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 luxury-pattern">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold animate-title tracking-wider mb-4 relative">
            ORUN AI QUIZ MAKER
          </h1>
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent max-w-2xl mx-auto mb-8" />
          
          <div className="max-w-4xl mx-auto mb-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {schoolLogos.map((logo, index) => (
                  <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                    <div className="p-2">
                      <div className="rounded-full overflow-hidden bg-white/5 backdrop-blur-sm p-4 hover:scale-105 transition-transform duration-300 metallic-border">
                        <img
                          src={logo}
                          alt={`School logo ${index + 1}`}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </div>
        
        <div className="mb-8">
          <APIConfig />
        </div>
        <QuestionGenerator />
      </div>
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>© 2024 ORUN AI QUIZ MAKER. All rights reserved by 웅은아 컴퍼니</p>
      </footer>
    </div>
  );
};

export default Index;