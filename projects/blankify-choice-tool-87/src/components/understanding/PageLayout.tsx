
import React from 'react';
import { BookOpen } from 'lucide-react';
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
      pageIcon={<BookOpen className="h-10 w-10 text-green-600" />}
      pageTitle="내용이해"
      pageDescription="영어 지문의 주제문와 제목, 요약문 정리와 True or False 문제를 생성합니다."
    >
      {children}
    </SidebarLayout>
  );
};

export default PageLayout;
