
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CodeGenerationForm } from '@/components/access-code/CodeGenerationForm';
import { SavedCodesList } from '@/components/access-code/SavedCodesList';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const GenerateCode = () => {
  const navigate = useNavigate();
  const [savedCodes, setSavedCodes] = useState<Array<{
    code: string;
    user_name: string;
    expiry_date: string;
    id: string;
  }>>([]);
  
  useEffect(() => {
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    if (!isAdmin) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    fetchSavedCodes();
  }, []);

  const fetchSavedCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSavedCodes(data || []);
    } catch (error) {
      console.error('Error fetching saved codes:', error);
    }
  };

  return (
    <div className="min-h-screen bg-toss-background pb-20">
      <Header />
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate('/profile')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로 가기
        </Button>

        <CodeGenerationForm onCodeGenerated={fetchSavedCodes} />
        <SavedCodesList savedCodes={savedCodes} onCodesUpdated={fetchSavedCodes} />
      </div>
      <Footer />
    </div>
  );
};

export default GenerateCode;
