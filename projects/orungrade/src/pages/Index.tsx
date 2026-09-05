import React from "react";
import IQCalculator from "@/components/IQCalculator";
import InfoCard from "@/components/InfoCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
const Index = () => {
  const isMobile = useIsMobile();
  return <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto py-8">
        <header className="text-center mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <img src="/lovable-uploads/52c7ff01-7eb2-4fd8-b795-b8bed65bec99.png" alt="오런 아카데미 로고" className="h-10 md:h-12" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">옳은영어 내신등급 계산기</h1>
          </div>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            원점수, 과목평균, 표준편차, 수강 학생수를 입력하여 등수와 백분위 순위를 확인하세요
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className={`${isMobile ? "order-2" : ""} md:w-1/4 flex flex-col items-center h-full`}>
            <Card className="w-full h-full max-w-full overflow-hidden rounded-2xl shadow-sm border-0 transition-all duration-200 hover:shadow-md">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="w-full flex justify-center flex-grow bg-blue-50 py-4 my-0">
                  <img alt="캐릭터 이미지" className="w-1/2 h-auto" src="/lovable-uploads/b5990e44-be1d-43d7-9877-104bfe9468d4.png" />
                </div>
                <div className="bg-blue-900 text-white py-4 text-center">
                  <span className="font-medium text-sm">옳은영어 AI조교 소피아가 내신등급을 예상해드립니다.</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className={`${isMobile ? "order-1" : ""} md:w-3/4`}>
            <div className="bg-blue-50 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-blue-100 w-full">
              <IQCalculator />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InfoCard title="표준편차란?" variant="highlight" className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
            <p className="text-xs sm:text-sm text-gray-700 mb-2">
              표준편차(σ)는 데이터가 평균에서 얼마나 퍼져 있는지를 나타내는 값입니다. 점수가 정규분포를 따를 때 다음과 같은 특성을 가집니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700">
              <li>평균 ± 1σ = 전체 데이터의 68.2%가 이 범위에 속함</li>
              <li>평균 ± 2σ = 전체 데이터의 95.4%가 이 범위에 속함</li>
              <li>평균 ± 3σ = 전체 데이터의 99.7%가 이 범위에 속함</li>
            </ul>
          </InfoCard>

          <InfoCard title="5등급 체제란?" className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
            <p className="text-xs sm:text-sm text-gray-700 mb-2">5등급 체제는 성적을 5개의 등급으로 나누는 방식입니다. 각 등급별 인원 비율은 다음과 같습니다.</p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700">
              <li>1등급: 상위 10%에 해당 (상위 0-10%)</li>
              <li>2등급: 상위 34%에 해당 (상위 10-34%)</li>
              <li>3등급: 상위 66%에 해당 (상위 34-66%)</li>
              <li>4등급: 상위 90%에 해당 (상위 66-90%)</li>
              <li>5등급: 하위 10%에 해당 (상위 90-100%)</li>
            </ul>
          </InfoCard>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all duration-200 mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">표준점수 구분</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[600px] px-4 sm:px-0 sm:min-w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="py-2 px-3 text-left border-b border-gray-100 font-medium text-gray-500 text-xs sm:text-sm">점수 범위</th>
                    <th className="py-2 px-3 text-left border-b border-gray-100 font-medium text-gray-500 text-xs sm:text-sm">표준편차(SD)</th>
                    <th className="py-2 px-3 text-left border-b border-gray-100 font-medium text-gray-500 text-xs sm:text-sm">백분위 범위</th>
                    <th className="py-2 px-3 text-left border-b border-gray-100 font-medium text-gray-500 text-xs sm:text-sm">수준 구분</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">평균 + 3σ 이상</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">+3σ 이상</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">99.7% 이상</td>
                    <td className="py-2 px-3 border-b border-gray-100 font-medium text-blue-600 text-xs sm:text-sm">매우 뛰어남</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">평균 + 2σ</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">+2σ</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">97.7% - 99.7%</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">상위 2%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">평균 + 1σ</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">+1σ ~ +2σ</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">84.1% - 97.7%</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">상위 16%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">평균 ± 1σ</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">-1σ ~ +1σ</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">15.9% - 84.1%</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">평균 수준</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">평균 - 1σ</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">-2σ ~ -1σ</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">2.3% - 15.9%</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">하위 16%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">평균 - 2σ</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">-3σ ~ -2σ</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">0.3% - 2.3%</td>
                    <td className="py-2 px-3 border-b border-gray-100 text-xs sm:text-sm">하위 2%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-2 px-3 text-xs sm:text-sm">평균 - 3σ 미만</td>
                    <td className="py-2 px-3 text-xs sm:text-sm">-3σ 미만</td>
                    <td className="py-2 px-3 text-xs sm:text-sm">0.3% 미만</td>
                    <td className="py-2 px-3 text-xs sm:text-sm">하위 0.3%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <footer className="text-center text-gray-400 text-xs py-4 border-t border-gray-100">
          © {new Date().getFullYear()} 옳은영어 | 등수 자동계산기 | 개인정보는 수집되지 않습니다
        </footer>
      </div>
    </div>;
};
export default Index;