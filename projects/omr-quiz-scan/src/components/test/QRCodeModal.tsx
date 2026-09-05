
import React from 'react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal = ({ isOpen, onClose }: QRCodeModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div className="bg-white/95 p-6 rounded-lg shadow-xl border border-white/20 max-w-[90vw] w-auto">
        <img 
          src="/lovable-uploads/229b0241-69a4-4e7e-a8db-5d408dc31467.png"
          alt="Test QR Code"
          className="w-64 h-64 object-contain mx-auto"
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-full mt-4 text-center text-sm text-[#6E6D70] hover:text-[#403E43] transition-colors cursor-pointer"
        >
          클릭하여 닫기
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
