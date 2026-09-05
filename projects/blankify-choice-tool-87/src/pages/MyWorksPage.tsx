
import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageLayout from '@/components/my-works/PageLayout';
import WorksList from '@/components/my-works/WorksList';
import { useAccessCode } from '@/contexts/AccessCodeContext';

const MyWorksPage = () => {
  const { isAdmin } = useAccessCode();
  
  return (
    <ProtectedRoute requireAdmin={true}>
      <PageLayout isAdmin={isAdmin}>
        <WorksList />
      </PageLayout>
    </ProtectedRoute>
  );
};

export default MyWorksPage;
