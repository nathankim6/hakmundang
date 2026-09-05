
import React from 'react';
import { FileText } from 'lucide-react';
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
      pageIcon={<FileText className="h-10 w-10 text-purple-600" />}
      pageTitle="선택/배열/영작"
      pageDescription="영어 지문을 분석하고 다양한 문제 유형과 학습 자료를 생성합니다."
    >
      {children}
    </SidebarLayout>
  );
};

export default PageLayout;
