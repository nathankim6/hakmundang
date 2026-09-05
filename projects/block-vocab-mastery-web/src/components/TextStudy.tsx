
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Keyboard } from 'lucide-react';

interface WrongWord {
  wrong: string;
  correct: string;
  startIndex: number;
  endIndex: number;
}

const TextStudy = () => {
  const [text, setText] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [wrongWords, setWrongWords] = useState<WrongWord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempCorrection, setTempCorrection] = useState("");
  const [selectionIndices, setSelectionIndices] = useState({
    start: 0,
    end: 0
  });
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const handleKeyDown = (e: KeyboardEvent) => {
    // Check if Alt+1 was pressed
    if (e.altKey && e.key === "1") {
      e.preventDefault();
      
      // Only open dialog if text is selected
      if (selectedText) {
        setTempCorrection("");
        setIsDialogOpen(true);
      } else {
        toast({
          title: "No text selected",
          description: "Please select some text before using Alt+1 shortcut",
          variant: "destructive",
        });
      }
    }
  };

  // Set up event listener for keyboard shortcuts
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    // Clean up event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      console.log("Removed keydown event listener");
    };
  }, [selectedText]);

  // Handle text selection
  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const start = range.startOffset;
      const end = range.endOffset;
      
      setSelectionIndices({
        start,
        end
      });
      
      setSelectedText(selection.toString().trim());
    }
  };

  // Handle correction submission
  const handleCorrection = () => {
    if (tempCorrection && selectedText) {
      setWrongWords(prev => [...prev, {
        wrong: selectedText,
        correct: tempCorrection,
        startIndex: selectionIndices.start,
        endIndex: selectionIndices.end
      }]);
      
      setIsDialogOpen(false);
      setTempCorrection("");
      
      toast({
        title: "Correction saved",
        description: `Changed "${selectedText}" to "${tempCorrection}"`,
      });
    }
  };

  // Handle Enter key press in input field
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCorrection();
    }
  };

  // Render corrected text - Fixed implementation
  const renderCorrectedText = () => {
    if (!text) return "";
    
    // Create a copy of the original text
    let result = text;
    
    // Sort corrections by their position in the text (from end to beginning)
    // This prevents offset issues when replacing text
    const sortedWords = [...wrongWords].sort((a, b) => b.startIndex - a.startIndex);
    
    // Apply each correction
    sortedWords.forEach(word => {
      // Replace the word at the exact position
      result = 
        result.substring(0, word.startIndex) + 
        word.correct + 
        result.substring(word.endIndex);
    });
    
    return result;
  };

  // Render original text with marked wrong words - Fixed implementation
  const renderOriginalTextWithBrackets = () => {
    if (!text) return "";
    
    // Create a copy of the original text
    let result = text;
    
    // Sort corrections by their position in the text (from end to beginning)
    // This prevents offset issues when replacing text
    const sortedWords = [...wrongWords].sort((a, b) => b.startIndex - a.startIndex);
    
    // Apply each marking
    sortedWords.forEach(word => {
      // Mark the word at the exact position
      result = 
        result.substring(0, word.startIndex) + 
        `[<strong>${word.wrong}</strong>]` + 
        result.substring(word.endIndex);
    });
    
    return result;
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Keyboard shortcuts info button */}
      <div className="flex justify-end mb-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
          className="flex items-center gap-2"
        >
          <Keyboard size={16} />
          Keyboard Shortcuts
        </Button>
      </div>
      
      {/* Shortcuts info panel */}
      {showKeyboardShortcuts && (
        <Card className="p-4 mb-4 bg-muted">
          <h3 className="font-medium mb-2">Available Keyboard Shortcuts</h3>
          <ul className="space-y-2 text-sm">
            <li><kbd className="px-2 py-1 bg-background rounded border">Alt + 1</kbd> - Open correction dialog for selected text</li>
            <li><kbd className="px-2 py-1 bg-background rounded border">Enter</kbd> - Save correction in dialog</li>
          </ul>
        </Card>
      )}

      <Card className="mb-8 p-6">
        <Textarea 
          className="w-full h-48 mb-4 text-lg leading-relaxed" 
          placeholder="Enter your text here..." 
          value={text} 
          onChange={e => setText(e.target.value)} 
        />
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-2">Corrected Text:</h3>
            <div 
              className="text-lg leading-relaxed whitespace-pre-wrap" 
              onMouseUp={handleTextSelect} 
              dangerouslySetInnerHTML={{ __html: renderCorrectedText() }} 
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Original Text with Marked Changes:</h3>
            <div 
              className="text-lg leading-relaxed whitespace-pre-wrap" 
              dangerouslySetInnerHTML={{ __html: renderOriginalTextWithBrackets() }} 
            />
          </div>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Correct Word</DialogTitle>
            <DialogDescription>Enter the correct version of the selected text</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div>
              <p className="text-sm font-medium mb-2">Selected Text:</p>
              <p className="p-2 bg-muted rounded">{selectedText}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Correction:</p>
              <Input 
                value={tempCorrection} 
                onChange={e => setTempCorrection(e.target.value)} 
                onKeyDown={handleKeyPress}
                placeholder="Enter correction" 
                autoFocus
              />
            </div>
            <Button className="w-full" onClick={handleCorrection}>
              Save Correction
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">번호</TableHead>
            <TableHead className="w-1/2">틀린 부분</TableHead>
            <TableHead className="w-1/2">고친 정답</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wrongWords.map((word, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium text-center">{index + 1}</TableCell>
              <TableCell className="font-medium">{word.wrong}</TableCell>
              <TableCell className="text-purple-600 font-medium">{word.correct}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TextStudy;
