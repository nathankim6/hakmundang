import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const SentenceMatcher = () => {
  const [englishText, setEnglishText] = useState('');
  const [koreanText, setKoreanText] = useState('');
  const [matchedSentences, setMatchedSentences] = useState<Array<{english: string, korean: string}>>([]);
  const [info, setInfo] = useState('');

  // 예외 단어 목록 (마침표가 있지만 문장의 끝이 아닌 경우)
  const exceptions = [
    'St.', 'Dr.', 'Mr.', 'Mrs.', 'Ms.',
    'Jan.', 'Feb.', 'Mar.', 'Apr.', 'Aug.', 'Sep.', 'Sept.', 'Oct.', 'Nov.', 'Dec.',
    'Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Thur.', 'Fri.', 'Sat.',
    'cf.', 'ref.', 'prof.', 'etc.', 'e.g.', 'i.e.',
    'A.M.', 'P.M.', 'a.m.', 'p.m.',
    'U.S.', 'U.K.', 'U.N.'
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
      const regex = new RegExp(`\\b${exception.replace('.', '\\.')}\\b`, 'g');
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

    // 마침표, 느낌표, 물음표로 문장 구분
    const sentences = processed
      .split(/([.!?]+["']?\s*)/)
      .filter(Boolean)
      .map(part => part.trim())
      .reduce((acc: string[], part, i, arr) => {
        // 마지막 부분이거나 다음 부분이 대문자로 시작하는 경우에만 새로운 문장으로 처리
        if (i % 2 === 0) {
          const nextPart = arr[i + 1];
          if (nextPart) {
            acc.push(part + nextPart);
          } else {
            acc.push(part);
          }
        }
        return acc;
      }, [])
      .map(sentence => sentence.replace(/@POINT@/g, '.').trim())
      .filter(sentence => sentence.length > 0);

    return sentences;
  };

  // 영어/한글 텍스트 검증
  const validateText = (text: string, isEnglish: boolean) => {
    // 영어 텍스트 검증 (영어, 숫자, 특수문자만 허용)
    const englishRegex = /^[A-Za-z0-9\s.,!?'"()\-:;@#$%&*]+$/;
    // 한글 텍스트 검증 (한글, 숫자, 특수문자만 허용)
    const koreanRegex = /^[가-힣0-9\s.,!?'"()\-:;@#$%&*]+$/;

    return isEnglish ? englishRegex.test(text) : koreanRegex.test(text);
  };

  // 문장 매칭 처리 개선
  const matchSentences = (engSentences: string[], korSentences: string[]) => {
    const maxLength = Math.max(engSentences.length, korSentences.length);
    const minLength = Math.min(engSentences.length, korSentences.length);
    
    // 영어와 한글 문장 수를 일치시키기 위한 처리
    const normalizedEng = [...engSentences];
    const normalizedKor = [...korSentences];

    if (engSentences.length > korSentences.length) {
      // 영어 문장이 더 많은 경우, 마지막 한글 문장에 나머지 영어 문장들을 합침
      const remainingEng = normalizedEng.splice(minLength).join(' ');
      if (normalizedKor[minLength - 1]) {
        normalizedKor[minLength - 1] += ' ' + remainingEng;
      }
    } else if (korSentences.length > engSentences.length) {
      // 한글 문장이 더 많은 경우, 마지막 영어 문장에 나머지 한글 문장들을 합침
      const remainingKor = normalizedKor.splice(minLength).join(' ');
      if (normalizedEng[minLength - 1]) {
        normalizedEng[minLength - 1] += ' ' + remainingKor;
      }
    }

    // 1:1 매칭 생성 전 텍스트 검증
    const validatedPairs = normalizedEng.map((eng, index) => {
      const kor = normalizedKor[index] || '';
      
      // 영어와 한글 텍스트 검증
      const isValidEng = validateText(eng, true);
      const isValidKor = validateText(kor, false);

      return {
        english: isValidEng ? eng : '',
        korean: isValidKor ? kor : ''
      };
    });

    return validatedPairs.filter(pair => pair.english && pair.korean);
  };

  // 매칭 실행
  const handleMatch = () => {
    const englishSentences = splitIntoSentences(englishText);
    const koreanSentences = splitIntoSentences(koreanText);

    const matched = matchSentences(englishSentences, koreanSentences);
    setMatchedSentences(matched);

    // 정보 메시지 설정
    setInfo(`총 ${matched.length}개의 문장이 매칭되었습니다.`);
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
              문장 나누기
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
                    <th className="border p-2 bg-gray-100 w-[60px]">번호</th>
                    <th className="border p-2 bg-gray-100 w-1/2">English</th>
                    <th className="border p-2 bg-gray-100 w-1/2">한글</th>
                  </tr>
                </thead>
                <tbody>
                  {matchedSentences.map((pair, index) => (
                    <tr key={index}>
                      <td className="border p-2 text-center">{index + 1}</td>
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