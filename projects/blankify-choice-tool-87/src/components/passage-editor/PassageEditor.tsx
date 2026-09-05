
import React from 'react';
import { Undo2 } from 'lucide-react';
import { usePassageEditor } from './usePassageEditor';
import AnswerList from './AnswerList';
import SelectionToolbar from './SelectionToolbar';
import PassageStats from './PassageStats';
import PassageHeader from './PassageHeader';
import { PassageEditorProps } from './types';

const PassageEditor: React.FC<PassageEditorProps> = ({ 
  index, 
  passage, 
  onPassageChange, 
  onKeyDown, 
  onDelete 
}) => {
  const {
    textAreaRef,
    selectedText,
    answers,
    choiceAnswers,
    orderAnswers,
    history,
    handleTextSelect,
    handleBlankSelection,
    handleChoiceSelection,
    handleOrderSelection,
    handleUndo,
    handleKeyboardShortcut,
    resetPassage
  } = usePassageEditor(index, passage, onPassageChange);

  return (
    <div className="flex flex-col gap-3 p-6 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <PassageHeader 
        index={index} 
        onReset={resetPassage} 
        onDelete={onDelete} 
      />
      
      <textarea
        ref={textAreaRef}
        value={passage.content}
        onChange={(e) => {
          onPassageChange(index, e.target.value);
        }}
        onMouseUp={handleTextSelect}
        onKeyUp={handleTextSelect}
        onKeyDown={(e) => {
          handleKeyboardShortcut(e);
          onKeyDown(e);
        }}
        className="w-full min-h-[60px] p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-sans text-base resize-none overflow-hidden"
        placeholder="여기에 영어 지문을 입력하세요. 단어나 구문을 드래그하여 선택한 후 Ctrl+1을 눌러 빈칸으로, Ctrl+2를 눌러 선택문제로, Ctrl+3을 눌러 어순배열 문제로 변환하세요."
      />
      
      <AnswerList 
        answers={answers} 
        choiceAnswers={choiceAnswers} 
        orderAnswers={orderAnswers} 
      />
      
      <SelectionToolbar 
        selectedText={selectedText} 
        onBlankSelection={handleBlankSelection}
        onChoiceSelection={handleChoiceSelection}
        onOrderSelection={handleOrderSelection}
      />
      
      <div className="flex flex-wrap justify-between items-center mt-1 gap-2">
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white py-1.5 px-3 rounded-md text-sm hover:from-slate-700 hover:to-slate-800 transition-all shadow-sm hover:shadow"
            >
              <Undo2 className="h-4 w-4" />
              <span>실행 취소 (Ctrl+Z)</span>
            </button>
          )}
        </div>
      </div>
      
      <PassageStats 
        answers={answers} 
        choiceAnswers={choiceAnswers} 
        orderAnswers={orderAnswers} 
      />
    </div>
  );
};

export default PassageEditor;
