import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const SentenceMatcher = () => {
  const [englishText, setEnglishText] = useState('');
  const [koreanText, setKoreanText] = useState('');
  const [matchedSentences, setMatchedSentences] = useState<Array<{english: string, korean: string}>>([]);
  const [info, setInfo] = useState('');

  // 예외 단어 목록
  const exceptions = [
    'St.', 'Dr.', 'A.M.', 'P.M.', 'Mr.', 'Mrs.',
    'Jan.', 'Feb.', 'Mar.', 'Apr.', 'Aug.', 'Sep.', 'Sept.', 'Oct.', 'Nov.', 'Dec.',
    'Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thur.', 'Fri.', 'Sat.',
    'cf.', 'ref.', 'prof.'
  ];

  // 제거할 특수 기호 목록
  const specialMarkers = [
    '①', '②', '③', '④', '⑤',
    '❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽',
    '(A)', '(B)', '(C)',
    '(①)', '(②)', '(③)', '(④)', '(⑤)',
    '[3점]'
  ];

  // 텍스트 전처리 함수
  const preprocessText = (text: string) => {
    let processed = text;

    // 예외 단어들의 마침표를 임시 표시로 변경
    exceptions.forEach(exception => {
      const regex = new RegExp(exception.replace('.', '\\.'), 'g');
      processed = processed.replace(regex, exception.replace('.', '@POINT@'));
    });

    // 특수 마커 제거
    specialMarkers.forEach(marker => {
      processed = processed.replace(marker, '');
    });

    return processed;
  };

  // 문장 분리 함수 개선
  const splitIntoSentences = (text: string) => {
    // 텍스트 전처리
    let processed = preprocessText(text);

    // 마침표, 느낌표, 물음표로만 문장 구분 (콜론은 제외)
    const sentences = processed
      .replace(/([.!?]["]?)\s+/g, "$1|")  // 문장 구분자 뒤에 공백이 있는 경우
      .replace(/([.!?]["]?)$/g, "$1|")    // 문장 구분자로 텍스트가 끝나는 경우
      .split("|")
      .map(sentence => sentence.replace(/@POINT@/g, '.').trim())
      .filter(sentence => sentence.length > 0);

    return sentences;
  };

  // 문장 매칭 처리
  const matchSentences = (engSentences: string[], korSentences: string[]) => {
    // 두 배열의 길이를 같게 만듦
    const maxLength = Math.max(engSentences.length, korSentences.length);
    const normalizedEng = [...engSentences];
    const normalizedKor = [...korSentences];

    // 부족한 부분을 빈 문자열로 채움
    while (normalizedEng.length < maxLength) normalizedEng.push('');
    while (normalizedKor.length < maxLength) normalizedKor.push('');

    // 1:1 매칭
    return normalizedEng.map((eng, index) => ({
      english: eng,
      korean: normalizedKor[index]
    }));
  };

  // 매칭 실행
  const handleMatch = () => {
    const englishSentences = splitIntoSentences(englishText);
    const koreanSentences = splitIntoSentences(koreanText);

    const matched = matchSentences(englishSentences, koreanSentences);
    setMatchedSentences(matched.filter(pair => pair.english || pair.korean));

    // 정보 메시지 설정
    const message = englishSentences.length !== koreanSentences.length
      ? `영어 ${englishSentences.length}문장과 한글 ${koreanSentences.length}문장이 1:1로 매칭되었습니다.`
      : `총 ${englishSentences.length}개의 문장이 매칭되었습니다.`;
    setInfo(message);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-4">
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">영어 텍스트</label>
              <textarea
                className="w-full h-32 p-2 border rounded"
                value={englishText}
                onChange={(e) => setEnglishText(e.target.value)}
                placeholder="영어 텍스트를 입력하세요..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">한글 텍스트</label>
              <textarea
                className="w-full h-32 p-2 border rounded"
                value={koreanText}
                onChange={(e) => setKoreanText(e.target.value)}
                placeholder="한글 텍스트를 입력하세요..."
              />
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleMatch}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              문장 매칭하기
            </button>
          </div>

          {info && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          )}

          {matchedSentences.length > 0 && (
            <div className="mt-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100 w-1/2">English</th>
                    <th className="border p-2 bg-gray-100 w-1/2">한글</th>
                  </tr>
                </thead>
                <tbody>
                  {matchedSentences.map((pair, index) => (
                    <tr key={index}>
                      <td className="border p-2 align-top">{pair.english}</td>
                      <td className="border p-2 align-top">{pair.korean}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};