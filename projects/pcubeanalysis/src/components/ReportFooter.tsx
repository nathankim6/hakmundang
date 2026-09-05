
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface ReportFooterProps {
  themeColors: any;
}

const ReportFooter: React.FC<ReportFooterProps> = ({
  themeColors
}) => {
  return <div className="mt-8 pt-6 border-t flex flex-col items-center justify-center relative z-10">
      <div className="w-full max-w-4xl mx-auto">
        <div className="w-full border-t border-gray-100 pt-4 flex flex-col items-center">
          <p className="text-xs text-gray-400 text-center">© {new Date().getFullYear()} Pcube Academy. All rights reserved.</p>
        </div>
      </div>
    </div>;
};

export default ReportFooter;
