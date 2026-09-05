
import React from 'react';
import { Image } from 'lucide-react';
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
      pageIcon={<Image className="h-10 w-10 text-purple-600" />}
      pageTitle="삽화 생성"
      pageDescription="지문의 주제와 핵심 내용을 바탕으로 삽화를 생성합니다."
      pageImage="/lovable-uploads/3043bfff-3c0e-4985-a25f-ae6a6cbb8006.png"
    >
      {children}
    </SidebarLayout>
  );
};

export default PageLayout;
