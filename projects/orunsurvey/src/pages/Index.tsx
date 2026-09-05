import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight">환영합니다</h1>
                <p className="text-sm text-muted-foreground">설문조사 시스템</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6">
              <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold">설문조사 시스템</h2>
                  <p className="text-xl text-muted-foreground">
                    간편하게 설문조사를 만들고 응답을 수집하세요
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t bg-background">
            <div className="container mx-auto px-6 py-4">
              <p className="text-center text-sm text-muted-foreground">
                © 2024 ORUN ENGLISH. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
