
import React from 'react';
import { Check, Sparkles, Lock, ExternalLink } from "lucide-react";
import { QuestionType } from "@/types/question";

interface TypeButtonProps {
  type: QuestionType;
  isSelected: boolean;
  hasAccess: boolean;
  onClick: () => void;
  logos: string[];
}

export const TypeButton = ({ type, isSelected, hasAccess, onClick, logos }: TypeButtonProps) => {
  const handleClick = () => {
    onClick();
  };

  const isExternalLink = false;

  return (
    <button
      key={type.id}
      onClick={handleClick}
      disabled={!hasAccess}
      className={`
        relative group flex items-center w-full px-4 py-3 rounded-xl text-left
        transition-all duration-300 ease-out transform
        ${isSelected 
          ? `
            bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50
            border border-indigo-200/60 shadow-lg shadow-indigo-500/10
            scale-[1.02] translate-x-1
            before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 
            before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-purple-500 
            before:rounded-l-xl before:shadow-lg before:shadow-indigo-500/30
          ` 
          : `
            bg-white/70 backdrop-blur-sm border border-gray-200/50
            hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30
            hover:border-indigo-300/40 hover:shadow-md hover:shadow-indigo-500/5
            hover:scale-[1.01] hover:translate-x-0.5
          `
        } 
        ${!hasAccess 
          ? 'opacity-50 cursor-not-allowed grayscale' 
          : 'cursor-pointer hover:shadow-lg'
        }
        ${isExternalLink ? 'border-l-4 border-l-slate-400/50' : ''}
      `}
    >
      {/* Subtle background gradient overlay */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${isSelected 
          ? 'bg-gradient-to-r from-indigo-500/5 to-purple-500/5' 
          : 'bg-gradient-to-r from-blue-500/3 to-indigo-500/3'
        }
      `} />
      
      {/* Sparkle animation for external links */}
      {isExternalLink && (
        <div className="absolute -top-1 -right-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="w-3 h-3 text-slate-500 animate-pulse" />
        </div>
      )}

      <div className="relative flex items-center gap-3 flex-1 z-10">
        {logos.length > 0 && (
          <div className="flex -space-x-1.5 mr-1">
            {logos.map((logo, index) => (
              <div 
                key={index}
                className="relative group/logo"
              >
                <img 
                  src={logo} 
                  alt={`School logo ${index + 1}`} 
                  className="w-5 h-5 object-contain rounded-full bg-white border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-200"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-200" />
              </div>
            ))}
          </div>
        )}
        
        <div className={`
          flex-1 font-medium transition-all duration-200
          ${isSelected 
            ? 'text-indigo-800 text-sm' 
            : 'text-gray-700 text-sm group-hover:text-indigo-700'
          }
        `}>
          {type.name}
        </div>
      </div>
      
      {/* Status icons with enhanced styling */}
      <div className="relative z-10 ml-2">
        {!hasAccess && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
          </div>
        )}
        
        {hasAccess && isSelected && !isExternalLink && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/25">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        
        {hasAccess && !isSelected && !isExternalLink && (
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-indigo-300 transition-colors duration-200" />
        )}
        
        {isExternalLink && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg shadow-slate-500/20 group-hover:shadow-slate-500/30 transition-shadow duration-200">
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>
    </button>
  );
};
