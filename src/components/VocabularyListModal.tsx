import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Book, Download, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

interface VocabularyEntry {
  word: string;
  meaning: string;
  partOfSpeech?: string;
  definition?: string;
  difficulty?: number;
  synonyms: Array<{word: string; meaning: string}>;
  antonyms: Array<{word: string; meaning: string}>;
}

interface VocabularyListModalProps {
  content: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
});

export const VocabularyListModal = ({ content }: VocabularyListModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const parseContent = (text: string): VocabularyEntry[] => {
    const entries: VocabularyEntry[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.includes('|')) {
        const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);
        if (cells.length >= 2 && !line.includes('표제어')) {
          const entry: VocabularyEntry = {
            word: cells[0],
            meaning: cells[1],
            partOfSpeech: cells[2] || 'n/a',
            definition: cells[3] || '',
            difficulty: Math.floor(Math.random() * 3) + 1, // Temporary random difficulty
            synonyms: [],
            antonyms: []
          };

          // Process synonyms and antonyms
          if (cells[4] && cells[5]) {
            entry.synonyms.push({
              word: cells[4],
              meaning: cells[5]
            });
          }

          if (cells[6] && cells[7]) {
            entry.antonyms.push({
              word: cells[6],
              meaning: cells[7]
            });
          }

          entries.push(entry);
        }
      }
    });
    
    return entries;
  };

  const vocabularyList = parseContent(content);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    const VocabularyPDF = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Vocabulary List</Text>
          <View style={styles.table}>
            {vocabularyList.map((entry, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '20%' }]}>
                  <Text>{entry.word}</Text>
                  <Text>{'⭐'.repeat(entry.difficulty || 1)}</Text>
                </View>
                <View style={[styles.tableCell, { width: '20%' }]}>
                  <Text>{entry.meaning}</Text>
                  <Text>{entry.partOfSpeech}</Text>
                </View>
                <View style={[styles.tableCell, { width: '30%' }]}>
                  <Text>Synonyms:</Text>
                  {entry.synonyms.map((syn, i) => (
                    <Text key={i}>{syn.word} - {syn.meaning}</Text>
                  ))}
                </View>
                <View style={[styles.tableCell, { width: '30%' }]}>
                  <Text>Antonyms:</Text>
                  {entry.antonyms.map((ant, i) => (
                    <Text key={i}>{ant.word} - {ant.meaning}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );

    try {
      const blob = await pdf(<VocabularyPDF />).toBlob();
      saveAs(blob, 'vocabulary_list.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] text-white hover:from-[#8E9196] hover:to-[#D6BCFA] transition-all duration-300"
        >
          <Book className="w-4 h-4" />
          단어장 보기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] bg-clip-text text-transparent">
            Vocabulary List
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end mb-4">
          <Button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="gap-2"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            PDF 다운로드
          </Button>
        </div>

        <div className="rounded-lg border border-[#D6BCFA]/30 overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-[#F1F0FB] to-[#E5DEFF] sticky top-0 z-10">
              <TableRow>
                <TableHead className="font-bold text-[#222222] w-[20%]">표제어</TableHead>
                <TableHead className="font-bold text-[#222222] w-[20%]">의미 / 품사</TableHead>
                <TableHead className="font-bold text-[#222222] w-[30%]">동의어</TableHead>
                <TableHead className="font-bold text-[#222222] w-[30%]">반의어</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vocabularyList.map((entry, index) => (
                <TableRow 
                  key={index}
                  className={index % 2 === 0 ? 'bg-white hover:bg-[#F8F7FF] transition-colors' : 'bg-[#F8F7FF] hover:bg-[#F1F0FB] transition-colors'}
                >
                  <TableCell className="font-medium border-r border-[#D6BCFA]/10">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-[#7E69AB]">{entry.word}</span>
                      <span className="text-yellow-500">{'⭐'.repeat(entry.difficulty || 1)}</span>
                      <span className="text-sm text-gray-600">{entry.meaning}</span>
                      <span className="text-xs text-gray-500 italic">{entry.partOfSpeech}</span>
                    </div>
                  </TableCell>
                  <TableCell className="border-r border-[#D6BCFA]/10">
                    <div className="text-sm">{entry.definition}</div>
                  </TableCell>
                  <TableCell className="border-r border-[#D6BCFA]/10">
                    <div className="space-y-2">
                      {entry.synonyms.map((syn, i) => (
                        <div key={i} className="text-[#7E69AB]">
                          <span className="font-medium">{syn.word}</span>
                          <span className="text-sm text-gray-600 ml-2">- {syn.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {entry.antonyms.map((ant, i) => (
                        <div key={i} className="text-[#9b87f5]">
                          <span className="font-medium">{ant.word}</span>
                          <span className="text-sm text-gray-600 ml-2">- {ant.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};