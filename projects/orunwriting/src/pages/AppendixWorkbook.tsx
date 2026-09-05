import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppendixPage, AppendixDividerPage, APPENDIX_PAGE_COUNT } from "@/components/workbook/AppendixPage";
import { GrammarHardCover } from "@/components/workbook/GrammarHardCover";
import { GrammarBackCover } from "@/components/workbook/GrammarBackCover";

export default function AppendixWorkbook() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Generate all pages
  const pages = useMemo(() => {
    const allPages: any[] = [];
    let pageNum = 1;

    // Cover page
    allPages.push({ type: 'hardcover', pageNum: pageNum++ });

    // Appendix divider
    allPages.push({ type: 'appendix-divider', pageNum: pageNum++ });

    // Appendix pages
    for (let i = 0; i < APPENDIX_PAGE_COUNT; i++) {
      allPages.push({ type: 'appendix', appendixPageIndex: i, pageNum: pageNum++ });
    }

    // Back cover
    allPages.push({ type: 'backcover', pageNum: pageNum++ });

    return allPages;
  }, []);

  const totalPages = pages.length;
  const currentPageData = pages[currentPage - 1];

  const handlePrint = () => {
    window.print();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (isTyping) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentPage(prev => Math.max(1, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages]);

  const renderPage = (page: any) => {
    switch (page.type) {
      case 'hardcover':
        return <GrammarHardCover totalPages={totalPages} variant="appendix" />;
      case 'appendix-divider':
        return (
          <AppendixDividerPage
            pageNumber={page.pageNum}
            totalPages={totalPages}
          />
        );
      case 'appendix':
        return (
          <AppendixPage
            pageNumber={page.pageNum}
            totalPages={totalPages}
            pageIndex={page.appendixPageIndex || 0}
          />
        );
      case 'backcover':
        return <GrammarBackCover totalPages={totalPages} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-muted"
            >
              <Home className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= totalPages) {
                      setCurrentPage(val);
                    }
                  }}
                  className="w-16 text-center border rounded-md px-2 py-1 text-sm"
                />
                <span className="text-sm text-muted-foreground">/ {totalPages}</span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              인쇄
            </Button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 container mx-auto py-8 flex justify-center">
        <div className="shadow-xl">
          {renderPage(currentPageData)}
        </div>
      </main>
    </div>
  );
}
