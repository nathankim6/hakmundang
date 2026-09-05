import React, { useState } from 'react';
import { Course, GradeType, gradeLabels } from '@/types/course';
import { useCourses } from '@/contexts/CourseContext';
import CourseCard from './CourseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const CourseList: React.FC = () => {
  const { courses } = useCourses();
  const [selectedGrade, setSelectedGrade] = useState<'all' | GradeType>('all');

  // 현재 시간
  const now = new Date();

  // 진행중인 강의와 마감된 강의 분류
  const activeCourses = courses.filter(course => {
    const isFullyBooked = course.enrolled >= course.capacity;
    const isApplicationClosed = course.applicationEndDate ? new Date(course.applicationEndDate) < now : false;
    return !isFullyBooked && !isApplicationClosed;
  });

  const closedCourses = courses.filter(course => {
    const isFullyBooked = course.enrolled >= course.capacity;
    const isApplicationClosed = course.applicationEndDate ? new Date(course.applicationEndDate) < now : false;
    return isFullyBooked || isApplicationClosed;
  });

  const filteredActiveCourses = selectedGrade === 'all' 
    ? activeCourses 
    : activeCourses.filter(course => course.grade === selectedGrade);

  const filteredClosedCourses = selectedGrade === 'all' 
    ? closedCourses 
    : closedCourses.filter(course => course.grade === selectedGrade);

  const coursesByGrade = {
    elementary: activeCourses.filter(course => course.grade === 'elementary'),
    middle: activeCourses.filter(course => course.grade === 'middle'),
    high: activeCourses.filter(course => course.grade === 'high')
  };

  return (
    <div className="space-y-8">

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-12 md:mb-16 relative z-50">
          <TabsTrigger value="all" className="flex items-center justify-center space-x-1 md:space-x-2 text-sm md:text-base p-2 md:p-3 relative z-50">
            <span>전체</span>
            <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">
              {courses.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="elementary" className="flex items-center justify-center space-x-1 md:space-x-2 text-sm md:text-base p-2 md:p-3 relative z-50">
            <span className="hidden sm:inline">{gradeLabels.elementary}</span>
            <span className="sm:hidden">초등</span>
            <Badge variant="secondary" className="ml-1 md:ml-2 bg-education-elementary/10 text-education-elementary text-xs">
              {coursesByGrade.elementary.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="middle" className="flex items-center justify-center space-x-1 md:space-x-2 text-sm md:text-base p-2 md:p-3 relative z-50">
            <span className="hidden sm:inline">{gradeLabels.middle}</span>
            <span className="sm:hidden">중등</span>
            <Badge variant="secondary" className="ml-1 md:ml-2 bg-education-middle/10 text-education-middle text-xs">
              {coursesByGrade.middle.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="high" className="flex items-center justify-center space-x-1 md:space-x-2 text-sm md:text-base p-2 md:p-3 relative z-50">
            <span className="hidden sm:inline">{gradeLabels.high}</span>
            <span className="sm:hidden">고등</span>
            <Badge variant="secondary" className="ml-1 md:ml-2 bg-education-high/10 text-education-high text-xs">
              {coursesByGrade.high.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {filteredActiveCourses.length === 0 && filteredClosedCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">등록된 강의가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 신청 가능한 강의 섹션 */}
              {filteredActiveCourses.length > 0 && (
                <Card className="border-2 border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">신청 가능한 강의</h3>
                        <p className="text-sm text-green-600 dark:text-green-400">지금 바로 수강 신청할 수 있는 강의들입니다</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        {filteredActiveCourses.length}개
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 모바일: 캐러셀 */}
                    <div className="md:hidden">
                      <Carousel className="w-full">
                        <CarouselContent className="-ml-1">
                          {filteredActiveCourses.map(course => (
                            <CarouselItem key={course.id} className="pl-1 basis-1/2">
                              <CourseCard course={course} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1" />
                        <CarouselNext className="right-1" />
                      </Carousel>
                    </div>
                    {/* 데스크탑: 그리드 */}
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {filteredActiveCourses.map(course => (
                        <div key={course.id} className="animate-fade-in">
                          <CourseCard course={course} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* 마감된 강의 섹션 */}
              {filteredClosedCourses.length > 0 && (
                <Card className="border-2 border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-900/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">마감된 강의</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">신청 기간이 종료되었거나 정원이 마감된 강의들입니다</p>
                      </div>
                      <Badge variant="outline" className="ml-auto border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                        {filteredClosedCourses.length}개
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 모바일: 캐러셀 */}
                    <div className="md:hidden opacity-75">
                      <Carousel className="w-full">
                        <CarouselContent className="-ml-1">
                          {filteredClosedCourses.map(course => (
                            <CarouselItem key={course.id} className="pl-1 basis-1/2">
                              <CourseCard course={course} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1" />
                        <CarouselNext className="right-1" />
                      </Carousel>
                    </div>
                    {/* 데스크탑: 그리드 */}
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 opacity-75">
                      {filteredClosedCourses.map(course => (
                        <div key={course.id} className="animate-fade-in">
                          <CourseCard course={course} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="elementary" className="space-y-6">
          {coursesByGrade.elementary.length === 0 && closedCourses.filter(c => c.grade === 'elementary').length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">초등부 강의가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {coursesByGrade.elementary.length > 0 && (
                <Card className="border-2 border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">신청 가능한 초등부 강의</h3>
                        <p className="text-sm text-green-600 dark:text-green-400">초등학생을 위한 수강 신청 가능한 강의들입니다</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        {coursesByGrade.elementary.length}개
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 모바일: 캐러셀 */}
                    <div className="md:hidden">
                      <Carousel className="w-full">
                        <CarouselContent className="-ml-1">
                          {coursesByGrade.elementary.map(course => (
                            <CarouselItem key={course.id} className="pl-1 basis-1/2">
                              <CourseCard course={course} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1" />
                        <CarouselNext className="right-1" />
                      </Carousel>
                    </div>
                    {/* 데스크탑: 그리드 */}
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {coursesByGrade.elementary.map(course => (
                        <div key={course.id} className="animate-fade-in">
                          <CourseCard course={course} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {closedCourses.filter(c => c.grade === 'elementary').length > 0 && (
                <Card className="border-2 border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-900/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">마감된 초등부 강의</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">신청이 마감된 초등부 강의들입니다</p>
                      </div>
                      <Badge variant="outline" className="ml-auto border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                        {closedCourses.filter(c => c.grade === 'elementary').length}개
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 모바일: 캐러셀 */}
                    <div className="md:hidden opacity-75">
                      <Carousel className="w-full">
                        <CarouselContent className="-ml-1">
                          {closedCourses.filter(c => c.grade === 'elementary').map(course => (
                            <CarouselItem key={course.id} className="pl-1 basis-1/2">
                              <CourseCard course={course} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1" />
                        <CarouselNext className="right-1" />
                      </Carousel>
                    </div>
                    {/* 데스크탑: 그리드 */}
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 opacity-75">
                      {closedCourses.filter(c => c.grade === 'elementary').map(course => (
                        <div key={course.id} className="animate-fade-in">
                          <CourseCard course={course} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="middle" className="space-y-6">
          {coursesByGrade.middle.length === 0 && closedCourses.filter(c => c.grade === 'middle').length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">중등부 강의가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {coursesByGrade.middle.length > 0 && (
                <Card className="border-2 border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">신청 가능한 중등부 강의</h3>
                        <p className="text-sm text-green-600 dark:text-green-400">중학생을 위한 수강 신청 가능한 강의들입니다</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        {coursesByGrade.middle.length}개
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 모바일: 캐러셀 */}
                    <div className="md:hidden">
                      <Carousel className="w-full">
                        <CarouselContent className="-ml-1">
                          {coursesByGrade.middle.map(course => (
                            <CarouselItem key={course.id} className="pl-1 basis-1/2">
                              <CourseCard course={course} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1" />
                        <CarouselNext className="right-1" />
                      </Carousel>
                    </div>
                    {/* 데스크탑: 그리드 */}
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {coursesByGrade.middle.map(course => (
                        <div key={course.id} className="animate-fade-in">
                          <CourseCard course={course} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {closedCourses.filter(c => c.grade === 'middle').length > 0 && (
                <Card className="border-2 border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-900/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">마감된 중등부 강의</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">신청이 마감된 중등부 강의들입니다</p>
                      </div>
                      <Badge variant="outline" className="ml-auto border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                        {closedCourses.filter(c => c.grade === 'middle').length}개
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 모바일: 캐러셀 */}
                    <div className="md:hidden opacity-75">
                      <Carousel className="w-full">
                        <CarouselContent className="-ml-1">
                          {closedCourses.filter(c => c.grade === 'middle').map(course => (
                            <CarouselItem key={course.id} className="pl-1 basis-1/2">
                              <CourseCard course={course} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1" />
                        <CarouselNext className="right-1" />
                      </Carousel>
                    </div>
                    {/* 데스크탑: 그리드 */}
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 opacity-75">
                      {closedCourses.filter(c => c.grade === 'middle').map(course => (
                        <div key={course.id} className="animate-fade-in">
                          <CourseCard course={course} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="high" className="space-y-6">
          {coursesByGrade.high.length === 0 && closedCourses.filter(c => c.grade === 'high').length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">고등부 강의가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {coursesByGrade.high.length > 0 && (
                <Card className="border-2 border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">신청 가능한 고등부 강의</h3>
                        <p className="text-sm text-green-600 dark:text-green-400">고등학생을 위한 수강 신청 가능한 강의들입니다</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        {coursesByGrade.high.length}개
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 모바일: 캐러셀 */}
                    <div className="md:hidden">
                      <Carousel className="w-full">
                        <CarouselContent className="-ml-1">
                          {coursesByGrade.high.map(course => (
                            <CarouselItem key={course.id} className="pl-1 basis-1/2">
                              <CourseCard course={course} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1" />
                        <CarouselNext className="right-1" />
                      </Carousel>
                    </div>
                    {/* 데스크탑: 그리드 */}
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {coursesByGrade.high.map(course => (
                        <div key={course.id} className="animate-fade-in">
                          <CourseCard course={course} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {closedCourses.filter(c => c.grade === 'high').length > 0 && (
                <Card className="border-2 border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-900/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">마감된 고등부 강의</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">신청이 마감된 고등부 강의들입니다</p>
                      </div>
                      <Badge variant="outline" className="ml-auto border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                        {closedCourses.filter(c => c.grade === 'high').length}개
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 모바일: 캐러셀 */}
                    <div className="md:hidden opacity-75">
                      <Carousel className="w-full">
                        <CarouselContent className="-ml-1">
                          {closedCourses.filter(c => c.grade === 'high').map(course => (
                            <CarouselItem key={course.id} className="pl-1 basis-1/2">
                              <CourseCard course={course} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1" />
                        <CarouselNext className="right-1" />
                      </Carousel>
                    </div>
                    {/* 데스크탑: 그리드 */}
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 opacity-75">
                      {closedCourses.filter(c => c.grade === 'high').map(course => (
                        <div key={course.id} className="animate-fade-in">
                          <CourseCard course={course} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseList;