
import React from 'react';
import { FolderOpen } from 'lucide-react';
import SidebarLayout from '@/components/shared/SidebarLayout';

interface PageLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  isAdmin = false
}) => {
  return (
    <SidebarLayout
      isAdmin={isAdmin}
      pageIcon={<FolderOpen className="h-10 w-10 text-teal-600" />}
      pageTitle="내 작업"
      pageDescription="저장된 작업물을 관리하고 편집할 수 있습니다. 각 단계별 작업 결과를 확인하세요."
    >
      {children}
    </SidebarLayout>
  );
};

export default PageLayout;
