
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, Sparkles, X, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * 오늘 일정 팝업: 사이트 첫 진입 시 오늘 일정을 예쁘고 모션감 있게 보여주는 팝업
 */
export function TodayEventPopup({ events }: { events: { id: string; title: string; }[] }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 페이지 로드 직후 1회만 자동 팝업
    setTimeout(() => setShow(true), 350); // 살짝 delay로 모션 느낌 강조
  }, []);

  // 100개의 성경 구절
  const bibleVerses = [
    "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters. (Colossians 3:23)",
    "Commit to the Lord whatever you do, and he will establish your plans. (Proverbs 16:3)",
    "A generous person will prosper; whoever refreshes others will be refreshed. (Proverbs 11:25)",
    "Let all that you do be done in love. (1 Corinthians 16:14)",
    "Do to others as you would have them do to you. (Luke 6:31)",
    "Plans fail for lack of counsel, but with many advisers they succeed. (Proverbs 15:22)",
    "The Lord is my shepherd, I lack nothing. (Psalm 23:1)",
    "Do not be overcome by evil, but overcome evil with good. (Romans 12:21)",
    "The plans of the diligent lead to profit as surely as haste leads to poverty. (Proverbs 21:5)",
    "Be strong and courageous. Do not be afraid or discouraged. (Joshua 1:9)",
    "Blessed are the peacemakers, for they will be called children of God. (Matthew 5:9)",
    "A soft answer turns away wrath, but a harsh word stirs up anger. (Proverbs 15:1)",
    "Better is a little with righteousness than great revenues with injustice. (Proverbs 16:8)",
    "The integrity of the upright guides them. (Proverbs 11:3)",
    "Do everything without grumbling or arguing. (Philippians 2:14)",
    "In all your ways submit to Him, and He will make your paths straight. (Proverbs 3:6)",
    "The wise store up knowledge, but the mouth of a fool invites ruin. (Proverbs 10:14)",
    "A person's steps are directed by the Lord. (Proverbs 20:24)",
    "As iron sharpens iron, so one person sharpens another. (Proverbs 27:17)",
    "Rejoice always, pray continually, give thanks in all circumstances. (1 Thessalonians 5:16–18)",
    "Cast all your anxiety on Him because He cares for you. (1 Peter 5:7)",
    "For God gave us a spirit not of fear but of power and love and self-control. (2 Timothy 1:7)",
    "Do not conform to the pattern of this world but be transformed by the renewing of your mind. (Romans 12:2)",
    "The name of the Lord is a strong tower; the righteous run to it and are safe. (Proverbs 18:10)",
    "Trust in the Lord with all your heart and lean not on your own understanding. (Proverbs 3:5)",
    "You will keep in perfect peace those whose minds are steadfast. (Isaiah 26:3)",
    "I can do all things through Christ who strengthens me. (Philippians 4:13)",
    "Whatever you do, do it all for the glory of God. (1 Corinthians 10:31)",
    "A cheerful heart is good medicine. (Proverbs 17:22)",
    "Let your light shine before others. (Matthew 5:16)",
    "Be still and know that I am God. (Psalm 46:10)",
    "Love your neighbor as yourself. (Matthew 22:39)",
    "For where your treasure is, there your heart will be also. (Matthew 6:21)",
    "The fear of the Lord is the beginning of wisdom. (Proverbs 9:10)",
    "The joy of the Lord is your strength. (Nehemiah 8:10)",
    "He has shown you, O man, what is good and what the Lord requires of you. (Micah 6:8)",
    "Do not worry about tomorrow, for tomorrow will worry about itself. (Matthew 6:34)",
    "In quietness and trust is your strength. (Isaiah 30:15)",
    "Let us not become weary in doing good. (Galatians 6:9)",
    "God is our refuge and strength, an ever-present help in trouble. (Psalm 46:1)",
    "Those who hope in the Lord will renew their strength. (Isaiah 40:31)",
    "Do not despise small beginnings. (Zechariah 4:10)",
    "Speak the truth in love. (Ephesians 4:15)",
    "The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness. (Galatians 5:22)",
    "Above all else, guard your heart, for everything you do flows from it. (Proverbs 4:23)",
    "A good name is more desirable than great riches. (Proverbs 22:1)",
    "A faithful person will be richly blessed. (Proverbs 28:20)",
    "The Lord bless you and keep you. (Numbers 6:24)",
    "Let us consider how we may spur one another on toward love and good deeds. (Hebrews 10:24)",
    "If anyone lacks wisdom, let him ask God. (James 1:5)",
    "If God is for us, who can be against us? (Romans 8:31)",
    "Let the peace of Christ rule in your hearts. (Colossians 3:15)",
    "Blessed is the one who trusts in the Lord. (Jeremiah 17:7)",
    "Do not let your hearts be troubled. Trust in God. (John 14:1)",
    "Clothe yourselves with compassion, kindness, humility, gentleness and patience. (Colossians 3:12)",
    "The Lord will fight for you; you need only to be still. (Exodus 14:14)",
    "Love never fails. (1 Corinthians 13:8)",
    "Be completely humble and gentle; be patient, bearing with one another in love. (Ephesians 4:2)",
    "He who began a good work in you will carry it on to completion. (Philippians 1:6)",
    "For nothing will be impossible with God. (Luke 1:37)",
    "Set your minds on things above, not on earthly things. (Colossians 3:2)",
    "The Lord is good, a refuge in times of trouble. (Nahum 1:7)",
    "Carry each other's burdens, and in this way you will fulfill the law of Christ. (Galatians 6:2)",
    "Therefore encourage one another and build each other up. (1 Thessalonians 5:11)",
    "My grace is sufficient for you, for my power is made perfect in weakness. (2 Corinthians 12:9)",
    "Be strong and take heart, all you who hope in the Lord. (Psalm 31:24)",
    "You are the light of the world. (Matthew 5:14)",
    "Humble yourselves before the Lord, and he will lift you up. (James 4:10)",
    "The Lord is near to all who call on him. (Psalm 145:18)",
    "The one who gets wisdom loves life. (Proverbs 19:8)",
    "Let your conversation be always full of grace. (Colossians 4:6)",
    "In all things God works for the good of those who love him. (Romans 8:28)",
    "A gentle tongue is a tree of life. (Proverbs 15:4)",
    "The Lord gives wisdom; from his mouth come knowledge and understanding. (Proverbs 2:6)",
    "The eyes of the Lord are on the righteous, and his ears are attentive to their cry. (Psalm 34:15)",
    "Make it your ambition to lead a quiet life, to mind your own business and to work with your hands. (1 Thessalonians 4:11)",
    "Do not be slothful in zeal, be fervent in spirit, serve the Lord. (Romans 12:11)",
    "Therefore, whether you eat or drink, or whatever you do, do all to the glory of God. (1 Corinthians 10:31)",
    "Do not merely listen to the word, and so deceive yourselves. Do what it says. (James 1:22)",
    "Wisdom is more precious than rubies. (Proverbs 3:15)",
    "You will eat the fruit of your labor; blessings and prosperity will be yours. (Psalm 128:2)",
    "Where there is no vision, the people perish. (Proverbs 29:18)",
    "Look to the Lord and his strength; seek his face always. (1 Chronicles 16:11)",
    "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline. (2 Timothy 1:7)",
    "Teach us to number our days, that we may gain a heart of wisdom. (Psalm 90:12)",
    "Trust in him at all times, you people; pour out your hearts to him. (Psalm 62:8)",
    "Let us run with perseverance the race marked out for us. (Hebrews 12:1)",
    "As for you, be strong and do not give up, for your work will be rewarded. (2 Chronicles 15:7)",
    "Those who seek the Lord lack no good thing. (Psalm 34:10)",
    "Keep your lives free from the love of money and be content with what you have. (Hebrews 13:5)",
    "Let the favor of the Lord our God be upon us and establish the work of our hands. (Psalm 90:17)",
    "It is more blessed to give than to receive. (Acts 20:35)",
    "You are God's workmanship, created in Christ Jesus to do good works. (Ephesians 2:10)",
    "Do not boast about tomorrow, for you do not know what a day may bring. (Proverbs 27:1)",
    "As each has received a gift, use it to serve one another. (1 Peter 4:10)",
    "Let justice roll on like a river, righteousness like a never-failing stream! (Amos 5:24)",
    "Your word is a lamp for my feet, a light on my path. (Psalm 119:105)",
    "May the Lord direct your hearts into God's love and Christ's perseverance. (2 Thessalonians 3:5)",
    "The righteous are as bold as a lion. (Proverbs 28:1)",
    "Be joyful in hope, patient in affliction, faithful in prayer. (Romans 12:12)"
  ];

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // 현재 날짜를 기반으로 성경 구절 인덱스 계산 (일 단위 로테이션)
  const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const verseIndex = dayOfYear % bibleVerses.length;
  const todaysVerse = bibleVerses[verseIndex];

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent
        className="max-w-md mx-auto overflow-hidden border-0 p-0 shadow-2xl bg-white dark:bg-gray-900 rounded-2xl animate-fade-in animate-scale-in"
        style={{ 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 60px rgba(71, 85, 105, 0.15)',
          backdropFilter: "blur(16px)"
        }}
      >
        {/* Header with beautiful gradient background */}
        <div className="relative bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-900 dark:to-black p-6 pb-8 overflow-hidden">
          {/* Metallic dotted patterns */}
          <div className="absolute inset-0 opacity-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:32px_32px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(200,200,200,0.1)_1px,transparent_1px)] bg-[length:48px_48px]"></div>
          </div>
          
          {/* Metallic mesh pattern */}
          <div className="absolute inset-0 opacity-8">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(30deg, rgba(180,180,180,0.08) 12%, transparent 12.5%, transparent 87%, rgba(180,180,180,0.08) 87.5%, rgba(180,180,180,0.08)),
                linear-gradient(150deg, rgba(160,160,160,0.06) 12%, transparent 12.5%, transparent 87%, rgba(160,160,160,0.06) 87.5%, rgba(160,160,160,0.06))
              `,
              backgroundSize: '80px 140px'
            }}></div>
          </div>
          
          {/* Metallic gradient waves */}
          <div className="absolute inset-0 opacity-6">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(ellipse at top, rgba(220,220,220,0.1), transparent),
                radial-gradient(ellipse at bottom, rgba(180,180,180,0.08), transparent)
              `,
              backgroundSize: '100% 50%',
              backgroundPosition: 'top, bottom',
              backgroundRepeat: 'no-repeat'
            }}></div>
          </div>
          
          {/* Subtle metallic light rays */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 opacity-8">
            <div className="absolute inset-0 bg-gradient-conic from-gray-300 via-transparent to-transparent animate-spin-slow"></div>
          </div>
          
          {/* Metallic geometric overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[conic-gradient(from_45deg,rgba(200,200,200,0.08),transparent,rgba(200,200,200,0.08))] bg-[length:64px_64px]"></div>
          </div>
          
          {/* Soft metallic glow */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-15">
            <div className="absolute inset-0 bg-gradient-radial from-gray-300/20 to-transparent rounded-full"></div>
          </div>
          {/* Metallic floating elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300/8 rounded-full -translate-y-16 translate-x-16 animate-float-bounce" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-400/6 rounded-full translate-y-12 -translate-x-12 animate-float-bounce" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gray-200/5 rounded-full animate-float-bounce" style={{ animationDelay: '2s' }} />
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>

          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-sm" />
                <div className="relative bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                  <CalendarDays className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white mb-1 tracking-tight">
                  오늘의 일정
                </DialogTitle>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">{formattedDate}</span>
                </div>
              </div>
            </div>
            <DialogDescription className="text-slate-200/90 text-lg leading-relaxed font-crimson italic tracking-wide">
              {todaysVerse}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content area */}
        <div className="p-6 pt-2">
          {events && events.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  예정된 일정
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {events.length}개
                </Badge>
              </div>
              
              <div className="space-y-3">
                {events.map((ev, index) => (
                  <div
                    key={ev.id}
                    className="group flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animation: 'fade-in 0.5s ease-out forwards'
                    }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full animate-ping opacity-75" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                        {ev.title}
                      </p>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                오늘 일정이 없습니다
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                새로운 하루를 위한 준비 시간입니다
              </p>
            </div>
          )}

          {/* Action button */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setShow(false)}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              확인했습니다
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
