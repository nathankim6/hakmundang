
import React from 'react';
import { MessagesSquare } from 'lucide-react';
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
      pageIcon={<MessagesSquare className="h-10 w-10 text-indigo-600" />}
      pageTitle="동의어/반의어"
      pageDescription="영어 지문을 분석하여 핵심단어를 추출해, 동의어/반의어 정보를 표로 정리합니다."
      pageImage="/lovable-uploads/a3087c2e-a802-4523-8901-1134cba7a1c0.png"
    >
      {children}
    </SidebarLayout>
  );
};

export default PageLayout;
