
import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollText, Camera, X, MessageSquare } from "lucide-react";
import { TeacherPhotoUploader } from "@/components/TeacherPhotoUploader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface HitQuestionPhotosProps {
  photos?: Array<{
    url: string;
    problemNumber?: number;
    problemName?: string;
    comment?: string;
    selectedArea?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  themeColors: any;
  onPhotoUpload?: (photoUrl: string) => void;
  onPhotoDelete?: (photoIndex: number) => void;
  onPhotoCommentChange?: (photoIndex: number, comment: string) => void;
  editable?: boolean;
}

const HitQuestionPhotos: React.FC<HitQuestionPhotosProps> = ({
  photos,
  themeColors,
  onPhotoUpload,
  onPhotoDelete,
  onPhotoCommentChange,
  editable = false
}) => {
  if (!photos || (photos.length === 0 && !editable)) return null;

  return (
    <Card className="p-6 my-4 shadow-lg border-0 relative overflow-hidden transform transition-all duration-300 hover:translate-y-[-3px]" style={{
      backgroundImage: `linear-gradient(135deg, white, ${themeColors.pastel})`,
      boxShadow: `0 10px 30px -5px ${themeColors.primary}40`
    }}>
      <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r" style={{
        backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.accent2})`,
        boxShadow: `0 1px 8px ${themeColors.primary}80`
      }}></div>

      <div className="absolute top-6 right-4 w-40 h-40 rounded-full opacity-20" style={{
        background: `radial-gradient(circle at center, ${themeColors.primary} 30%, transparent 70%)`
      }}></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center">
          <div className="p-3 rounded-xl mr-3 shadow-md transform transition-transform duration-300 group-hover:scale-110" style={{
            background: `linear-gradient(135deg, ${themeColors.primary} 20%, ${themeColors.vibrant} 80%)`,
            boxShadow: `0 4px 15px ${themeColors.primary}70`
          }}>
            <ScrollText className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent font-noto" style={{
            backgroundImage: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.accent2})`,
            textShadow: `0 1px 3px rgba(0,0,0,0.1)`
          }}>대표 적중문항</h3>
        </div>

        {editable && onPhotoUpload && (
          <div>
            <TeacherPhotoUploader
              onPhotoUpload={onPhotoUpload}
              buttonText="적중문항 사진 추가"
              maxUploads={10}
              bucketName="report-photos"
            />
          </div>
        )}
      </div>

      <div className="space-y-6 mt-6">
        {photos && photos.map((photo, index) => (
          <div key={index} className="space-y-2">
            <div className="relative group overflow-hidden rounded-xl shadow-md border-2" style={{
              borderColor: `${themeColors.light}`,
              boxShadow: `0 4px 20px ${themeColors.light}60`
            }}>
              {editable && onPhotoDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-20 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                  onClick={() => onPhotoDelete(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div className="aspect-[21/9] relative overflow-hidden">
                <img src={photo.url} alt={`적중문항 ${photo.problemNumber || index + 1}`} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />

                {photo.problemNumber && <div
                  className="absolute top-2 left-2 px-3 py-1.5 rounded-lg shadow-md z-10 text-sm font-medium font-noto"
                  style={{
                    backgroundColor: `${themeColors.primary}`,
                    color: 'white',
                    boxShadow: `0 2px 8px ${themeColors.primary}50`
                  }}
                >
                  {photo.problemNumber}번 문항
                  {photo.problemName && <span className="ml-1 opacity-90">- {photo.problemName}</span>}
                </div>}

                {photo.selectedArea && <div
                  className="absolute border-2 pointer-events-none"
                  style={{
                    left: `${photo.selectedArea.x}px`,
                    top: `${photo.selectedArea.y}px`,
                    width: `${photo.selectedArea.width}px`,
                    height: `${photo.selectedArea.height}px`,
                    borderColor: themeColors.vibrant,
                    backgroundColor: `${themeColors.vibrant}30`
                  }}
                />}
              </div>
            </div>

            {/* Comment area: editable Textarea, view-only display */}
            {editable && onPhotoCommentChange ? (
              <div className="relative">
                <div className="flex items-center mb-1 text-xs font-medium" style={{ color: themeColors.primary }}>
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  코멘트
                </div>
                <Textarea
                  value={photo.comment || ''}
                  onChange={(e) => onPhotoCommentChange(index, e.target.value)}
                  placeholder="이 적중문항에 대한 코멘트를 입력하세요 (선택사항)"
                  maxLength={500}
                  className="resize-none bg-white/80 border-2 focus:ring-2"
                  style={{ borderColor: `${themeColors.light}` }}
                  rows={2}
                />
              </div>
            ) : photo.comment ? (
              <div
                className="rounded-lg px-4 py-3 text-sm leading-relaxed font-noto border-l-4"
                style={{
                  backgroundColor: `${themeColors.pastel}80`,
                  borderColor: themeColors.primary,
                  color: '#374151'
                }}
              >
                <div className="flex items-start">
                  <MessageSquare
                    className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: themeColors.primary }}
                  />
                  <p className="whitespace-pre-wrap">{photo.comment}</p>
                </div>
              </div>
            ) : null}
          </div>
        ))}

        {editable && (!photos || photos.length === 0) && (
          <div
            className="flex items-center justify-center p-10 border-2 border-dashed rounded-xl text-gray-500"
            style={{
              borderColor: themeColors.light,
              backgroundColor: `${themeColors.pastel}50`
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: `${themeColors.light}50` }}
              >
                <Camera
                  className="h-8 w-8"
                  style={{ color: themeColors.primary }}
                />
              </div>
              <p
                className="font-noto"
                style={{ color: themeColors.primary }}
              >
                적중문항 사진을 추가해주세요
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 text-center">
        <p className="text-sm italic font-noto" style={{ color: `${themeColors.primary}99` }}>
          ※저작권 문제로 인해 학교 시험 원문은 포함되지 않습니다.
        </p>
      </div>
    </Card>
  );
};

export default HitQuestionPhotos;
