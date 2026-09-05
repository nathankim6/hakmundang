
import React from 'react';
import { Settings } from 'lucide-react';
import SidebarLayout from '@/components/shared/SidebarLayout';

interface PageLayoutProps {
  children: React.ReactNode;
  apiKeyButton: React.ReactNode;
  isAdmin: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  apiKeyButton,
  isAdmin
}) => {
  return (
    <SidebarLayout
      apiKeyButton={apiKeyButton}
      isAdmin={isAdmin}
      pageIcon={
        <div className="bg-blue-100 p-2.5 rounded-full">
          <Settings className="h-6 w-6 text-blue-600" />
        </div>
      }
      pageTitle="분석지"
      pageDescription="한 줄 해석 자료를 제작합니다. (제목, 한 줄 해석 텍스트, 주요 어휘)"
    >
      {children}
    </SidebarLayout>
  );
};

export default PageLayout;
