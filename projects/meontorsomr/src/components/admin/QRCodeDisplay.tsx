
interface QRCodeDisplayProps {
  show: boolean;
}

const QRCodeDisplay = ({
  show
}: QRCodeDisplayProps) => {
  if (!show) return null;

  return (
    <div className="flex flex-col items-center space-y-4 mt-6 p-4 border rounded-lg border-emerald-200 bg-emerald-50/50">
      <img src="/lovable-uploads/01e9f9f2-ab7a-40b4-ad20-aa38cb450c7e.png" alt="Test QR Code" className="w-48 h-48 object-contain" />
      <p className="text-sm text-emerald-600">위 QR코드를 저장하여 시험지에 첨부하세요.</p>
    </div>
  );
};

export default QRCodeDisplay;
