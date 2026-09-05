// 배열영작 서술형 DRILL - UNIT 01~20 (원본 PDF 기반 정확한 데이터)
import { Problem, Unit } from './workbookData';

export const arrangementUnits: Unit[] = [
  {
    number: 1,
    title: "주어가 명사구인 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "겨울에 수영하러 가는 것은 당신이 아주 건강해지는 기분이 들도록 만든다.", 
        hints: ["To", "go", "swimming", "in", "winter", "makes", "you", "feel", "very", "healthy"], 
        type: 'arrangement', 
        answer: "To go swimming in winter makes you feel very healthy." 
      },
      { 
        number: 2, 
        korean: "지면으로부터 15,000피트 떨어진 하늘에서 떨어지는 것은 내 소원 목록에는 결코 있지 않았다.", 
        hints: ["Falling", "through", "the sky", "fifteen thousand feet", "from", "the ground", "was", "never", "on", "my wish list"], 
        type: 'arrangement', 
        answer: "Falling through the sky fifteen thousand feet from the ground was never on my wish list." 
      },
      { 
        number: 3, 
        korean: "물건을 아주 쉽게 버릴 수 있다는 것은 우리가 가지고 있는 실제의 물건들에 대해 우리를 무감각하도록 만든다.", 
        hints: ["Being", "able", "so easily", "to", "dispose of", "things", "makes", "us", "insensitive", "to", "the actual objects", "we possess"], 
        type: 'arrangement', 
        answer: "Being able so easily to dispose of things makes us insensitive to the actual objects we possess." 
      },
      { 
        number: 4, 
        korean: "바람과 태양(에너지)을 뒷받침할 수 있는 믿을 만한 에너지를 보유하는 것은 모든 것이 원활하게 작동하도록 하기 위해 필요할 것이다.", 
        hints: ["Having", "reliable", "energy storage", "to", "back up", "wind", "and", "solar", "will be", "necessary", "for", "everything", "to run", "smoothly"], 
        type: 'arrangement', 
        answer: "Having reliable energy storage to back up wind and solar will be necessary for everything to run smoothly." 
      },
      { 
        number: 5, 
        korean: "당신의 문제에 있어 당신의 역할을 받아들이는 것은 해결책이 당신 안에 있다는 것을 당신이 이해한다는 것을 의미한다.", 
        hints: ["Accepting", "your role", "in", "your problems", "means", "that", "you", "understand", "that", "the solution", "lies", "within", "you"], 
        type: 'arrangement', 
        answer: "Accepting your role in your problems means that you understand that the solution lies within you." 
      },
      { 
        number: 6, 
        korean: "그 아이스크림을 선택하는 것은 그 초콜릿 칩 쿠키를 먹을 수 없다는 것을 의미한다.", 
        hints: ["To", "select", "the", "ice cream", "means", "not", "being", "able", "to", "eat", "the", "chocolate", "chip", "cookies"], 
        type: 'arrangement', 
        answer: "To select the ice cream means not being able to eat the chocolate chip cookies." 
      },
      { 
        number: 7, 
        korean: "당신의 아이가 영리한지 아닌지를 결정하는 것은 주의 깊은 관찰력을 필요로 한다.", 
        hints: ["Deciding", "whether", "your", "child", "is", "bright", "or", "not", "requires", "careful", "observation"], 
        type: 'arrangement', 
        answer: "Deciding whether your child is bright or not requires careful observation." 
      },
      { 
        number: 8, 
        korean: "행동 패턴을 인지하는 데 전문가가 되는 것은 당신의 인생에서 스트레스를 줄이도록 당신을 도와줄 수 있다.", 
        hints: ["Becoming", "an", "expert", "in", "recognizing", "patterns", "of", "behavior", "can", "help", "you", "reduce", "the", "stress", "in", "your", "life"], 
        type: 'arrangement', 
        answer: "Becoming an expert in recognizing patterns of behavior can help you reduce the stress in your life." 
      },
      { 
        number: 9, 
        korean: "학교 실험실에서 과학을 하는 것은 그것(과학)에 관하여 읽는 것보다 훨씬 더 흥미로울 수 있다.", 
        hints: ["Doing", "science", "in", "the", "school", "laboratory", "can", "be", "much", "more", "interesting", "than", "reading", "about", "it"], 
        type: 'arrangement', 
        answer: "Doing science in the school laboratory can be much more interesting than reading about it." 
      },
      { 
        number: 10, 
        korean: "희귀한 유전적 질병을 가진 가족을 연구하는 것이 의사들로 하여금 세대에 걸친 질병의 유전적 원인을 추적하도록 가능케 해왔다.", 
        hints: ["Studying", "families", "with", "rare", "genetic", "disorders", "has", "allowed", "doctors", "to", "trace", "the", "genetic", "basis", "of", "disease", "through", "generations"], 
        type: 'arrangement', 
        answer: "Studying families with rare genetic disorders has allowed doctors to trace the genetic basis of disease through generations." 
      },
      { 
        number: 11, 
        korean: "어떤 것을 크게 말하는 것은 단지 그것을 생각하는 것보다 더 강력한 기억을 만든다.", 
        hints: ["more powerful", "aloud", "create", "only think", "memory", "say", "a"], 
        wordCount: 12, 
        instructions: "동명사를 주어로 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "Saying something aloud creates a more powerful memory than only thinking it." 
      },
      { 
        number: 12, 
        korean: "최신 제품을 가진다는 것이 그것을 오랫동안 사용한다는 것보다 더 중요하다.", 
        hints: ["make", "getting", "is", "of", "durable use", "the latest thing", "it"], 
        wordCount: 13, 
        instructions: "비교급을 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "Getting the latest thing is more important than making durable use of it." 
      },
      { 
        number: 13, 
        korean: "직원들이 가끔씩 집에서 일하도록 허용하는 것은 더 좋은 아이디어와 결과들을 만들어 낼 것이다.", 
        hints: ["allow", "generate", "from home", "occasionally work", "results", "employees"], 
        wordCount: 13, 
        instructions: "동명사를 주어로 사용할 것", 
        type: 'arrangement', 
        answer: "Allowing employees to occasionally work from home will generate better ideas and results." 
      },
      { 
        number: 14, 
        korean: "아이들이 불쾌한 경험들을 겪지 않기를 원하는 것은 고귀한 목적이다.", 
        hints: ["want", "go through", "children", "a noble aim", "to spare", "unpleasant"], 
        wordCount: 14, 
        instructions: "to부정사를 주어로 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "To want to spare children from going through unpleasant experiences is a noble aim." 
      },
      { 
        number: 15, 
        korean: "살아가는 방법을 알아내기 위해서 노인들의 의견을 듣는 것은 우리 사회에서 그다지 흔하지 않다.", 
        hints: ["in", "very common", "older people", "society", "to find out", "listen to"], 
        wordCount: 17, 
        instructions: "동명사를 주어로 사용할 것, 「의문사 + to-V」를 사용할 것", 
        type: 'arrangement', 
        answer: "Listening to older people to find out how to live is not very common in our society." 
      },
    ],
  },
  {
    number: 2,
    title: "주어가 명사절인 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "그것을 차이나도록 만드는 것은 어린아이와 어른 사이의 상대적인 신장이다.", 
        hints: ["and an adult", "it different", "between a young child", "is the relative height", "what makes"], 
        type: 'arrangement', 
        answer: "What makes it different is the relative height between a young child and an adult." 
      },
      { 
        number: 2, 
        korean: "여러분이 거기서 한 것은 정전기라고 불리는 전기의 한 형태를 만든 것이다.", 
        hints: ["called static electricity", "what you", "is to create", "have done there", "a form of electricity"], 
        type: 'arrangement', 
        answer: "What you have done there is to create a form of electricity called static electricity." 
      },
      { 
        number: 3, 
        korean: "방울뱀 고기가 먹기에 혐오스러운 음식이라는 것은 정상적인 소화 과정의 극단적인 반전을 촉발했다.", 
        hints: ["of the normal digestive process", "is a disgusting thing", "triggered", "a violent reversal", "to eat", "that rattlesnake meat"], 
        type: 'arrangement', 
        answer: "That rattlesnake meat is a disgusting thing to eat triggered a violent reversal of the normal digestive process." 
      },
      { 
        number: 4, 
        korean: "이런 부모들이 깨닫지 못하는 것은 그들이 그들의 자녀의 삶을 더 즐겁게 만들 수 없다는 것이다.", 
        hints: ["they can't make", "of their children", "don't realize", "the lives", "more pleasant", "is that", "what these parents"], 
        type: 'arrangement', 
        answer: "What these parents don't realize is that they can't make the lives of their children more pleasant." 
      },
      { 
        number: 5, 
        korean: "안전에 지출된 그 돈이 현명한 결정으로 보일지 그렇게 보이지 않을지는 비교의 상황에 달려 있을 것이다.", 
        hints: ["is seen", "of comparison", "or not", "spent on safety", "will depend on", "the context", "whether the money", "as a wise decision"], 
        type: 'arrangement', 
        answer: "Whether the money spent on safety is seen as a wise decision or not will depend on the context of comparison." 
      },
      { 
        number: 6, 
        korean: "사람을 게으르게 만드는 것은 목표와 목적의 부족이다.", 
        hints: ["What", "causes", "a person", "to be", "inactive", "is", "a lack of", "goals", "and", "purpose"], 
        type: 'arrangement', 
        answer: "What causes a person to be inactive is a lack of goals and purpose." 
      },
      { 
        number: 7, 
        korean: "여성이 노예인지 더 부유한 계층 출신인지가 많은 차이를 만들었다.", 
        hints: ["Whether", "a woman", "was", "a slave", "or", "came from", "a wealthier class", "made", "a great deal of", "difference"], 
        type: 'arrangement', 
        answer: "Whether a woman was a slave or came from a wealthier class made a great deal of difference." 
      },
      { 
        number: 8, 
        korean: "당신이 당신의 교수들을 어떻게 부르는지는 대학 문화와 교수 자신의 선호도와 같은 많은 요소들에 달려 있다.", 
        hints: ["How", "you", "address", "your professors", "depends on", "many factors", "such as", "college culture", "and", "their own preference"], 
        type: 'arrangement', 
        answer: "How you address your professors depends on many factors such as college culture and their own preference." 
      },
      { 
        number: 9, 
        korean: "더욱 놀라운 것은 당신이 실제 오렌지 안에서보다 하얀색 속껍질 안에서 더 많은 비타민 C를 찾을 수 있다는 것이다.", 
        hints: ["What", "is", "more surprising", "is that", "you", "can find", "more", "vitamin C", "in the white pith", "than", "in the actual orange"], 
        type: 'arrangement', 
        answer: "What is more surprising is that you can find more vitamin C in the white pith than in the actual orange." 
      },
      { 
        number: 10, 
        korean: "그의 진짜 모습이 공교롭게도 잘생긴 왕자였다는 것은 그녀가 크게 보상을 받았다는 것을 상징적으로 보여 준다.", 
        hints: ["That", "his true self", "just happened", "to be", "a handsome prince", "shows", "symbolically", "that", "she", "was rewarded", "greatly"], 
        type: 'arrangement', 
        answer: "That his true self just happened to be a handsome prince shows symbolically that she was rewarded greatly." 
      },
      { 
        number: 11, 
        korean: "우리가 어떻게 세상을 보는지는 우리가 그것(세상)으로부터 무엇을 원하는지에 달려 있다.", 
        hints: ["depend", "from", "how", "the world", "what"], 
        wordCount: 12, 
        instructions: "필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "How we see the world depends on what we want from it." 
      },
      { 
        number: 12, 
        korean: "내가 하기로 결심했던 일은 뉴욕에 계신 나의 할머니께 편지를 쓰는 것이었다.", 
        hints: ["to write", "was", "do", "in New York", "decided"], 
        wordCount: 16, 
        instructions: "관계대명사 what을 주어로 쓸 것", 
        type: 'arrangement', 
        answer: "What I decided to do was to write a letter to my grandmother in New York." 
      },
      { 
        number: 13, 
        korean: "그가 그것을 사용했던 아니던 나에게는 중요하지 않다.", 
        hints: ["Whether", "he", "used", "it", "or", "not", "doesn't", "matter", "to", "me"], 
        type: 'arrangement', 
        answer: "Whether he used it or not doesn't matter to me." 
      },
      { 
        number: 14, 
        korean: "사람들이 얼마나 긍정적으로 잠재적 관계를 평가했는지가 그들이 얼마나 많은 공통점을 가졌는지보다 더 중요했다.", 
        hints: ["rate", "was", "in common", "positive", "people", "a potential relationship", "much", "how"], 
        wordCount: 17, 
        instructions: "단어 중복 사용 가능, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "How positively people rated a potential relationship was more important than how much they had in common." 
      },
      { 
        number: 15, 
        korean: "나를 아프게 하는 것은 사건 그 자체가 아니라, 그나 그녀가 무비판적으로 택했던 반응이다.", 
        hints: ["the response", "the occurrence itself", "hurts", "is", "has uncritically adopted"], 
        wordCount: 17, 
        instructions: "관계대명사 what을 주어로 쓸 것, 「not A but B」를 사용할 것", 
        type: 'arrangement', 
        answer: "What hurts me is not the occurrence itself but the response he or she has uncritically adopted." 
      },
    ],
  },
  {
    number: 3,
    title: "주어가 형용사구의 수식을 받는 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "유럽을 통합하는 문제에 관한 현재의 의견 불일치는 유럽 분열의 전형이다.", 
        hints: ["are typical", "about the issue", "of Europe's disunity", "the current disagreements", "of unifying Europe"], 
        type: 'arrangement', 
        answer: "The current disagreements about the issue of unifying Europe are typical of Europe's disunity." 
      },
      { 
        number: 2, 
        korean: "설문 조사에 포함된 시나리오들은 구조될 수 있었던 보행자와 탑승자의 수를 달리했다.", 
        hints: ["involved in the surveys", "and passenger lives", "varied in", "that could be saved", "the scenarios", "the number of pedestrian"], 
        type: 'arrangement', 
        answer: "The scenarios involved in the surveys varied in the number of pedestrian and passenger lives that could be saved." 
      },
      { 
        number: 3, 
        korean: "그 믿음을 시험해 볼 방법은 당신이 받아들일 수 있다고 믿는 것의 범위 내에서 고수하는 것이다.", 
        hints: ["that belief", "to be acceptable", "the way", "is to stick", "what you believe", "to test", "within the range of"], 
        type: 'arrangement', 
        answer: "The way to test that belief is to stick within the range of what you believe to be acceptable." 
      },
      { 
        number: 4, 
        korean: "휴대 기기를 사용하는 운전자들은 4배 더 사고를 내고 자신이나 타인을 다치게 할 것 같다.", 
        hints: ["and injure themselves", "are four times", "have an accident", "drivers", "or others", "more likely to", "using mobile devices"], 
        type: 'arrangement', 
        answer: "Drivers using mobile devices are four times more likely to have an accident and injure themselves or others." 
      },
      { 
        number: 5, 
        korean: "르네상스의 가장 흥미 있는 그림들 중의 하나는 Albrecht Dürer가 그린 잡초가 무성한 지대의 정교한 묘사이다.", 
        hints: ["of ground", "of a weedy patch", "of the Renaissance", "one", "of the most curious paintings", "is a careful depiction", "by Albrecht Dürer"], 
        type: 'arrangement', 
        answer: "One of the most curious paintings of the Renaissance is a careful depiction of a weedy patch of ground by Albrecht Dürer." 
      },
      { 
        number: 6, 
        korean: "우편물로 편지를 받는 것에 대한 흥미로운 무언가가 있다.", 
        hints: ["the", "getting", "exciting", "is", "a letter", "something", "there", "about", "in", "mail"], 
        type: 'arrangement', 
        answer: "There is something exciting about getting a letter in the mail." 
      },
      { 
        number: 7, 
        korean: "즐거움을 포기하고 시험을 위해 공부한다는 그의 결정이 올바른 것임이 증명되었다.", 
        hints: ["exam", "decision", "good", "a", "to", "his", "study", "turned out", "give", "the", "fun", "one", "having", "and", "for", "up"], 
        type: 'arrangement', 
        answer: "His decision to give up having fun and study for the exam turned out a good one." 
      },
      { 
        number: 8, 
        korean: "그 동물 센터의 직원들 중의 한 명은 무엇이 잘못되었는지를 알아냈다.", 
        hints: ["at", "workers", "has", "what", "the", "animal", "center", "one", "out", "wrong", "of", "found", "was"], 
        type: 'arrangement', 
        answer: "One of the workers at the animal center has found out what was wrong." 
      },
      { 
        number: 9, 
        korean: "어떻게 그 나무가 거꾸로 땅에 박히게 되었는지에 대한 설명을 제공하는 수많은 이야기들이 있다.", 
        hints: ["There", "are", "numerous", "stories", "offering", "explanations", "of", "how", "the", "tree", "came", "to", "be", "stuffed", "in", "the", "ground", "upside", "down"], 
        type: 'arrangement', 
        answer: "There are numerous stories offering explanations of how the tree came to be stuffed in the ground upside down." 
      },
      { 
        number: 10, 
        korean: "그렇게 하지 않는 것은 관련된 사람들에게 부정적인 결과를 가져올 수 있는 오해를 불러일으킬 것이다.", 
        hints: ["who", "failure", "lead", "consequences", "those", "to", "will", "negative", "that", "to", "may", "misunderstanding", "for", "do", "so", "are", "have", "involved"], 
        type: 'arrangement', 
        answer: "Failure to do so will lead to misunderstanding that may have negative consequences for those who are involved." 
      },
      { 
        number: 11, 
        korean: "기억에서 보내진 그 정보는 우리가 가상의 청취를 하도록 허락할 것이다.", 
        hints: ["us", "from", "send", "have", "a fake listen"], 
        wordCount: 13, 
        instructions: "필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "The information sent from memory will allow us to have a fake listen." 
      },
      { 
        number: 12, 
        korean: "학생들에게 존중을 보여 주는 가장 중요한 방법은 그들을 문제 해결에 포함시키는 것이다.", 
        hints: ["respect", "involve", "show", "to students", "in problem-solving"], 
        wordCount: 15, 
        instructions: "to부정사를 2번 사용할 것", 
        type: 'arrangement', 
        answer: "The most important way to show respect to students is to involve them in problem-solving." 
      },
      { 
        number: 13, 
        korean: "패스트푸드 체인점의 경제적인 성공에 대한 한 가지 중요한 이유는 그들의 노동 비용이 낮다는 사실이었다.", 
        hints: ["low", "labor costs", "their", "the financial success", "been", "fast-food chains", "for", "the fact"], 
        wordCount: 20, 
        instructions: "동격의 that을 사용할 것, 현재완료 시제를 사용할 것", 
        type: 'arrangement', 
        answer: "One important reason for the financial success of fast-food chains has been the fact that their labor costs are low." 
      },
      { 
        number: 14, 
        korean: "관계에서 장기간의 행복을 보장하는 최고의 방법은 당신의 첫사랑에 집착하지 않는 것이다.", 
        hints: ["best way", "not", "make sure", "first love", "long-term", "in a relationship", "stick to"], 
        wordCount: 19, 
        instructions: "to부정사를 2번 사용할 것", 
        type: 'arrangement', 
        answer: "The best way to make sure long-term happiness in a relationship is not to stick to your first love." 
      },
      { 
        number: 15, 
        korean: "암스테르담에서 도쿄로 가는 최고의 방법은 지중해 노선이라고 알려진 것을 따라서 동쪽 방향으로 향하는 것이다.", 
        hints: ["head", "Tokyo", "in an easterly direction", "as", "is", "the Mediterranean route", "Amsterdam", "along", "know", "is", "what", "get"], 
        wordCount: 24, 
        instructions: "「from A to B」를 사용할 것, to부정사를 2번 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "The best way to get from Amsterdam to Tokyo is to head in an easterly direction along what is known as the Mediterranean route." 
      },
    ],
  },
  {
    number: 4,
    title: "주어가 형용사절의 수식을 받는 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "부모가 시간이나 내용 제한을 설정한 아이들은 하루에 세 시간 덜 접속한다.", 
        hints: ["each day", "or content limits", "set any time", "three hours less", "kids", "whose parents", "are plugged in"], 
        type: 'arrangement', 
        answer: "Kids whose parents set any time or content limits are plugged in three hours less each day." 
      },
      { 
        number: 2, 
        korean: "위험을 기꺼이 감수하려는 사람은 문신 새기기를 좋아할 것이며 그리고 또한 오토바이를 탈 가능성이 더 높다.", 
        hints: ["take risks", "on a motorcycle", "likes to", "and also", "takes more chances", "be tattooed", "a person", "who is willing to"], 
        type: 'arrangement', 
        answer: "A person who is willing to take risks likes to be tattooed and also takes more chances on a motorcycle." 
      },
      { 
        number: 3, 
        korean: "예술가의 개성보다는 전통의 준수에 우선권이 주어졌던 시기가 있었다.", 
        hints: ["to an observance", "to an artist's personality", "there was", "rather than", "of tradition", "a time", "when priority was given"], 
        type: 'arrangement', 
        answer: "There was a time when priority was given to an observance of tradition rather than to an artist's personality." 
      },
      { 
        number: 4, 
        korean: "친한 친구들과 함께 서 있었던 참가자들은 그 언덕의 경사도에 대해 상당히 더 낮은 추정치를 주었다.", 
        hints: ["significantly lower estimates", "close friends", "that stood with", "of the hill", "gave", "the participants", "of the steepness"], 
        type: 'arrangement', 
        answer: "The participants that stood with close friends gave significantly lower estimates of the steepness of the hill." 
      },
      { 
        number: 5, 
        korean: "폭풍우 동안에 우리가 종종 보는 번개는 전기를 띤 구름과 지면 사이의 전하의 큰 흐름에 의해서 야기된다.", 
        hints: ["of electrical charges", "that we often see", "and the earth", "between charged clouds", "during a storm", "is caused", "the lightning", "by a large flow"], 
        type: 'arrangement', 
        answer: "The lightning that we often see during a storm is caused by a large flow of electrical charges between charged clouds and the earth." 
      },
      { 
        number: 6, 
        korean: "자신을 다른 사람들과 비교하는 사람은 두려움의 상태에서 산다.", 
        hints: ["The", "person", "who", "compares", "himself", "to", "others", "lives", "in", "a", "state", "of", "fear"], 
        type: 'arrangement', 
        answer: "The person who compares himself to others lives in a state of fear." 
      },
      { 
        number: 7, 
        korean: "상어의 이익을 위해 사람들이 취할 수 있는 어떤 조치든 전체 생태계에 유익하다.", 
        hints: ["Any", "action", "that", "people", "can", "take", "for", "the", "benefit", "of", "sharks", "is", "good", "for", "the", "entire", "ecosystem"], 
        type: 'arrangement', 
        answer: "Any action that people can take for the benefit of sharks is good for the entire ecosystem." 
      },
      { 
        number: 8, 
        korean: "사람들은 그들이 다른 사람들에게 있다고 설명한 어떤 특성을 가지고 있는 것으로 인식된다는 흥미로운 현상이 있다.", 
        hints: ["There", "is", "an", "interesting", "phenomenon", "where", "people", "are", "perceived", "as", "possessing", "a", "trait", "that", "they", "describe", "in", "others"], 
        type: 'arrangement', 
        answer: "There is an interesting phenomenon where people are perceived as possessing a trait that they describe in others." 
      },
      { 
        number: 9, 
        korean: "한때 전통적인 보통 신문 크기로 출판되었던 신문들이 타블로이드판으로 전환하도록 강요받는다.", 
        hints: ["Newspapers", "that", "were", "once", "published", "in", "the", "traditional", "broadsheet", "size", "are", "forced", "to", "switch", "to", "a", "tabloid", "layout"], 
        type: 'arrangement', 
        answer: "Newspapers that were once published in the traditional broadsheet size are forced to switch to a tabloid layout." 
      },
      { 
        number: 10, 
        korean: "개인의 선택이나 취향의 차이점들에 의해 만들어지는 행복의 불평등은 허용 가능하다.", 
        hints: ["Inequality", "of", "well-being", "that", "is", "driven", "by", "differences", "in", "individual", "choices", "or", "tastes", "is", "acceptable"], 
        type: 'arrangement', 
        answer: "Inequality of well-being that is driven by differences in individual choices or tastes is acceptable." 
      },
      { 
        number: 11, 
        korean: "우리가 아는 위대한 사상가들 중 첫 번째 사람은 Miletus의 Thales였다.", 
        hints: ["The first", "of", "the great thinkers", "that", "we know of", "was", "Thales", "of Miletus"], 
        type: 'arrangement', 
        answer: "The first of the great thinkers that we know of was Thales of Miletus." 
      },
      { 
        number: 12, 
        korean: "개인적인 고난을 경험해 온 많은 부모님들은 그들의 자녀들을 위해 더 나은 삶을 바란다.", 
        hints: ["Many parents", "who", "have experienced", "personal hardship", "desire", "a better life", "for", "their children"], 
        type: 'arrangement', 
        answer: "Many parents who have experienced personal hardship desire a better life for their children." 
      },
      { 
        number: 13, 
        korean: "당신의 아이가 곤충들에 의해 물리는 것으로부터 보호하기 위해 당신이 할 수 있는 여러 가지 것들이 있다.", 
        hints: ["There are", "several things", "which", "you", "can do", "to prevent", "your child", "from being bitten", "by insects"], 
        type: 'arrangement', 
        answer: "There are several things which you can do to prevent your child from being bitten by insects." 
      },
      { 
        number: 14, 
        korean: "자신들을 가치 있는 사람이라고 여기는 사람들은 그들의 건강에 대해 아는 것에 더 동의하는 경향이 있다.", 
        hints: ["People", "who", "consider", "themselves", "a valuable person", "are more likely", "to agree", "to know", "about their health"], 
        type: 'arrangement', 
        answer: "People who consider themselves a valuable person are more likely to agree to know about their health." 
      },
      { 
        number: 15, 
        korean: "여러분이 인간관계에서 발전시킬 수 있는 가장 중요한 기술은 다른 사람들의 관점으로부터 사물들을 보는 능력이다.", 
        hints: ["The most important skill", "that", "you", "can develop", "in human relations", "is", "the ability", "to see things", "from others'", "points of view"], 
        type: 'arrangement', 
        answer: "The most important skill that you can develop in human relations is the ability to see things from others' points of view." 
      },
    ],
  },
  {
    number: 5,
    title: "가주어 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "당신이 기꺼이 제 학생들에게 특별 강연을 해 주고 당신의 여행에 관한 이야기를 나누어 주는 것이 제 희망입니다.", 
        hints: ["a special lecture", "that you would be", "it is my hope", "about your travels", "to my class", "and share stories", "willing to give"], 
        type: 'arrangement', 
        answer: "It is my hope that you would be willing to give a special lecture to my class and share stories about your travels." 
      },
      { 
        number: 2, 
        korean: "함께 일함으로써 어떻게 문제가 축복으로 변할 수 있는지를 보는 것은 아주 멋졌다.", 
        hints: ["how a problem", "by working together", "it was so beautiful", "could be turned", "to see", "into a blessing"], 
        type: 'arrangement', 
        answer: "It was so beautiful to see how a problem could be turned into a blessing by working together." 
      },
      { 
        number: 3, 
        korean: "더 낮은 속도에서의 충돌이 사망 또는 중상을 덜 초래할 것 같다는 것은 분명하다.", 
        hints: ["is less likely", "that a collision", "to result in", "at a lower speed", "death or serious injury", "it is obvious"], 
        type: 'arrangement', 
        answer: "It is obvious that a collision at a lower speed is less likely to result in death or serious injury." 
      },
      { 
        number: 4, 
        korean: "그러한 사소한 행동으로 당신이 누군가의 하루를 밝게 할 수 있다는 것을 아는 것은 유쾌한 느낌이다.", 
        hints: ["with such a small gesture", "brightening up", "someone's day", "knowing", "it is a lovely feeling", "that you could be"], 
        type: 'arrangement', 
        answer: "It is a lovely feeling knowing that you could be brightening up someone's day with such a small gesture." 
      },
      { 
        number: 5, 
        korean: "성인으로서 내 자신이 일 년 내내 전국으로 여행하는 것을 발견하게 되는 것은 아이러니하다.", 
        hints: ["from state to state", "that as an adult", "throughout the year", "I find myself traveling", "it is ironic"], 
        type: 'arrangement', 
        answer: "It is ironic that as an adult I find myself traveling from state to state throughout the year." 
      },
      { 
        number: 6, 
        korean: "우리가 감정이 없는 삶을 상상하는 것은 거의 불가능하다.", 
        hints: ["It is", "nearly", "impossible", "for us", "to imagine", "a life", "without", "emotion"], 
        type: 'arrangement', 
        answer: "It is nearly impossible for us to imagine a life without emotion." 
      },
      { 
        number: 7, 
        korean: "우리의 건강을 위해 우리가 먹는 음식의 양을 조절하는 것은 필수적이다.", 
        hints: ["It is", "essential", "to control", "the amount of", "food", "that", "we eat", "for our well-being"], 
        type: 'arrangement', 
        answer: "It is essential to control the amount of food that we eat for our well-being." 
      },
      { 
        number: 8, 
        korean: "소음에 대한 지속적인 노출이 아이들의 학업 성취와 관계가 있다는 것은 놀랍지 않다.", 
        hints: ["It is", "not surprising", "that", "constant exposure", "to noise", "is related to", "children's", "academic achievement"], 
        type: 'arrangement', 
        answer: "It is not surprising that constant exposure to noise is related to children's academic achievement." 
      },
      { 
        number: 9, 
        korean: "당신의 사회적 집단 속에 있지 않은 사람들과 사귀는 것은 흥미로울 수 있다.", 
        hints: ["It can be", "exciting", "to make friends", "with people", "who are", "not in", "your social circle"], 
        type: 'arrangement', 
        answer: "It can be exciting to make friends with people who are not in your social circle." 
      },
      { 
        number: 10, 
        korean: "울음이 아기의 폐를 더 튼튼하게 해 주거나 혈액에 산소를 보낸다는 것을 아는 것은 도움이 될 수 있다.", 
        hints: ["It may be", "helpful", "to know", "that", "crying", "makes", "the baby's lungs", "stronger", "or sends", "oxygen", "to his blood"], 
        type: 'arrangement', 
        answer: "It may be helpful to know that crying makes the baby's lungs stronger or sends oxygen to his blood." 
      },
      { 
        number: 11, 
        korean: "외부 사건이 당신을 언짢게 한다고 믿는 것은 당연하다.", 
        hints: ["external events", "natural", "upset"], 
        wordCount: 10, 
        instructions: "「가주어(it) ~ 진주어(to-V)」를 사용할 것, upset은 동사로 사용할 것", 
        type: 'arrangement', 
        answer: "It is natural to believe that external events upset you." 
      },
      { 
        number: 12, 
        korean: "개인의 사생활을 보호하는 데 추가적인 조치들을 취하는 것이 필수적이다.", 
        hints: ["take", "an individual's privacy", "protect", "further steps", "necessary", "in"], 
        wordCount: 12, 
        instructions: "「가주어(it) ~ 진주어(to-V)」를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "It is necessary to take further steps in protecting an individual's privacy." 
      },
      { 
        number: 13, 
        korean: "그런 긴장을 유발하는 상황들을 비난하는 대신에 당신의 머리카락을 염색하는 것이 현명할지도 모른다.", 
        hints: ["wise", "those stressful situations", "might", "dye", "blame", "instead of"], 
        wordCount: 14, 
        instructions: "「가주어(it) ~ 진주어(to-V)」를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "It might be wise to dye your hair instead of blaming those stressful situations." 
      },
      { 
        number: 14, 
        korean: "회사들은 무엇이 그들의 직원들이 그들의 직업에 대하여 만족하도록 만드는지 아는 것이 중요하다.", 
        hints: ["makes", "satisfy", "what", "employees", "companies", "with their jobs", "important"], 
        wordCount: 15, 
        instructions: "「가주어(it) ~ 진주어(to-V)」를 사용할 것, 의미상의 주어를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "It is important for companies to know what makes their employees satisfied with their jobs." 
      },
      { 
        number: 15, 
        korean: "바른 자세로 앉는 것이 당신이 스스로에 대해서 어떻게 느끼는지를 향상시킬 수 있는 것으로 드러났다.", 
        hints: ["you", "improve", "turns out", "straight", "can", "sit up", "feel about"], 
        wordCount: 14, 
        instructions: "「가주어(it) ~ 진주어(that)」를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "It turns out that sitting up straight can improve how you feel about yourself." 
      },
    ],
  },
  {
    number: 6,
    title: "다양한 시제의 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "Kenge는 지평선의 광경을 제공하지 않던 무성한 정글에서 그의 평생을 살았었다.", 
        hints: ["that offered", "Kenge had lived", "of the horizon", "in a dense jungle", "his entire life", "no views"], 
        type: 'arrangement', 
        answer: "Kenge had lived his entire life in a dense jungle that offered no views of the horizon." 
      },
      { 
        number: 2, 
        korean: "광고 기획자들은 그들의 목표 대상의 주의를 끌기 위해 기발한 광고 문구를 끊임없이 찾아 사용하고 있다.", 
        hints: ["constantly searching", "and", "of their target", "ad creators are", "to win over", "the attention", "using catchy phrases"], 
        type: 'arrangement', 
        answer: "Ad creators are constantly searching and using catchy phrases to win over the attention of their target." 
      },
      { 
        number: 3, 
        korean: "그 학교의 많은 학생들은 Lockwood 지역의 청년 실업 문제에 관한 프로젝트를 수행해 오고 있다.", 
        hints: ["a project", "in Lockwood", "many students", "have been working on", "about the youth unemployment problem", "at the school"], 
        type: 'arrangement', 
        answer: "Many students at the school have been working on a project about the youth unemployment problem in Lockwood." 
      },
      { 
        number: 4, 
        korean: "그 미국 남자는 그 사건이 자신의 발견이 드러나도록 그를 도와주기 전에 수년 동안 고무로 실험해 왔었다.", 
        hints: ["for years", "before", "discover his finding", "the American man", "the accident helped him", "with rubber", "had experimented"], 
        type: 'arrangement', 
        answer: "The American man had experimented with rubber for years before the accident helped him discover his finding." 
      },
      { 
        number: 5, 
        korean: "휴대 전화는 모든 전자 제품 중 가장 짧은 수명을 가지고 있는 지위를 획득해 왔던 것 같다.", 
        hints: ["of all the electronic consumer products", "the shortest life cycle", "to have achieved", "of having", "cell phones seem", "the status"], 
        type: 'arrangement', 
        answer: "Cell phones seem to have achieved the status of having the shortest life cycle of all the electronic consumer products." 
      },
      { 
        number: 6, 
        korean: "나는 당신이 이런 종류의 프로그램을 사용할 기회가 절대 없기를 바란다.", 
        hints: ["I hope", "that", "you", "will never", "have", "a chance", "to use", "this kind of", "program"], 
        type: 'arrangement', 
        answer: "I hope that you will never have a chance to use this kind of program." 
      },
      { 
        number: 7, 
        korean: "다양한 장소에서 공부하는 것은 두뇌가 정보를 유지하도록 돕는 것으로 밝혀졌다.", 
        hints: ["Studying", "in", "multiple locations", "has been proven", "to help", "the brain", "retain", "information"], 
        type: 'arrangement', 
        answer: "Studying in multiple locations has been proven to help the brain retain information." 
      },
      { 
        number: 8, 
        korean: "한국 사람들은 삼신할머니가 아기가 태어나도록 북돋기 위해 아기의 엉덩이를 때렸다고 믿어 왔다.", 
        hints: ["Koreans", "have believed", "that", "Samshin Halmoni", "spanked", "the bottom of", "the baby", "to encourage", "him or her", "to be born"], 
        type: 'arrangement', 
        answer: "Koreans have believed that Samshin Halmoni spanked the bottom of the baby to encourage him or her to be born." 
      },
      { 
        number: 9, 
        korean: "포획되어 있는 몇몇 원숭이들과 유인원들은 그들이 다양한 음식을 얻기 위해 교환할 상징물들을 사용하는 것을 배워 왔다.", 
        hints: ["Some monkeys", "and apes", "in captivity", "have learned", "to use", "tokens", "that", "they trade", "for", "various foods"], 
        type: 'arrangement', 
        answer: "Some monkeys and apes in captivity have learned to use tokens that they trade for various foods." 
      },
      { 
        number: 10, 
        korean: "무언가를 하는 것처럼 보이지 않는 사람들은 어떠한 것을 할 충분히 좋은 이유를 찾지 못했다.", 
        hints: ["People", "who", "don't seem", "to do", "anything", "haven't found", "a good enough reason", "to do", "something"], 
        type: 'arrangement', 
        answer: "People who don't seem to do anything haven't found a good enough reason to do something." 
      },
      { 
        number: 11, 
        korean: "가장 최근의 설명 중의 하나는 언어 기술의 부족이었다.", 
        hints: ["a lack of", "explanation", "language skills", "be", "one", "recent"], 
        wordCount: 13, 
        instructions: "현재완료 시제를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "One of the most recent explanations has been a lack of language skills." 
      },
      { 
        number: 12, 
        korean: "과학자들은 유용한 어떤 일도 할 것 같아 보이지 않는 신체 기관에 대해 궁금해 했다.", 
        hints: ["that", "body organs", "wonder about", "useful", "do", "anything", "seem"], 
        wordCount: 13, 
        instructions: "현재완료 시제를 사용할 것, 「seem to-V」를 사용할 것", 
        type: 'arrangement', 
        answer: "Scientists have wondered about body organs that don't seem to do anything useful." 
      },
      { 
        number: 13, 
        korean: "Napoleon은 그의 고통스런 질병 때문에 Waterloo 전투에서 패배했다고 알려져 있다.", 
        hints: ["painful disease", "the battle of", "because of", "lost", "know"], 
        wordCount: 15, 
        instructions: "「to have p.p.」를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "Napoleon is known to have lost the battle of Waterloo because of his painful disease." 
      },
      { 
        number: 14, 
        korean: "당신이 당신의 머릿속에 아이디어들을 가지고만 있다면 당신의 어떤 아이디어도 세상을 바꾸지 않을 것이다.", 
        hints: ["ideas", "the world", "inside of", "keep them", "will", "head", "change"], 
        wordCount: 16, 
        instructions: "None of 포함", 
        type: 'arrangement', 
        answer: "(None of) your ideas will change the world if you keep them inside of your head." 
      },
      { 
        number: 15, 
        korean: "몸의 나머지 부분은 추위를 막아 주었을 훨씬 더 짧은 깃털들로 덮여 있었던 것처럼 보인다.", 
        hints: ["feathers", "the rest of", "keep out", "cover in", "that", "the cold", "would", "much"], 
        wordCount: 21, 
        instructions: "「seem to have been p.p.」를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "The rest of the body seems to have been covered in much shorter feathers that would have kept out the cold." 
      },
    ],
  },
  {
    number: 7,
    title: "조동사가 포함된 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "우리의 조상들은 날 음식을 씹고 갈 때 사랑니로부터 혜택을 받았을지도 모른다.", 
        hints: ["when chewing", "our ancestors", "grinding raw food", "from wisdom teeth", "might have benefited", "and"], 
        type: 'arrangement', 
        answer: "Our ancestors might have benefited from wisdom teeth when chewing and grinding raw food." 
      },
      { 
        number: 2, 
        korean: "컴퓨터 앞에서 너무 많은 시간을 보냄으로써 야기된 건강 문제를 운동이 해결할 수 없다.", 
        hints: ["too much time", "the health problem", "in front of the computer", "exercise cannot fix", "caused by spending"], 
        type: 'arrangement', 
        answer: "Exercise cannot fix the health problem caused by spending too much time in front of the computer." 
      },
      { 
        number: 3, 
        korean: "Jane은 그녀의 아들이 당부했던 것을 그녀가 잊지 말았어야 했다고 혼잣말을 하면서 대화를 끝냈다.", 
        hints: ["what her son", "the conversation", "Jane ended", "had asked", "have forgotten", "that she shouldn't", "telling herself"], 
        type: 'arrangement', 
        answer: "Jane ended the conversation telling herself that she shouldn't have forgotten what her son had asked." 
      },
      { 
        number: 4, 
        korean: "가장 성공한 전문가들 중의 몇몇은 그들이 오늘날 실제로 하고 있는 것을 절대 예측하지 못했을 것이다.", 
        hints: ["have predicted", "the most successful professionals", "do today", "could never ever", "some of", "what they actually"], 
        type: 'arrangement', 
        answer: "Some of the most successful professionals could never ever have predicted what they actually do today." 
      },
      { 
        number: 5, 
        korean: "여러분은 스스로에게 무엇이 작가의 주된 생각인지와 그것에 대한 여러분 자신의 의견은 무엇인지를 계속해서 질문해야 한다.", 
        hints: ["what your own opinion", "what the author's main idea is", "about that is", "and", "keep asking yourself", "you should"], 
        type: 'arrangement', 
        answer: "You should keep asking yourself what the author's main idea is and what your own opinion about that is." 
      },
      { 
        number: 6, 
        korean: "한 편의 글을 시작하는 당신의 첫 번째 목표는 어수선하게 만드는 것이어야 한다.", 
        hints: ["Your first aim", "to begin", "a piece of", "writing", "ought to be", "to make", "a mess"], 
        type: 'arrangement', 
        answer: "Your first aim to begin a piece of writing ought to be to make a mess." 
      },
      { 
        number: 7, 
        korean: "당신은 얼마나 많은 사람들이 이런 단계의 중요성을 이해하지 못하는지에 대해 놀라게 될 것이다.", 
        hints: ["You", "would be", "surprised at", "how many people", "fail to", "understand", "the importance of", "this step"], 
        type: 'arrangement', 
        answer: "You would be surprised at how many people fail to understand the importance of this step." 
      },
      { 
        number: 8, 
        korean: "당신의 추천서가 장학금 위원회로 하여금 나에게 운을 맡겨 보도록 설득했었음이 틀림없다.", 
        hints: ["Your recommendation", "must have", "persuaded", "the scholarship committee", "to take", "a chance", "on me"], 
        type: 'arrangement', 
        answer: "Your recommendation must have persuaded the scholarship committee to take a chance on me." 
      },
      { 
        number: 9, 
        korean: "농부는 주어진 양의 토지는 어느 정도의 노동력에 의해서 작업되어야만 한다는 것을 인식하고 있다.", 
        hints: ["A farmer", "recognizes", "that", "a given amount", "of land", "must be worked", "by", "a certain amount", "of labor"], 
        type: 'arrangement', 
        answer: "A farmer recognizes that a given amount of land must be worked by a certain amount of labor." 
      },
      { 
        number: 10, 
        korean: "직원들이 자신들의 업무 공간을 개인화하도록 허용하는 회사들은 성실한 직원으로 보상받아야 한다.", 
        hints: ["Companies", "that allow", "their employees", "to personalize", "their workspaces", "should be", "rewarded with", "faithful employees"], 
        type: 'arrangement', 
        answer: "Companies that allow their employees to personalize their workspaces should be rewarded with faithful employees." 
      },
      { 
        number: 11, 
        korean: "편지는 사람들이 메시지를 보낼 때 쓰는 보통의 방법이었다.", 
        hints: ["letter", "the usual way", "to send messages", "used to"], 
        wordCount: 12, 
        instructions: "의미상의 주어 「for + 목적격」을 사용할 것", 
        type: 'arrangement', 
        answer: "Letters used to be the usual way for people to send messages." 
      },
      { 
        number: 12, 
        korean: "당신은 신에게 그가 어느 제국을 말했는지 질문했어야 했다.", 
        hints: ["he", "ask", "which empire", "the god", "speak of"], 
        wordCount: 11, 
        instructions: "「should have p.p.」를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "You should have asked the god which empire he spoke of." 
      },
      { 
        number: 13, 
        korean: "이것은 당신의 독자들이 희생자들을 돕기 위해 그들이 할 수 있는 것이 무엇인지 확인하도록 독려할 것이다.", 
        hints: ["encourage", "the victims", "they", "to help", "check out"], 
        wordCount: 16, 
        instructions: "조동사 will, can을 사용할 것", 
        type: 'arrangement', 
        answer: "This will encourage your readers to check out what they can do to help the victims." 
      },
      { 
        number: 14, 
        korean: "그들은 문화의 규칙들이 다르다는 상황들을 식별할 수 있어야 한다.", 
        hints: ["identify", "in which", "should", "the cultures", "situations", "the rules"], 
        wordCount: 16, 
        type: 'arrangement', 
        answer: "They should be able to identify situations in which the rules of the cultures are different." 
      },
      { 
        number: 15, 
        korean: "당신이 얼마만큼의 수면이 필요한지에 대한 최고의 지표는 당신이 어떻게 느끼느냐에 근거를 두어야 한다.", 
        hints: ["sleep", "indicator of", "should be", "how much", "based on"], 
        wordCount: 16, 
        type: 'arrangement', 
        answer: "The best indicator of how much sleep you need should be based on how you feel." 
      },
    ],
  },
  {
    number: 8,
    title: "수동태 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "시골에 사는 것보다 질병과 전염병에 노출될 더 높은 가능성이 있었다.", 
        hints: ["in the country", "to diseases and infections", "of being exposed", "than living", "there was", "a higher chance"], 
        type: 'arrangement', 
        answer: "There was a higher chance of being exposed to diseases and infections than living in the country." 
      },
      { 
        number: 2, 
        korean: "GE 관리자들은 먼지투성이의 낡은 책에서 그것들(해결책)을 찾기보다는 그들 자신의 해결책을 찾도록 배운다.", 
        hints: ["rather than look them up", "are taught", "to find", "in a dusty old book", "GE managers", "their own solutions"], 
        type: 'arrangement', 
        answer: "GE managers are taught to find their own solutions rather than look them up in a dusty old book." 
      },
      { 
        number: 3, 
        korean: "이 방법은 약 4백만 명의 사람들에게 식수를 공급하기 위해 전 세계적으로 현재 사용되고 있다.", 
        hints: ["all over the world", "this method", "for some four million people", "to provide", "drinking water", "is now being used"], 
        type: 'arrangement', 
        answer: "This method is now being used all over the world to provide drinking water for some four million people." 
      },
      { 
        number: 4, 
        korean: "수학 성취 평가를 보기 전에 행복하다고 느끼게 된 학생들은 그들의 중립적인 (기분의) 또래들보다 훨씬 더 잘한다.", 
        hints: ["perform much better", "before taking", "than their neutral peers", "students who", "are made to feel happy", "math achievement tests"], 
        type: 'arrangement', 
        answer: "Students who are made to feel happy before taking math achievement tests perform much better than their neutral peers." 
      },
      { 
        number: 5, 
        korean: "그가 근무 중에 잠들었다고 추정되었던 바로 그날 밤 자정에 그 시계가 13번 울렸다는 것이 밝혀졌다.", 
        hints: ["he was supposed", "it was discovered", "on duty", "had struck thirteen times", "to have fallen asleep", "that the clock", "at midnight on the very night"], 
        type: 'arrangement', 
        answer: "It was discovered that the clock had struck thirteen times at midnight on the very night he was supposed to have fallen asleep on duty." 
      },
      { 
        number: 6, 
        korean: "그 체육관은 수년 동안 경쟁을 해 오던 역도 선수들로 가득했다.", 
        hints: ["The gym", "was filled", "with", "weight lifters", "who", "had been competing", "for years"], 
        type: 'arrangement', 
        answer: "The gym was filled with weight lifters who had been competing for years." 
      },
      { 
        number: 7, 
        korean: "그들의 내부 장기가 격렬하게 변형되는 경험은 흥미 있다고 여겨진다.", 
        hints: ["The experience", "of having", "their internal organs", "rudely", "deformed", "is thought", "exciting"], 
        type: 'arrangement', 
        answer: "The experience of having their internal organs rudely deformed is thought exciting." 
      },
      { 
        number: 8, 
        korean: "이 관용적 표현은 사회적 금기를 포함하는 문제를 설명하기 위해 종종 사용된다.", 
        hints: ["This idiomatic expression", "is", "often used", "to describe", "an issue", "that involves", "a social taboo"], 
        type: 'arrangement', 
        answer: "This idiomatic expression is often used to describe an issue that involves a social taboo." 
      },
      { 
        number: 9, 
        korean: "그런 속임수들은 \"placebo buttons\"라고 불리며 그것들은 모든 종류의 상황에서 강요되고 있다.", 
        hints: ["Such tricks", "are called", "placebo buttons", "and", "they are", "being pushed", "in all sorts of", "contexts"], 
        type: 'arrangement', 
        answer: "Such tricks are called \"placebo buttons\" and they are being pushed in all sorts of contexts." 
      },
      { 
        number: 10, 
        korean: "이런 유인책들은 희귀병을 지닌 개인들의 그 작은 시장들을 위한 약품을 개발하도록 회사들을 장려하기로 되어있다.", 
        hints: ["These incentives", "are meant", "to encourage", "companies", "to develop", "drugs", "for the small markets", "of individuals", "with rare illnesses"], 
        type: 'arrangement', 
        answer: "These incentives are meant to encourage companies to develop drugs for the small markets of individuals with rare illnesses." 
      },
      { 
        number: 11, 
        korean: "아기들은 그들이 배우려고 기대하는 언어에 몰입한다.", 
        hints: ["the language", "babies", "to", "expect", "immerse in", "that"], 
        wordCount: 12, 
        instructions: "필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "Babies are immersed in the language that they are expected to learn." 
      },
      { 
        number: 12, 
        korean: "몇몇 고래들은 멸종 위기 종 목록에서 삭제되었다.", 
        hints: ["from", "remove", "some", "endanger", "whales", "species lists"], 
        wordCount: 9, 
        instructions: "현재완료 수동태를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "Some whales have been removed from endangered species lists." 
      },
      { 
        number: 13, 
        korean: "그 독특한 수송기는 시속 180마일의 속도에 도달했었다고 언급되었다.", 
        hints: ["a speed of", "unique transport", "say", "miles", "reach"], 
        wordCount: 15, 
        instructions: "「to have p.p.」를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "The unique transport was said to have reached a speed of 180 miles an hour." 
      },
      { 
        number: 14, 
        korean: "낮은 속도에서는 높은 속도에서보다 적은 연료가 소비된다는 것이 증명되어 왔다.", 
        hints: ["at high speeds", "less fuel", "prove", "is consumed", "than", "at low speeds"], 
        wordCount: 16, 
        instructions: "「가주어(It) ~ 진주어 (that)」을 사용할 것, 현재완료 수동태를 사용할 것", 
        type: 'arrangement', 
        answer: "It has been proved that less fuel is consumed at low speeds than at high speeds." 
      },
      { 
        number: 15, 
        korean: "당신은 당신이 어떻게 인식되는가에 영향을 미칠 이메일을 받았을지도 모른다.", 
        hints: ["that", "perceive", "receive", "an impact on", "will", "an e-mail", "how"], 
        wordCount: 16, 
        instructions: "「may have p.p.」를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "You may have received an e-mail that will have an impact on how you are perceived." 
      },
    ],
  },
  {
    number: 9,
    title: "목적어가 명사구인 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "그들은 너무 열심히 집중해서 그들은 다가오는 터널이나 다리에 주의할 것을 잊었다.", 
        hints: ["upcoming tunnels", "that they forgot", "or bridges", "to watch for", "they were", "so intensely focused"], 
        type: 'arrangement', 
        answer: "They were so intensely focused that they forgot to watch for upcoming tunnels or bridges." 
      },
      { 
        number: 2, 
        korean: "그들의 자존감이 고양된 실험 대상자들은 그것에 대해 검진받는 것을 원했다.", 
        hints: ["the subjects", "wanted to", "who had their self-esteem", "be tested for it", "raised"], 
        type: 'arrangement', 
        answer: "The subjects who had their self-esteem raised wanted to be tested for it." 
      },
      { 
        number: 3, 
        korean: "당신의 동료들에 의해서 말해지는 당신이 들은 첫 번째 농담은 무엇이 적절한지에 대한 믿음을 형성하는 것을 도와준다.", 
        hints: ["help to form", "what is appropriate", "that you hear", "the first jokes", "a belief about", "told by your colleagues"], 
        type: 'arrangement', 
        answer: "The first jokes that you hear told by your colleagues help to form a belief about what is appropriate." 
      },
      { 
        number: 4, 
        korean: "우리는 그 과정에서 빠져나오는 것을 시작해야 하고 우리의 학생들에게 스스로 여행을 떠나도록 요구하는 것을 시작해야 한다.", 
        hints: ["begin to step out", "to take the journey", "and begin requiring our students", "we should", "of the process", "on their own"], 
        type: 'arrangement', 
        answer: "We should begin to step out of the process and begin requiring our students to take the journey on their own." 
      },
      { 
        number: 5, 
        korean: "그 길은 금이 가 있고 그녀의 휠체어를 여기저기에서 굴리는 것을 불가능하게 만드는 돌멩이들과 파편들로 널려있다.", 
        hints: ["from place to place", "with rocks and debris", "cracked and littered", "the paths are", "to roll her chair", "that make it impossible"], 
        type: 'arrangement', 
        answer: "The paths are cracked and littered with rocks and debris that make it impossible to roll her chair from place to place." 
      },
      { 
        number: 6, 
        korean: "나는 한 개인에 의해서 퍼뜨려진 소문에 대해서 읽었던 것을 기억한다.", 
        hints: ["I remember", "reading about", "a rumor", "that was", "passed along", "by an individual"], 
        type: 'arrangement', 
        answer: "I remember reading about a rumor that was passed along by an individual." 
      },
      { 
        number: 7, 
        korean: "또 다른 예방책은 벌레들이 모이거나 둥지를 트는 장소를 피하는 것을 포함한다.", 
        hints: ["Another prevention technique", "involves", "avoiding", "areas", "where", "insects", "gather", "or nest"], 
        type: 'arrangement', 
        answer: "Another prevention technique involves avoiding areas where insects gather or nest." 
      },
      { 
        number: 8, 
        korean: "나는 계획들의 일부가 바뀔 것임을 예상하는 것이 도움이 된다는 것을 알게 되었다.", 
        hints: ["I have found", "it helpful", "to expect", "that", "a certain percentage", "of plans", "will change"], 
        type: 'arrangement', 
        answer: "I have found it helpful to expect that a certain percentage of plans will change." 
      },
      { 
        number: 9, 
        korean: "그 소년은 그 울타리에 못을 박는 것보다 자신의 화를 참는 것이 더 쉽다는 것을 이해하기 시작했다.", 
        hints: ["The boy", "started to", "understand", "that", "holding his temper", "was easier", "than", "driving nails", "into the fence"], 
        type: 'arrangement', 
        answer: "The boy started to understand that holding his temper was easier than driving nails into the fence." 
      },
      { 
        number: 10, 
        korean: "우리는 학생들이 문제 해결 기술을 배울 기회로서 그 문제들을 사용하도록 허락하는 것이 훨씬 더 효과적임을 알게 되었다.", 
        hints: ["We have found", "it much more effective", "to allow", "students", "to use", "problems", "as an opportunity", "to learn", "problem-solving skills"], 
        type: 'arrangement', 
        answer: "We have found it much more effective to allow students to use problems as an opportunity to learn problem-solving skills." 
      },
      { 
        number: 11, 
        korean: "당신은 당신 스스로 두려운 목표를 좇도록 하는 것을 피하기 시작했다.", 
        hints: ["go after", "avoid", "scary goals", "begin to", "let"], 
        wordCount: 10, 
        instructions: "필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "You began to avoid letting yourself go after scary goals." 
      },
      { 
        number: 12, 
        korean: "아무도 듣는 사람들을 당황스러워 보이게 만드는 이야기를 말하는 것을 원하지 않는다.", 
        hints: ["the listeners", "a story", "puzzle", "wants", "no one", "have", "look"], 
        wordCount: 13, 
        instructions: "필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "No one wants to tell a story to have the listeners look puzzled." 
      },
      { 
        number: 13, 
        korean: "나는 문이 없는 사무실에서는 창의적이 되는 것이 어렵다고 항상 생각해 왔다.", 
        hints: ["in", "hard", "have always thought", "be creative", "doorless"], 
        wordCount: 13, 
        instructions: "「가목적어(it) ~ 진목적어(to-V)」를 사용할 것", 
        type: 'arrangement', 
        answer: "I have always thought it hard to be creative in a doorless office." 
      },
      { 
        number: 14, 
        korean: "나는 선로 위에서 걸어가면서 균형을 잡으려고 노력했던 것을 기억한다.", 
        hints: ["walk", "balance", "try to", "a railroad track", "remember"], 
        wordCount: 11, 
        instructions: "「while + 분사구문」을 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "I remember trying to balance while walking on a railroad track." 
      },
      { 
        number: 15, 
        korean: "돛은 오직 바다에 의해서만 도달할 수 있는 나라들과 무역하는 것을 가능하게 만들었다.", 
        hints: ["could", "the sail", "that", "trade with", "only by sea", "made", "be reached"], 
        wordCount: 16, 
        instructions: "「가목적어(it) ~ 진목적어(to-V)」를 사용할 것", 
        type: 'arrangement', 
        answer: "The sail made it possible to trade with countries that could be reached only by sea." 
      },
    ],
  },
  {
    number: 10,
    title: "목적어가 명사절인 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "생태학자 Rhahyosue는 어떻게 큰 동물의 손실이 자연계에 영향을 주는지를 직접적으로 관찰했다.", 
        hints: ["of large animals", "the ecologist Rhahyosue", "affects the natural world", "how the loss", "has observed directly"], 
        type: 'arrangement', 
        answer: "The ecologist Rhahyosue has observed directly how the loss of large animals affects the natural world." 
      },
      { 
        number: 2, 
        korean: "동일한 응답자들은 그들이 자신들과 탑승자들을 보호하는 차량을 구입하기를 선호한다고 말했다.", 
        hints: ["and their passengers", "to buy cars", "the same respondents", "which protect them", "said that they prefer"], 
        type: 'arrangement', 
        answer: "The same respondents said that they prefer to buy cars which protect them and their passengers." 
      },
      { 
        number: 3, 
        korean: "그는 어떤 친척이 비슷한 질병으로 고통 받았는지를 알아보기 위해 가족 병력에 대해 물어보곤 했다.", 
        hints: ["if any relatives had suffered", "about the family health history", "to see", "from similar diseases", "he would inquire"], 
        type: 'arrangement', 
        answer: "He would inquire about the family health history to see if any relatives had suffered from similar diseases." 
      },
      { 
        number: 4, 
        korean: "그는 자신의 제자들에게 백성들의 행복을 보장하는 것이 지도자의 역할이라고 가르쳤다.", 
        hints: ["that it is the role", "the happiness of their people", "of rulers", "to secure", "his students", "he taught"], 
        type: 'arrangement', 
        answer: "He taught his students that it is the role of rulers to secure the happiness of their people." 
      },
      { 
        number: 5, 
        korean: "다음 예는 상관 관계의 관찰에 기초하여 인과 관계의 진술을 하는 것이 왜 어려운지를 보여 줄 것이다.", 
        hints: ["of correlational observation", "why it is difficult", "the following example", "on the basis", "to make causal statements", "will illustrate"], 
        type: 'arrangement', 
        answer: "The following example will illustrate why it is difficult to make causal statements on the basis of correlational observation." 
      },
      { 
        number: 6, 
        korean: "우리는 우리의 다음 여름휴가가 우리로 하여금 어떤 느낌이 들게 하는지를 추정한다.", 
        hints: ["We estimate", "how", "our next", "summer vacation", "will make", "us", "feel"], 
        type: 'arrangement', 
        answer: "We estimate how our next summer vacation will make us feel." 
      },
      { 
        number: 7, 
        korean: "사람들은 그들에게 가장 이익이 되는 것을 행동함으로써 장려금에 반응한다.", 
        hints: ["People respond", "to incentives", "by doing", "what is", "in their", "best interests"], 
        type: 'arrangement', 
        answer: "People respond to incentives by doing what is in their best interests." 
      },
      { 
        number: 8, 
        korean: "여러분은 종잇조각이나 분필 가루가 그 펜에 달라붙는 것을 발견할 것이다.", 
        hints: ["You will find", "that", "the bits of", "paper", "or chalk dust", "cling to", "the pen"], 
        type: 'arrangement', 
        answer: "You will find that the bits of paper or chalk dust cling to the pen." 
      },
      { 
        number: 9, 
        korean: "그는 전통적인 배급 방식을 찾는 것이 거의 불가능하다는 것을 알았다.", 
        hints: ["He knew", "that", "looking for", "conventional distribution", "would be", "almost impossible"], 
        type: 'arrangement', 
        answer: "He knew that looking for conventional distribution would be almost impossible." 
      },
      { 
        number: 10, 
        korean: "그녀는 누구에게도 특정한 사람들이 유리한 점을 갖고 있다는 인상을 주지 않는다.", 
        hints: ["She does not", "give", "anyone", "the impression", "that", "certain people", "have", "an advantage"], 
        type: 'arrangement', 
        answer: "She does not give anyone the impression that certain people have an advantage." 
      },
      { 
        number: 11, 
        korean: "나는 그 천사들 중 한 명에게 왜 그가 치료를 받지 않았는지를 물었다.", 
        hints: ["been", "had", "he", "of", "the angels", "healed", "ask"], 
        wordCount: 12, 
        instructions: "간접의문문을 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "I asked one of the angels why he had not been healed." 
      },
      { 
        number: 12, 
        korean: "언어적 지식이 네가 사회적으로 적절한 발화를 이해하고 만들어 낼 수 있다는 것을 보장하지 않는다.", 
        hints: ["appropriate", "speech", "produce", "guarantee", "social", "linguistic knowledge", "understand", "that"], 
        wordCount: 14, 
        instructions: "필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "Linguistic knowledge does not guarantee that you can understand and produce socially appropriate speech." 
      },
      { 
        number: 13, 
        korean: "어떤 사람들은 그들의 피가 그들을 부상으로부터 보호해 준다는 전설을 믿었다.", 
        hints: ["wounds", "their blood", "some", "them", "myths", "could"], 
        wordCount: 12, 
        instructions: "동격 구문을 사용할 것", 
        type: 'arrangement', 
        answer: "Some people believed myths that their blood could protect them from wounds." 
      },
      { 
        number: 14, 
        korean: "그들은 달이 얼마나 큰지 그리고 그것이 얼마나 멀리 있는지 알기를 원했다.", 
        hints: ["was", "big", "it", "wanted", "far away", "the moon", "how"], 
        wordCount: 15, 
        instructions: "간접의문문을 사용할 것, 단어 중복 사용 가능", 
        type: 'arrangement', 
        answer: "They wanted to know how big the moon was and how far away it was." 
      },
      { 
        number: 15, 
        korean: "이 모델에서의 문제점은 한 사람이 얼마나 많이 웃을지를 그것이 보장하지 못한다는 것이다.", 
        hints: ["that", "the problem", "guarantee", "does", "is", "it", "a person", "in this model", "will"], 
        wordCount: 17, 
        instructions: "간접의문문을 사용할 것", 
        type: 'arrangement', 
        answer: "The problem in this model is that it does not guarantee how much a person will laugh." 
      },
    ],
  },
  // UNIT 11: 목적어가 형용사구의 수식을 받는 문장 쓰기
  {
    number: 11,
    title: "목적어가 형용사구의 수식을 받는 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "그는 낯선 상징들과 기호들로 덮인 종이들로 가득한 서류 가방만을 들고 있었다.", 
        hints: ["only a briefcase", "covered with odd symbols and codes", "filled with sheets of paper", "he carried"], 
        type: 'arrangement', 
        answer: "He carried only a briefcase filled with sheets of paper covered with odd symbols and codes." 
      },
      { 
        number: 2, 
        korean: "나의 교수님들 중 한 분이 나에게 도움을 요청하는 그 사연을 신문에 내 보라는 의견을 주셨다.", 
        hints: ["an idea", "in a newspaper", "gave me", "to publish the story", "asking for help", "one of my professors"], 
        type: 'arrangement', 
        answer: "One of my professors gave me an idea to publish the story in a newspaper asking for help." 
      },
      { 
        number: 3, 
        korean: "여가 활동으로 다이빙을 하는 사람들은 얕은 물에서 그들이 그것으로 호흡할 수 있도록 마스크에 연결된 스노클을 사용한다.", 
        hints: ["linked to a mask", "so that", "in shallow water", "recreational divers use", "they can breathe with it", "a snorkel"], 
        type: 'arrangement', 
        answer: "Recreational divers use a snorkel linked to a mask so that they can breathe with it in shallow water." 
      },
      { 
        number: 4, 
        korean: "그는 나에게 실수로 플래시 메모리 카드에서 삭제되었던 사진들을 복구하도록 고안된 어떤 프로그램을 보냈다.", 
        hints: ["a certain program", "from flash memory cards", "by mistake", "he sent me", "that were deleted", "designed to recover photos"], 
        type: 'arrangement', 
        answer: "He sent me a certain program designed to recover photos that were deleted from flash memory cards by mistake." 
      },
      { 
        number: 5, 
        korean: "정부의 전략은 사람들의 필요를 충족시킬 다양한 크기의 신발을 생산할 어떤 동기도 제공하지 못했다.", 
        hints: ["that met people's needs", "did not provide", "any motivation", "in various sizes", "the government's strategy", "to produce shoes"], 
        type: 'arrangement', 
        answer: "The government's strategy did not provide any motivation to produce shoes in various sizes that met people's needs." 
      },
      { 
        number: 6, 
        korean: "그 수컷들은 복부의 끝까지 뻗어 있는 뒷날개를 가지고 있다.", 
        hints: ["The males", "have", "rear wings", "extending", "to", "the end of", "the belly"], 
        type: 'arrangement', 
        answer: "The males have rear wings extending to the end of the belly." 
      },
      { 
        number: 7, 
        korean: "그는 양쪽이 이익을 얻게 해주었던 합의를 통해 가치를 창출하는 기회를 찾아냈다.", 
        hints: ["He found", "the opportunity", "to create", "value", "through agreements", "that made", "both parties", "gain benefits"], 
        type: 'arrangement', 
        answer: "He found the opportunity to create value through agreements that made both parties gain benefits." 
      },
      { 
        number: 8, 
        korean: "그러한 오해는 사회 언어학적 발화 규칙의 존재에 대한 증거를 제공한다.", 
        hints: ["Such misunderstanding", "offers", "evidence", "for the existence of", "sociolinguistic rules", "of speaking"], 
        type: 'arrangement', 
        answer: "Such misunderstanding offers evidence for the existence of sociolinguistic rules of speaking." 
      },
      { 
        number: 9, 
        korean: "그는 한 병원이 신장 문제를 가진 환자들에게 무료로 치료를 해 주고 있다고 이야기하는 한 통의 편지를 썼다.", 
        hints: ["He wrote", "a letter", "saying that", "a hospital", "is providing", "free medical treatment", "for patients", "with kidney problems"], 
        type: 'arrangement', 
        answer: "He wrote a letter saying that a hospital is providing free medical treatment for patients with kidney problems." 
      },
      { 
        number: 10, 
        korean: "쌍봉낙타는 먹을 것이 없을 때 물과 에너지로 전환될 수 있는 지방을 저장하는 두 개의 혹을 가지고 있다.", 
        hints: ["Bactrian camels", "have", "two humps", "storing fat", "which", "can be converted", "to water and energy", "when food", "is not available"], 
        type: 'arrangement', 
        answer: "Bactrian camels have two humps storing fat which can be converted to water and energy when food is not available." 
      },
      { 
        number: 11, 
        korean: "우리는 그들이 자립할 수 있도록 도와주는 방법을 찾아야 한다.", 
        hints: ["stand", "have to", "them", "a way", "on their own two feet"], 
        wordCount: 15, 
        instructions: "수식어구로 to-V를 사용할 것", 
        type: 'arrangement', 
        answer: "We have to find a way to help them stand on their own two feet." 
      },
      { 
        number: 12, 
        korean: "우리는 우리를 위해 그리고 우리와 함께 일하는 사람들을 격려해왔다.", 
        hints: ["encourage", "for and with", "the people"], 
        wordCount: 10, 
        instructions: "수식어구로 -ing를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "We have encouraged the people working for and with us." 
      },
      { 
        number: 13, 
        korean: "원주민들은 비타민 A와 같은 필수 영양분으로 가득한 녹색 채소들을 재배하지 않는다.", 
        hints: ["vitamin A", "such as", "vital nutrients", "grow", "native people", "pack with"], 
        wordCount: 15, 
        instructions: "수식어구로 p.p.를 사용할 것", 
        type: 'arrangement', 
        answer: "Native people do not grow green vegetables packed with vital nutrients such as vitamin A." 
      },
      { 
        number: 14, 
        korean: "수집을 하는 것은 아이들에게 일상에서 사용될 수 있는 기술을 배울 기회를 준다.", 
        hints: ["opportunities", "collecting", "skills", "can", "that", "use every day"], 
        wordCount: 13, 
        instructions: "수식어구로 to-V를 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "Collecting gives children opportunities to learn skills that can be used every day." 
      },
      { 
        number: 15, 
        korean: "Alexander는 그 의사가 그의 주군을 독살하도록 뇌물을 받았다고 고발하는 편지 한 통을 받았다.", 
        hints: ["received", "master", "to poison", "of having been bribed", "the physician", "accuse"], 
        wordCount: 15, 
        instructions: "수식어구로 -ing를 사용할 것", 
        type: 'arrangement', 
        answer: "Alexander received a letter accusing the physician of having been bribed to poison his master." 
      },
    ],
  },
  // UNIT 12: 목적어가 형용사절의 수식을 받는 문장 쓰기
  {
    number: 12,
    title: "목적어가 형용사절의 수식을 받는 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "지구의 질량 이동은 지구가 자전하는 축의 위치를 변화시켜 왔다.", 
        hints: ["of the axis", "has changed", "the location", "on which Earth rotates", "the shift", "in Earth's mass"], 
        type: 'arrangement', 
        answer: "The shift in Earth's mass has changed the location of the axis on which Earth rotates." 
      },
      { 
        number: 2, 
        korean: "나는 자신의 가장 친한 친구가 그의 동네에 있는 한 노인이라고 말한 한 소년을 만났다.", 
        hints: ["that his best friend", "I met a boy", "on his street", "who told me", "was an elderly man"], 
        type: 'arrangement', 
        answer: "I met a boy who told me that his best friend was an elderly man on his street." 
      },
      { 
        number: 3, 
        korean: "당신은 어떤 사람들이 현재 회의와 관련이 없는 일을 처리하고 있는 것을 볼 것이다.", 
        hints: ["to the current meeting", "you will see", "that is unrelated", "that some people", "are taking care of work"], 
        type: 'arrangement', 
        answer: "You will see that some people are taking care of work that is unrelated to the current meeting." 
      },
      { 
        number: 4, 
        korean: "Bull은 배우들이 덴마크어보다는 오히려 노르웨이어로 공연하는 최초의 극장을 공동 설립했다.", 
        hints: ["in which actors", "rather than Danish", "Bull cofounded", "the first theater", "performed in Norwegian"], 
        type: 'arrangement', 
        answer: "Bull cofounded the first theater in which actors performed in Norwegian rather than Danish." 
      },
      { 
        number: 5, 
        korean: "Rasputin은 중병에 걸린 아들이 있는 러시아 황후를 포함하여 많은 사람들을 자신에게 끌어당기는 강한 매력을 갖고 있었다.", 
        hints: ["including the Russian empress", "Rasputin had a strong charm", "to him", "that drew many people", "who had a seriously ill son"], 
        type: 'arrangement', 
        answer: "Rasputin had a strong charm that drew many people to him including the Russian empress who had a seriously ill son." 
      },
      { 
        number: 6, 
        korean: "거짓말은 인간의 의사소통이 신뢰하는 진실 말하기의 일반적인 관행을 약화시킨다.", 
        hints: ["Lying", "weakens", "the general practice", "of truth telling", "on which", "human communication", "relies"], 
        type: 'arrangement', 
        answer: "Lying weakens the general practice of truth telling on which human communication relies." 
      },
      { 
        number: 7, 
        korean: "우리는 표면적인 수준의 글 읽기보다는 아이들이 더 깊이 탐구하는 것을 가능하게 해 주는 면밀한 글 읽기를 계획한다.", 
        hints: ["We design", "close readings", "that enable", "kids", "to explore", "more deeply", "than", "surface-level reading"], 
        type: 'arrangement', 
        answer: "We design close readings that enable kids to explore more deeply than surface-level reading." 
      },
      { 
        number: 8, 
        korean: "단지 어떤 물건을 만져 보는 것이 어떤 사람이 그 물건에 가지는 소유욕을 증가시킨다.", 
        hints: ["Merely touching", "an object", "increases", "the feelings of ownership", "that", "a person has", "for the object"], 
        type: 'arrangement', 
        answer: "Merely touching an object increases the feelings of ownership that a person has for the object." 
      },
      { 
        number: 9, 
        korean: "그들에게 진실을 말하는 것이 그들의 신체적 쇠약을 가속화하는 우울함을 아마도 유발할 수 있을 것이다.", 
        hints: ["Telling them", "the truth", "could possibly", "induce", "a depression", "that would accelerate", "their physical decline"], 
        type: 'arrangement', 
        answer: "Telling them the truth could possibly induce a depression that would accelerate their physical decline." 
      },
      { 
        number: 10, 
        korean: "개인적인 의견을 공유하는 것이 음식이나 돈과 같은 보상에 반응하는 동일한 두뇌 회로를 활성화시켰다.", 
        hints: ["Sharing", "personal opinions", "activated", "the same brain circuits", "that respond to", "rewards", "like food and money"], 
        type: 'arrangement', 
        answer: "Sharing personal opinions activated the same brain circuits that respond to rewards like food and money." 
      },
      { 
        number: 11, 
        korean: "한 가족이 내가 청각 장애인 학생들을 가르치는 공립 초등학교를 방문했다.", 
        hints: ["deaf students", "the public elementary school", "a family", "taught"], 
        wordCount: 12, 
        instructions: "관계부사를 사용할 것", 
        type: 'arrangement', 
        answer: "A family visited the public elementary school where I taught deaf students." 
      },
      { 
        number: 12, 
        korean: "그들은 그들의 죽어 가는 지역 사회를 부흥시킬지도 모를 무언가를 하는 것을 원했다.", 
        hints: ["do something", "die", "might revive", "their", "community", "that"], 
        wordCount: 11, 
        instructions: "필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "They wanted to do something that might revive their dying community." 
      },
      { 
        number: 13, 
        korean: "당신이 만나는 사람이 당신에게 이익을 줄 수 있는 많은 친구들을 갖고 있을지도 모른다.", 
        hints: ["may have", "can benefit", "many", "the person", "who", "whom"], 
        wordCount: 13, 
        type: 'arrangement', 
        answer: "The person whom you meet may have many friends who can benefit you." 
      },
      { 
        number: 14, 
        korean: "그녀는 나에게 교통사고 후에 고통을 겪고 있는 내 친구 Kathy를 떠오르게 했다.", 
        hints: ["of", "suffer", "was", "after a car accident", "who", "reminded"], 
        wordCount: 14, 
        instructions: "필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "She reminded me of my friend Kathy who was suffering after a car accident." 
      },
      { 
        number: 15, 
        korean: "그 선생님은 그가 그 질문들 중에서 13개를 다룬 긴 답장을 다시 써서 보냈다.", 
        hints: ["of the questions", "wrote back", "dealt with", "a long reply"], 
        wordCount: 16, 
        instructions: "「전치사(in) + 관계대명사」를 사용할 것", 
        type: 'arrangement', 
        answer: "The teacher wrote back a long reply in which he dealt with thirteen of the questions." 
      },
    ],
  },
  // UNIT 13: 주격보어가 길어진 문장 쓰기
  {
    number: 13,
    title: "주격보어가 길어진 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "그 버튼의 실제 목적은 우리가 신호등에 영향을 끼칠 수 있다고 우리를 믿게 만드는 것이다.", 
        hints: ["us believe", "on the traffic lights", "is to make", "that we have an influence", "the button's real purpose"], 
        type: 'arrangement', 
        answer: "The button's real purpose is to make us believe that we have an influence on the traffic lights." 
      },
      { 
        number: 2, 
        korean: "75세의 수명은 우리의 삶에서 혼자서 중요한 것을 배우기에 많은 시간이 아니다.", 
        hints: ["what matters", "to learn", "a lifespan of 75", "in our life", "by ourselves", "is not much time"], 
        type: 'arrangement', 
        answer: "A lifespan of 75 is not much time to learn what matters in our life by ourselves." 
      },
      { 
        number: 3, 
        korean: "이러한 순환은 왜 생명이 수백만 년 동안 우리 행성에서 번창해 왔는지의 근본적인 이유이다.", 
        hints: ["on our planet", "why life has thrived", "is the fundamental reason", "for millions of years", "this cycle"], 
        type: 'arrangement', 
        answer: "This cycle is the fundamental reason why life has thrived on our planet for millions of years." 
      },
      { 
        number: 4, 
        korean: "토론은 사람들이 그들의 발표 불안을 관리하도록 허락해 주는 대응 전략을 개발하는 데 이상적인 환경이다.", 
        hints: ["to develop coping strategies", "that allow people", "their speech anxiety", "to manage", "debate is an ideal setting"], 
        type: 'arrangement', 
        answer: "Debate is an ideal setting to develop coping strategies that allow people to manage their speech anxiety." 
      },
      { 
        number: 5, 
        korean: "구매 운동은 소비자들에게 가장 사회적으로 책임을 다하는 기업 관행을 만들기 위한 힘을 실어 주는 긍정적인 실천주의자적 도구이다.", 
        hints: ["business practices", "buycotting is", "to make the most socially responsible", "a positive activist tool", "that gives consumers power"], 
        type: 'arrangement', 
        answer: "Buycotting is a positive activist tool that gives consumers power to make the most socially responsible business practices." 
      },
      { 
        number: 6, 
        korean: "그것이 왜 우리가 이 감각을 무시할 수 없는지의 이유들 중의 하나이다.", 
        hints: ["That", "is", "one", "of", "the", "reasons", "why", "we", "can't", "ignore", "this", "sense"], 
        type: 'arrangement', 
        answer: "That is one of the reasons why we can't ignore this sense." 
      },
      { 
        number: 7, 
        korean: "동떨어진 이야기의 진짜 위험은 그것의 원래 의도가 뒤집힐 수도 있다는 것이다.", 
        hints: ["The", "real", "danger", "of", "an", "isolated", "story", "is", "that", "its", "original", "intention", "can", "be", "reversed"], 
        type: 'arrangement', 
        answer: "The real danger of an isolated story is that its original intention can be reversed." 
      },
      { 
        number: 8, 
        korean: "열정은 당신이 사람이나 사물에 대해서 가질 수 있는 강렬한 감정이다.", 
        hints: ["Passion", "is", "a", "strong", "emotion", "that", "you", "can", "have", "for", "a", "person", "or", "an", "object"], 
        type: 'arrangement', 
        answer: "Passion is a strong emotion that you can have for a person or an object." 
      },
      { 
        number: 9, 
        korean: "유일한 문제는 학생들로 가득한 전체 교실 앞에서 내가 말을 해야만 했던 것이었다.", 
        hints: ["The", "only", "problem", "was", "that", "I", "had", "to", "speak", "in", "front", "of", "a", "whole", "classroom", "full", "of", "students"], 
        type: 'arrangement', 
        answer: "The only problem was that I had to speak in front of a whole classroom full of students." 
      },
      { 
        number: 10, 
        korean: "이 이야기는 원주민들이 그들 주변의 세계를 이해하기 위해서 만들어 낸 전설의 좋은 예이다.", 
        hints: ["This", "story", "is", "a", "good", "example", "of", "a", "legend", "which", "native", "people", "invented", "to", "make", "sense", "of", "the", "world", "around", "them"], 
        type: 'arrangement', 
        answer: "This story is a good example of a legend which native people invented to make sense of the world around them." 
      },
      { 
        number: 11, 
        korean: "그것들 중 하나는 구강 청결제가 입 냄새를 사라지게 만들 것이라는 것이다.", 
        hints: ["bad breath", "them", "go away", "mouthwash", "that", "will make"], 
        wordCount: 12, 
        type: 'arrangement', 
        answer: "One of them is that mouthwash will make bad breath go away." 
      },
      { 
        number: 12, 
        korean: "그 목적은 사람의 몸에 숨겨져 있을지도 모르는 폭발물을 찾아내는 것이다.", 
        hints: ["explosives", "hide", "a person's body", "to identify", "may", "that", "on"], 
        wordCount: 13, 
        type: 'arrangement', 
        answer: "The purpose is to identify explosives that may be hidden on a person's body." 
      },
      { 
        number: 13, 
        korean: "이것은 부모가 그들에게 책을 읽히는 일부 학생들에게는 사실이 덜하다.", 
        hints: ["less", "some", "read books", "them", "parents", "true of", "whose", "make"], 
        wordCount: 13, 
        type: 'arrangement', 
        answer: "This is less true of some students whose parents make them read books." 
      },
      { 
        number: 14, 
        korean: "야외 공간은 기분이 좋고 잘 지내기 위해서 그들이 필요로 하는 것들 중 하나이다.", 
        hints: ["feel good", "outdoor space", "do well", "the things", "need to", "that"], 
        wordCount: 16, 
        type: 'arrangement', 
        answer: "Outdoor space is one of the things that they need to feel good and do well." 
      },
      { 
        number: 15, 
        korean: "당신의 가치관을 알아보는 방법들 중 하나는 무엇이 당신을 좌절시키거나 당황하게 하는지를 살펴보는 것이다.", 
        hints: ["to look at", "to identify", "the ways", "frustrates", "your values", "what", "upsets"], 
        wordCount: 17, 
        type: 'arrangement', 
        answer: "One of the ways to identify your values is to look at what frustrates or upsets you." 
      },
    ],
  },
  // UNIT 14: 목적격보어가 길어진 문장 쓰기
  {
    number: 14,
    title: "목적격보어가 길어진 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "우리는 우리의 이웃들이 동네 파티를 돕도록 유도한다.", 
        hints: ["to help out with", "our neighbors", "we induce", "a neighborhood party"], 
        type: 'arrangement', 
        answer: "We induce our neighbors to help out with a neighborhood party." 
      },
      { 
        number: 2, 
        korean: "그들은 최고의 예측 변인이 탑승자가 가지고 있던 문신의 수라는 것을 발견했다.", 
        hints: ["that the rider had", "to be the number", "the best predictor", "of tattoos", "they found"], 
        type: 'arrangement', 
        answer: "They found the best predictor to be the number of tattoos that the rider had." 
      },
      { 
        number: 3, 
        korean: "일정이 잡히지 않은 시간은 당신이 우선순위가 높은 일을 끝내고 당신 업무의 예상치 못한 요구들에 응하도록 도와준다.", 
        hints: ["and meet", "of your business", "unscheduled time", "helps you", "the unanticipated demands", "get the high priorities done"], 
        type: 'arrangement', 
        answer: "Unscheduled time helps you get the high priorities done and meet the unanticipated demands of your business." 
      },
      { 
        number: 4, 
        korean: "혼자 있는 시간은 사람들이 그들의 경험을 정리하고, 통찰하고, 미래를 계획하도록 허락한다.", 
        hints: ["through their experiences", "time alone allows", "put them into perspective", "people to sort", "and plan for the future"], 
        type: 'arrangement', 
        answer: "Time alone allows people to sort through their experiences, put them into perspective, and plan for the future." 
      },
      { 
        number: 5, 
        korean: "구매 운동은 회사들이 가장 이익이 되는 선택은 사회에 대한 그들의 책임을 이행하는 것이라는 사실을 깨닫도록 만든다.", 
        hints: ["is to fulfill", "corporations realize", "their responsibilities", "to society", "that the most profitable choice", "buycotts make"], 
        type: 'arrangement', 
        answer: "Buycotts make corporations realize that the most profitable choice is to fulfill their responsibilities to society." 
      },
      { 
        number: 6, 
        korean: "연구자들은 참가자들에게 자율 자동차(AV)가 어떻게 작동하고 제어하기를 원하는지 물었다.", 
        hints: ["Researchers", "asked", "participants", "how", "they", "would", "want", "their", "AVs", "to", "behave", "and", "control"], 
        type: 'arrangement', 
        answer: "Researchers asked participants how they would want their AVs to behave and control." 
      },
      { 
        number: 7, 
        korean: "몇몇 다른 개들은 사람들이 해충들로부터 집을 안전하게 유지하도록 도와준다.", 
        hints: ["Some", "other", "dogs", "help", "people", "keep", "their", "homes", "safe", "from", "harmful", "insects"], 
        type: 'arrangement', 
        answer: "Some other dogs help people keep their homes safe from harmful insects." 
      },
      { 
        number: 8, 
        korean: "이런 쌍둥이들은 과학자들이 환경과 생물학의 관계를 이해하도록 도와준다.", 
        hints: ["These", "twins", "help", "scientists", "understand", "the", "connection", "between", "environment", "and", "biology"], 
        type: 'arrangement', 
        answer: "These twins help scientists understand the connection between environment and biology." 
      },
      { 
        number: 9, 
        korean: "나는 여러분이 생각할 수 있는 장소를 찾고 잠시 멈추고 그것을 사용할 수 있도록 여러분 자신을 훈련시킬 것을 강력하게 권장한다.", 
        hints: ["I", "strongly", "encourage", "you", "to", "find", "a", "place", "to", "think", "and", "to", "discipline", "yourself", "to", "pause", "and", "use", "it"], 
        type: 'arrangement', 
        answer: "I strongly encourage you to find a place to think and to discipline yourself to pause and use it." 
      },
      { 
        number: 10, 
        korean: "이런 종류의 유전 추적은 의사들이 어떤 사람이 병에 걸리게 될 가능성을 예측하고 그것을 진단하도록 도와준다.", 
        hints: ["This", "kind", "of", "genetic", "tracking", "helps", "doctors", "to", "predict", "the", "likelihood", "of", "a", "person", "getting", "a", "disease", "and", "to", "diagnose", "it"], 
        type: 'arrangement', 
        answer: "This kind of genetic tracking helps doctors to predict the likelihood of a person getting a disease and to diagnose it." 
      },
      { 
        number: 11, 
        korean: "나는 그 학생들이 그들이 어떤 책들을 읽었다고 말하는 것을 종종 듣는다.", 
        hints: ["the students", "certain", "often", "say", "hear", "read"], 
        wordCount: 12, 
        instructions: "현재완료를 사용할 것", 
        type: 'arrangement', 
        answer: "I often hear the students say that they have read certain books." 
      },
      { 
        number: 12, 
        korean: "컴퓨터는 TV가 그랬던 것보다 더 많은 학생들이 잠 못 드는 밤을 보내도록 야기했다.", 
        hints: ["have", "computers", "did", "sleepless nights", "caused"], 
        wordCount: 11, 
        instructions: "「more ~ than」의 비교 구문을 사용할 것", 
        type: 'arrangement', 
        answer: "Computers caused more students to have sleepless nights than TV did." 
      },
      { 
        number: 13, 
        korean: "우리는 우리의 중요한 타인들이 우리를 위해 무언가를 하도록 격려한다.", 
        hints: ["do things", "encourage", "significant others", "for us"], 
        wordCount: 10, 
        type: 'arrangement', 
        answer: "We encourage our significant others to do things for us." 
      },
      { 
        number: 14, 
        korean: "이것은 그 학생들이 다른 관점으로 세상을 보도록 가르칠 것이다.", 
        hints: ["from", "different", "the world", "teach", "to see", "points of view"], 
        wordCount: 14, 
        type: 'arrangement', 
        answer: "This will teach the students to see the world from different points of view." 
      },
      { 
        number: 15, 
        korean: "그의 아버지는 그의 아들이 그가 시작하고 있던 새 의류 사업에 그와 함께해 줄 것을 부탁했다.", 
        hints: ["a new clothing business", "join him in", "was starting", "that"], 
        wordCount: 17, 
        type: 'arrangement', 
        answer: "His father asked his son to join him in a new clothing business that he was starting." 
      },
    ],
  },
  // UNIT 15: 부사구를 포함하는 문장 쓰기 (1)
  {
    number: 15,
    title: "부사구를 포함하는 문장 쓰기 (1)",
    problems: [
      { 
        number: 1, 
        korean: "1년 후, 그 신문은 화재로 잠시 동안 휴간되었다.", 
        hints: ["was discontinued", "a year later", "the newspaper", "due to", "for a while", "a fire"], 
        type: 'arrangement', 
        answer: "A year later, the newspaper was discontinued for a while due to a fire." 
      },
      { 
        number: 2, 
        korean: "그는 그 지역의 풍부한 자원 덕분에 그가 그 성을 건설했다고 생각했다.", 
        hints: ["that he had constructed", "he thought", "the castle", "thanks to the rich resources", "of the region"], 
        type: 'arrangement', 
        answer: "He thought that he had constructed the castle thanks to the rich resources of the region." 
      },
      { 
        number: 3, 
        korean: "그 조사는 무엇이 정말 잘못됐는지를 알아낼 목적으로 만들어졌다.", 
        hints: ["finding out", "was made", "what really went wrong", "the investigation", "for the purpose of"], 
        type: 'arrangement', 
        answer: "The investigation was made for the purpose of finding out what really went wrong." 
      },
      { 
        number: 4, 
        korean: "간디는 힌두교도와 이슬람교도 사이의 싸움에 반대하기 위해서 단식을 시작했다.", 
        hints: ["the fighting", "Gandhi", "to protest", "started fasting", "between", "Hindu and Muslims"], 
        type: 'arrangement', 
        answer: "Gandhi started fasting to protest the fighting between Hindu and Muslims." 
      },
      { 
        number: 5, 
        korean: "길달리기새는 그것이 방울뱀조차도 잡아먹을 정도로 충분히 빠르기 때문에 스피드로 유명하다.", 
        hints: ["is famous", "to catch and eat", "because it is", "a roadrunner", "fast enough", "for its speed", "even a rattlesnake"], 
        type: 'arrangement', 
        answer: "A roadrunner is famous for its speed because it is fast enough to catch and eat even a rattlesnake." 
      },
      { 
        number: 6, 
        korean: "이탈리아 정부는 19세기 중반에 포로들을 Lampedusa로 보냈다.", 
        hints: ["The", "Italian", "government", "sent", "prisoners", "to", "Lampedusa", "in", "the", "middle", "of", "the", "19th", "century"], 
        type: 'arrangement', 
        answer: "The Italian government sent prisoners to Lampedusa in the middle of the 19th century." 
      },
      { 
        number: 7, 
        korean: "의사들에 따르면, 당신의 머리카락이 회색으로 변하는 것은 당신의 가족에서 유전된다.", 
        hints: ["According", "to", "medical", "doctors", "your", "hair", "turning", "gray", "runs", "in", "your", "family"], 
        type: 'arrangement', 
        answer: "According to medical doctors, your hair turning gray runs in your family." 
      },
      { 
        number: 8, 
        korean: "다른 사람들과 물건 공유하기를 꺼리는 사람들은 외롭다고 느끼기 쉽다.", 
        hints: ["Those", "who", "are", "reluctant", "to", "share", "things", "with", "others", "are", "liable", "to", "feel", "lonely"], 
        type: 'arrangement', 
        answer: "Those who are reluctant to share things with others are liable to feel lonely." 
      },
      { 
        number: 9, 
        korean: "나는 분개심과 두려움에 너무나 소진되어서 암 진단의 고통을 느낄 수 없었다.", 
        hints: ["I", "was", "too", "consumed", "with", "resentment", "and", "fear", "to", "feel", "the", "pain", "of", "the", "diagnosis", "of", "cancer"], 
        type: 'arrangement', 
        answer: "I was too consumed with resentment and fear to feel the pain of the diagnosis of cancer." 
      },
      { 
        number: 10, 
        korean: "초음파는 몸 안에 있는 대상에 음파를 반사함으로써 이미지를 만든다.", 
        hints: ["Ultrasound", "produces", "an", "image", "by", "bouncing", "sound", "waves", "off", "an", "object", "inside", "the", "body"], 
        type: 'arrangement', 
        answer: "Ultrasound produces an image by bouncing sound waves off an object inside the body." 
      },
      { 
        number: 11, 
        korean: "그 문제를 답하기 위해서, 우리는 정반대의 상황을 알아야만 한다.", 
        hints: ["the question", "the opposite cases", "answer", "should"], 
        wordCount: 10, 
        instructions: "to-V로 시작할 것", 
        type: 'arrangement', 
        answer: "To answer the question, we should know the opposite cases." 
      },
      { 
        number: 12, 
        korean: "너의 남자 친구는 시간을 지키는 것이 너에게 얼마나 중요한지 알고 있음에도 불구하고 데이트에 항상 늦게 나올지도 모른다.", 
        hints: ["promptness", "show up", "in spite of", "how important", "know", "might"], 
        wordCount: 19, 
        instructions: "필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "Your boyfriend might always show up late for dates in spite of knowing how important promptness is to you." 
      },
      { 
        number: 13, 
        korean: "이런 근본적인 두려움의 결과로서, 우리는 관계, 사업, 그리고 인생에서 거절당하는 것을 걱정한다.", 
        hints: ["reject", "as a result of", "business", "life", "relationships", "we'll", "fundamental"], 
        wordCount: 18, 
        instructions: "필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "As a result of this fundamental fear, we worry that we'll be rejected in relationships, business, and life." 
      },
      { 
        number: 14, 
        korean: "그는 그 앞에 놓여 있는 힘든 일을 생각하니 매우 우울해졌다.", 
        hints: ["quite", "depress", "ahead of", "hard", "the thought", "felt"], 
        wordCount: 14, 
        instructions: "필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "He felt quite depressed at the thought of the hard work ahead of him." 
      },
      { 
        number: 15, 
        korean: "그 야구팀 선수들은 최선을 다했지만 결국 경기에서 졌다.", 
        hints: ["lose", "the members", "their best", "the game"], 
        wordCount: 14, 
        instructions: "「only + to-V」를 사용할 것", 
        type: 'arrangement', 
        answer: "The members of the baseball team did their best only to lose the game." 
      },
    ],
  },
  // UNIT 16: 부사구를 포함하는 문장 쓰기 (2)
  {
    number: 16,
    title: "부사구를 포함하는 문장 쓰기 (2)",
    problems: [
      { 
        number: 1, 
        korean: "그 소년은 자신의 팔을 친구 앞으로 두어서, 내가 먼저 가도록 손짓했다.", 
        hints: ["put his arm", "for me", "motioning", "to go ahead", "in front of his friend"], 
        type: 'arrangement', 
        answer: "The boy put his arm in front of his friend, motioning for me to go ahead." 
      },
      { 
        number: 2, 
        korean: "가난한 가정에서 길러졌기 때문에, 공자는 사람들의 고통을 진정으로 이해했다.", 
        hints: ["in a poor family", "Confucius", "truly", "the suffering", "understood", "raised"], 
        type: 'arrangement', 
        answer: "Raised in a poor family, Confucius truly understood the suffering of the people." 
      },
      { 
        number: 3, 
        korean: "다이아몬드 목걸이를 하고 있는 그녀의 아름다운 목을 힐끗 보면서, 그는 부끄러워했다.", 
        hints: ["her beautiful neck", "with a diamond necklace", "on it", "glancing at"], 
        type: 'arrangement', 
        answer: "Glancing at her beautiful neck with a diamond necklace on it, he felt shy." 
      },
      { 
        number: 4, 
        korean: "외딴 시골에서 차를 갖고 있지 않았기 때문에, 그녀는 그녀의 엄마를 자주 방문할 수 없었다.", 
        hints: ["a car", "was not able to visit", "not having", "in the remote countryside", "she"], 
        type: 'arrangement', 
        answer: "Not having a car in the remote countryside, she was not able to visit her mother often." 
      },
      { 
        number: 5, 
        korean: "그의 여행 중에 그가 음식을 살 수 없을 것이라는 걸 알고 있었기 때문에, 그는 많은 음식물을 그와 함께 가져갔다.", 
        hints: ["on his journey", "large supplies", "knowing that he wouldn't be able", "to buy food", "he took"], 
        type: 'arrangement', 
        answer: "Knowing that he wouldn't be able to buy food on his journey, he took large supplies with him." 
      },
      { 
        number: 6, 
        korean: "그 차는 하얀 연기를 퍼붓는 채로 그 바리케이드에 돌진했다.", 
        hints: ["The", "car", "dashed", "to", "the", "barricade", "with", "white", "smoke", "pouring", "out"], 
        type: 'arrangement', 
        answer: "The car dashed to the barricade with white smoke pouring out." 
      },
      { 
        number: 7, 
        korean: "화가 난 그 여자는 문이 열리도록 발로 찼고, 그와 싸울 준비를 했다.", 
        hints: ["The", "angry", "woman", "kicked", "the", "door", "open", "getting", "ready", "to", "fight", "with", "him"], 
        type: 'arrangement', 
        answer: "The angry woman kicked the door open, getting ready to fight with him." 
      },
      { 
        number: 8, 
        korean: "그 생물체는 항상 숲속 깊이 살기 때문에, 거의 사람들에 의해서 보이지 않는다.", 
        hints: ["The", "creatures", "are", "rarely", "seen", "by", "people", "always", "living", "deep", "in", "the", "forest"], 
        type: 'arrangement', 
        answer: "The creatures are rarely seen by people, always living deep in the forest." 
      },
      { 
        number: 9, 
        korean: "지난밤에 끔찍한 화재가 발생했고, 10채의 집을 불태웠다.", 
        hints: ["A", "terrible", "fire", "broke", "out", "last", "night", "burning", "down", "ten", "houses"], 
        type: 'arrangement', 
        answer: "A terrible fire broke out last night, burning down ten houses." 
      },
      { 
        number: 10, 
        korean: "슬픔은 당신의 뇌에서 미래에 언젠가 잊혀지고, 가슴에는 새겨진다.", 
        hints: ["Sorrows", "are", "forgotten", "in", "your", "brain", "sometime", "in", "the", "future", "carved", "in", "your", "heart"], 
        type: 'arrangement', 
        answer: "Sorrows are forgotten in your brain sometime in the future, carved in your heart." 
      },
      { 
        number: 11, 
        korean: "그 여자는 기쁨으로 눈이 반짝이며 그녀의 돌아온 아들을 맞이했다.", 
        hints: ["greet", "returning", "shine", "joy", "her eyes"], 
        wordCount: 12, 
        instructions: "「with 분사구문」을 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "The woman greeted her returning son with her eyes shining with joy." 
      },
      { 
        number: 12, 
        korean: "잡지에 있는 사진을 조각으로 찢고 나서, 그녀는 자신의 딸에게 그 사진을 맞춰 보도록 요구했다.", 
        hints: ["tear", "ask", "a picture", "the picture", "put ~ together"], 
        wordCount: 17, 
        instructions: "문장 앞에 분사구문을 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "Tearing a picture from a magazine into pieces, she asked her daughter to put the picture together." 
      },
      { 
        number: 13, 
        korean: "세 개의 엔진으로 동력을 받아서, 그 차량은 시속 1,050 마일로 가도록 고안된다.", 
        hints: ["power", "design", "miles", "engines", "the vehicle", "go", "per hour"], 
        wordCount: 14, 
        instructions: "문장 앞에 분사구문을 사용할 것, 필요시 어형 변화할 것", 
        type: 'arrangement', 
        answer: "Powered by three engines, the vehicle is designed to go 1,050 miles per hour." 
      },
      { 
        number: 14, 
        korean: "친구들 사이에서 이야기를 하면서, 너는 \"Disney Land가 세상에서 가장 좋은 테마 공원이야\"라고 말할지도 모른다.", 
        hints: ["world's theme park", "while", "might say", "among", "finest", "talk"], 
        wordCount: 15, 
        instructions: "문장 앞에 분사구문을 사용할 것", 
        type: 'arrangement', 
        answer: "While talking among friends, you might say \"Disney Land is the finest world's theme park.\"" 
      },
      { 
        number: 15, 
        korean: "가르치는 일을 찾지 못해서, 그는 글 쓰는 직업으로 옮겼다.", 
        hints: ["unable", "a writing career", "teaching work", "drifted into"], 
        wordCount: 11, 
        instructions: "문장 앞에 분사구문을 사용할 것", 
        type: 'arrangement', 
        answer: "Unable to find teaching work, he drifted into a writing career." 
      },
    ],
  },
  // UNIT 17: 부사절을 포함하는 문장 쓰기
  {
    number: 17,
    title: "부사절을 포함하는 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "일단 스트레스를 유발하는 요소가 사라지면, 스트레스 호르몬은 잠잠해진다.", 
        hints: ["causing stress", "the stress hormones", "disappears", "the factor", "once", "quiet down"], 
        type: 'arrangement', 
        answer: "Once the factor causing stress disappears, the stress hormones quiet down." 
      },
      { 
        number: 2, 
        korean: "아이들이 화장실과 휴지를 사용하는 데 익숙해질 때, 그들은 자립심을 얻을 수 있다.", 
        hints: ["and toilet paper", "they can", "children", "to using a toilet", "when", "are accustomed", "gain independence"], 
        type: 'arrangement', 
        answer: "When children are accustomed to using a toilet and toilet paper, they can gain independence." 
      },
      { 
        number: 3, 
        korean: "나는 내 삶의 끝까지 내가 살아 있는 한 그날을 잊지 못할 것이다.", 
        hints: ["as long as", "that day", "I live", "will not forget", "to the end of my life"], 
        type: 'arrangement', 
        answer: "I will not forget that day as long as I live to the end of my life." 
      },
      { 
        number: 4, 
        korean: "그의 고통이 너무 견딜 수 없어서 그는 자신의 목숨을 끝내는 것을 생각하고 있었다.", 
        hints: ["so intolerable", "his pain was", "that he was", "of ending his life", "having thoughts"], 
        type: 'arrangement', 
        answer: "His pain was so intolerable that he was having thoughts of ending his life." 
      },
      { 
        number: 5, 
        korean: "당신이 이 지구에서 어디를 가더라도, 당신은 영어로 살아갈 수 있다.", 
        hints: ["on this globe", "you go", "you can get along", "wherever", "with English"], 
        type: 'arrangement', 
        answer: "Wherever you go on this globe, you can get along with English." 
      },
      { 
        number: 6, 
        korean: "당신은 당신이 자연의 규칙을 이해할 때까지는 주변 환경을 완전하게 이해할 수 없다.", 
        hints: ["You", "can't", "fully", "appreciate", "your", "surroundings", "until", "you", "understand", "the", "rules", "of", "nature"], 
        type: 'arrangement', 
        answer: "You can't fully appreciate your surroundings until you understand the rules of nature." 
      },
      { 
        number: 7, 
        korean: "우리의 몸이나 우리의 정신에 무엇이 발생하더라도 우리의 영혼은 전체로서 남아 있다.", 
        hints: ["No", "matter", "what", "happens", "to", "our", "bodies", "or", "our", "minds", "our", "souls", "remain", "whole"], 
        type: 'arrangement', 
        answer: "No matter what happens to our bodies or our minds, our souls remain whole." 
      },
      { 
        number: 8, 
        korean: "당신은 당신이 산에서 길을 잃었을 때 당신이 잠이 들지 않도록 계속 걷는 것이 좋다.", 
        hints: ["You'd", "better", "keep", "walking", "lest", "you", "should", "fall", "asleep", "when", "you", "stray", "in", "a", "mountain"], 
        type: 'arrangement', 
        answer: "You'd better keep walking lest you should fall asleep when you stray in a mountain." 
      },
      { 
        number: 9, 
        korean: "과학자들은 그들이 날씨에서의 변화를 더 정확하게 이해하고 예측하기 위해서 전 세계에서 정보를 수집한다.", 
        hints: ["Scientists", "collect", "information", "worldwide", "so", "that", "they", "can", "understand", "and", "predict", "changes", "in", "the", "weather", "more", "accurately"], 
        type: 'arrangement', 
        answer: "Scientists collect information worldwide so that they can understand and predict changes in the weather more accurately." 
      },
      { 
        number: 10, 
        korean: "우리가 영화관에 도착할 때쯤이면, 그 영화는 이미 시작했을 것이다.", 
        hints: ["By", "the", "time", "we", "get", "to", "the", "cinema", "the", "film", "will", "already", "have", "started"], 
        type: 'arrangement', 
        answer: "By the time we get to the cinema, the film will already have started." 
      },
      { 
        number: 11, 
        korean: "여러 아이를 가진 부모들이 알듯이, 아기의 욕구를 충족시키기 위한 간단한 공식은 없다.", 
        hints: ["parents", "there is", "know", "of multiple children", "for meeting", "no one simple formula", "a baby's needs"], 
        wordCount: 18, 
        instructions: "접속사 as를 사용할 것", 
        type: 'arrangement', 
        answer: "As parents of multiple children know, there is no one simple formula for meeting a baby's needs." 
      },
      { 
        number: 12, 
        korean: "그의 머리가 베개에 닿자마자 잠이 드는 자신의 능력을 매우 자랑스러워하는 젊은이가 있었다.", 
        hints: ["who", "was intensely proud of", "to sleep", "his ability", "touched the pillow", "his head", "the moment"], 
        wordCount: 22, 
        instructions: "「There was/were ~」로 시작할 것", 
        type: 'arrangement', 
        answer: "There was a young man who was intensely proud of his ability to sleep the moment his head touched the pillow." 
      },
      { 
        number: 13, 
        korean: "당신이 할 수 있다고 생각하거나 할 수 없다고 생각하거나, 당신은 옳다.", 
        hints: ["you think", "you can", "or", "you can't", "you are right"], 
        wordCount: 13, 
        instructions: "접속사 whether를 사용할 것", 
        type: 'arrangement', 
        answer: "Whether you think you can or you think you can't, you are right." 
      },
      { 
        number: 14, 
        korean: "일단 당신이 첫 번째 초안이 당신의 최고의 글이 아니라고 자신을 납득시킬 수 있으면, 시작하는 것이 더 쉬울 것이다.", 
        hints: ["convince yourself", "your best writing", "it will be easier", "isn't", "the first draft", "to get started", "once"], 
        wordCount: 20, 
        type: 'arrangement', 
        answer: "Once you can convince yourself that the first draft isn't your best writing, it will be easier to get started." 
      },
      { 
        number: 15, 
        korean: "우리가 아무리 열심히 노력해도, 우리는 우리 자신을 웃게 만들 수 없다.", 
        hints: ["we try", "hard", "we are unable", "to make ourselves", "no matter", "how", "laugh"], 
        wordCount: 13, 
        type: 'arrangement', 
        answer: "No matter how hard we try, we are unable to make ourselves laugh." 
      },
    ],
  },
  // UNIT 18: 가정법을 포함하는 문장 쓰기
  {
    number: 18,
    title: "가정법을 포함하는 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "만약 비행기가 독일군에 의해 발견된다면, 그와 그의 가족은 하늘에서 목숨을 잃을 수도 있을 것이다.", 
        hints: ["the plane", "were discovered", "by the German troops", "he and his family", "might lose their lives", "in the air"], 
        type: 'arrangement', 
        answer: "If the plane were discovered by the German troops, he and his family might lose their lives in the air." 
      },
      { 
        number: 2, 
        korean: "Tom이 20대에 대학을 마쳤다면, 그는 지금 더 좋은 자리로 승진할 수 있을 텐데.", 
        hints: ["had finished college", "Tom", "when he was in his twenties", "could be promoted", "to a better position", "now"], 
        type: 'arrangement', 
        answer: "If Tom had finished college when he was in his twenties, he could be promoted to a better position now." 
      },
      { 
        number: 3, 
        korean: "만약 베토벤이 오늘날 살아 있다면, 그의 작품이 연주되는 동안 청중들이 조용히 있는 것을 보고 놀랄 것이다.", 
        hints: ["Beethoven", "were alive today", "would be surprised to see", "the audience", "keeping silent", "while his works", "were being played"], 
        type: 'arrangement', 
        answer: "If Beethoven were alive today, he would be surprised to see the audience keeping silent while his works were being played." 
      },
      { 
        number: 4, 
        korean: "나보다 더 많은 인생 경험을 가진 사람들로부터 현명한 조언을 받았더라면 좋을 텐데.", 
        hints: ["I", "wish", "I", "had", "received", "wise", "advice", "from", "those", "with", "more", "life", "experience", "than", "I", "had"], 
        type: 'arrangement', 
        answer: "I wish I had received wise advice from those with more life experience than I had." 
      },
      { 
        number: 5, 
        korean: "그녀가 없었더라면, 그는 학교를 중퇴했을지도 모르고 분명히 끔찍한 삶을 살았을 것이다.", 
        hints: ["But", "for", "her", "he", "might", "have", "dropped", "out", "of", "school", "and", "surely", "would", "have", "had", "a", "terrible", "life"], 
        type: 'arrangement', 
        answer: "But for her, he might have dropped out of school and surely would have had a terrible life." 
      },
      { 
        number: 6, 
        korean: "만약 당신의 아이들이 사생활에 문제가 있는 유명 인사를 따라하고 싶어한다면 기분이 어떨까요?", 
        hints: ["How", "would", "you", "feel", "if", "your", "children", "wanted", "to", "imitate", "a", "celebrity", "who", "has", "a", "troubled", "private", "life"], 
        type: 'arrangement', 
        answer: "How would you feel if your children wanted to imitate a celebrity who has a troubled private life?" 
      },
      { 
        number: 7, 
        korean: "만약 태양이 서쪽에서 뜬다면, 나는 네가 말한 것을 믿을 것이다.", 
        hints: ["If", "the", "sun", "were", "to", "rise", "in", "the", "west", "I", "would", "believe", "what", "you", "said"], 
        type: 'arrangement', 
        answer: "If the sun were to rise in the west, I would believe what you said." 
      },
      { 
        number: 8, 
        korean: "만약 그것이 매일 저녁 일어난다면 샴페인 잔을 부딪치는 것은 비교적 따분한 행위가 될 것이다.", 
        hints: ["Clinking", "champagne", "glasses", "would", "be", "a", "relatively", "dull", "exercise", "if", "it", "happened", "every", "evening"], 
        type: 'arrangement', 
        answer: "Clinking champagne glasses would be a relatively dull exercise if it happened every evening." 
      },
      { 
        number: 9, 
        korean: "만약 건물에서 나가기로 한 결정이 내려지지 않았다면, 전체 팀이 죽었을 것이다.", 
        hints: ["If", "the", "decision", "to", "get", "out", "of", "the", "building", "hadn't", "been", "made", "the", "entire", "team", "would", "have", "been", "killed"], 
        type: 'arrangement', 
        answer: "If the decision to get out of the building hadn't been made, the entire team would have been killed." 
      },
      { 
        number: 10, 
        korean: "만약 그 돔 경기장이 건설되지 않았다면, 메이저 리그 야구는 휴스턴에서 살아남지 못했을지도 모른다.", 
        hints: ["If", "the", "domed", "stadium", "had", "not", "been", "built", "major", "league", "baseball", "might", "not", "have", "survived", "in", "Houston"], 
        type: 'arrangement', 
        answer: "If the domed stadium had not been built, major league baseball might not have survived in Houston." 
      },
      { 
        number: 11, 
        korean: "만약 당신이 적과 전쟁을 했더라면, 당신은 위대한 제국을 멸망시켰을 것이다.", 
        hints: ["gone to war", "against", "enemy", "would have destroyed", "great", "empire"], 
        wordCount: 15, 
        instructions: "가정법 과거완료를 사용할 것", 
        type: 'arrangement', 
        answer: "If you had gone to war against your enemy, you would have destroyed a great empire." 
      },
      { 
        number: 12, 
        korean: "Sally가 어제 그녀의 프로젝트를 끝냈더라면, 그녀는 오늘 세미나에 참석할 수 있을 텐데.", 
        hints: ["finished", "her project", "yesterday", "could attend", "the seminar", "today"], 
        wordCount: 12, 
        instructions: "도치 구문을 사용할 것", 
        type: 'arrangement', 
        answer: "Had Sally finished her project yesterday, she could attend the seminar today." 
      },
      { 
        number: 13, 
        korean: "당신에게 또 다른 기회가 있을 수 있다면 좋을 텐데.", 
        hints: ["there", "could be", "another chance", "for you"], 
        wordCount: 9, 
        instructions: "I wish를 사용할 것", 
        type: 'arrangement', 
        answer: "I wish there could be another chance for you." 
      },
      { 
        number: 14, 
        korean: "사람들은 자신이 갖고 있지 않은 지식을 갖고 있는 것처럼 행동할 때 실제로 더 어리석게 보일 수 있다.", 
        hints: ["actually", "end up", "appearing", "more foolish", "when", "act as if", "they had", "knowledge", "that they do not"], 
        wordCount: 18, 
        type: 'arrangement', 
        answer: "People can actually end up appearing more foolish when they act as if they had knowledge that they do not." 
      },
      { 
        number: 15, 
        korean: "당신의 기부가 없다면, 우리 센터는 운영을 계속하기에 충분한 자금을 가지지 못할 것이다.", 
        hints: ["donations", "from you", "our center", "would not have", "enough funds", "to keep operating"], 
        wordCount: 14, 
        instructions: "Without을 사용할 것", 
        type: 'arrangement', 
        answer: "Without donations from you, our center would not have enough funds to keep operating." 
      },
    ],
  },
  // UNIT 19: 비교 구문을 포함하는 문장 쓰기
  {
    number: 19,
    title: "비교 구문을 포함하는 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "수백만 년 전에, 인간의 얼굴은 오늘날처럼 납작하지 않았다.", 
        hints: ["Millions", "of", "years", "ago", "human", "faces", "weren't", "as", "flat", "as", "they", "are", "today"], 
        type: 'arrangement', 
        answer: "Millions of years ago, human faces weren't as flat as they are today." 
      },
      { 
        number: 2, 
        korean: "일생 동안, 평균적인 인간의 심장은 25억 번 이상 뛸 것이다.", 
        hints: ["In", "a", "lifetime", "the", "average", "human", "heart", "will", "beat", "more", "than", "two", "and", "a", "half", "billion", "times"], 
        type: 'arrangement', 
        answer: "In a lifetime, the average human heart will beat more than two and a half billion times." 
      },
      { 
        number: 3, 
        korean: "1965년에, Maury Wills라는 이름의 야구 선수가 메이저 리그의 어떤 다른 선수보다 더 많은 도루를 했다.", 
        hints: ["In", "1965", "a", "baseball", "player", "named", "Maury", "Wills", "stole", "more", "bases", "than", "any", "other", "player", "in", "the", "major", "leagues"], 
        type: 'arrangement', 
        answer: "In 1965, a baseball player named Maury Wills stole more bases than any other player in the major leagues." 
      },
      { 
        number: 4, 
        korean: "놀랍게도, 그들은 탄소색 고무 타이어가 색칠되지 않은 것보다 5배 더 내구성이 있다는 것을 발견했다.", 
        hints: ["To", "their", "surprise", "they", "discovered", "that", "the", "carbon-colored", "rubber", "tires", "were", "five", "times", "more", "durable", "than", "the", "uncolored", "ones"], 
        type: 'arrangement', 
        answer: "To their surprise, they discovered that the carbon-colored rubber tires were five times more durable than the uncolored ones." 
      },
      { 
        number: 5, 
        korean: "시골에 사는 고양이, 양, 소의 수가 도시에 사는 것보다 더 많았다.", 
        hints: ["The", "number", "of", "cats", "sheep", "and", "cows", "living", "in", "the", "country", "was", "larger", "than", "that", "in", "the", "city"], 
        type: 'arrangement', 
        answer: "The number of cats, sheep, and cows living in the country was larger than that in the city." 
      },
      { 
        number: 6, 
        korean: "고원이라고 불리는 지형은 산만큼 거의 높이 솟아오를 수 있다.", 
        hints: ["A", "landform", "called", "a", "plateau", "can", "rise", "almost", "as", "high", "as", "a", "mountain"], 
        type: 'arrangement', 
        answer: "A landform called a plateau can rise almost as high as a mountain." 
      },
      { 
        number: 7, 
        korean: "하루에 5달러 정도만 다른 사람들에게 쓰는 것도 행복감을 크게 높일 수 있다는 것이 발견되었다.", 
        hints: ["It", "was", "found", "that", "spending", "as", "little", "as", "5", "dollars", "a", "day", "on", "others", "could", "significantly", "boost", "happiness"], 
        type: 'arrangement', 
        answer: "It was found that spending as little as 5 dollars a day on others could significantly boost happiness." 
      },
      { 
        number: 8, 
        korean: "매년, 해외로 나가는 한국인의 수는 한국을 방문하는 외국인의 수보다 더 많다.", 
        hints: ["Each", "year", "the", "number", "of", "Koreans", "going", "abroad", "is", "larger", "than", "that", "of", "foreigners", "visiting", "Korea"], 
        type: 'arrangement', 
        answer: "Each year, the number of Koreans going abroad is larger than that of foreigners visiting Korea." 
      },
      { 
        number: 9, 
        korean: "아이들에게 자신의 돈을 써보게 하는 것보다 물건 값을 더 빨리 가르쳐 주는 것은 없다.", 
        hints: ["Nothing", "teaches", "kids", "quicker", "about", "what", "things", "cost", "than", "giving", "them", "their", "own", "money", "to", "spend"], 
        type: 'arrangement', 
        answer: "Nothing teaches kids quicker about what things cost than giving them their own money to spend." 
      },
      { 
        number: 10, 
        korean: "심각한 귀 감염에 자주 걸리는 아이들은 더 건강한 귀를 가진 아이들보다 나중에 과체중이 될 가능성이 두 배 더 높다.", 
        hints: ["Children", "who", "often", "get", "serious", "ear", "infections", "are", "twice", "more", "likely", "to", "become", "overweight", "later", "in", "life", "than", "kids", "with", "healthier", "ears"], 
        type: 'arrangement', 
        answer: "Children who often get serious ear infections are twice more likely to become overweight later in life than kids with healthier ears." 
      },
      { 
        number: 11, 
        korean: "18세 미만 아이들의 문자 메시지 사용량은 18세에서 24세 사이의 사람들의 두 배 이상이다.", 
        hints: ["text-message usage", "kids", "under 18", "over twice as much as", "that of", "people", "ages 18 to 24"], 
        wordCount: 18, 
        type: 'arrangement', 
        answer: "The text-message usage of kids under 18 is over twice as much as that of people ages 18 to 24." 
      },
      { 
        number: 12, 
        korean: "당신이 먹는 지방의 양은 당신의 엄지손가락 끝보다 크지 않아야 한다.", 
        hints: ["the amount of fat", "you eat", "should be", "no larger than", "the tip of", "your thumb"], 
        wordCount: 15, 
        type: 'arrangement', 
        answer: "The amount of fat you eat should be no larger than the tip of your thumb." 
      },
      { 
        number: 13, 
        korean: "연습보다 더 중요한 것은 없다는 것을 기억하라.", 
        hints: ["remember", "nothing", "more important", "than", "practice"], 
        wordCount: 8, 
        type: 'arrangement', 
        answer: "Remember that nothing is more important than practice." 
      },
      { 
        number: 14, 
        korean: "당신이 상대방에 대해 더 많이 알수록, 당신은 협상에서 더 설득력 있게 될 것이다.", 
        hints: ["find out", "the other party", "persuasive", "you will become", "the negotiation", "the more"], 
        wordCount: 17, 
        instructions: "「The 비교급 ~, the 비교급 ~」을 사용할 것", 
        type: 'arrangement', 
        answer: "The more you find out about the other party, the more persuasive you will become in the negotiation." 
      },
      { 
        number: 15, 
        korean: "넓은 칼날을 가진 큰 칼은 무기라기보다는 오히려 어떤 사람들에게는 필수품이다.", 
        hints: ["a large knife", "with a broad blade", "not so much", "a weapon", "as", "a necessity", "for some people"], 
        wordCount: 17, 
        type: 'arrangement', 
        answer: "A large knife with a broad blade is not so much a weapon as a necessity for some people." 
      },
    ],
  },
  // UNIT 20: 강조·도치 구문을 포함하는 문장 쓰기
  {
    number: 20,
    title: "강조·도치 구문을 포함하는 문장 쓰기",
    problems: [
      { 
        number: 1, 
        korean: "복권에 당첨되는 것이 항상 당신을 행복하게 만들지는 않는다.", 
        hints: ["Winning", "the", "lottery", "does", "not", "always", "make", "you", "happy"], 
        type: 'arrangement', 
        answer: "Winning the lottery does not always make you happy." 
      },
      { 
        number: 2, 
        korean: "만약 당신의 아이디어를 머릿속에만 간직한다면 그 어떤 것도 세상을 바꾸지 못할 것이다.", 
        hints: ["None", "of", "your", "ideas", "will", "change", "the", "world", "if", "you", "keep", "them", "inside", "of", "your", "head"], 
        type: 'arrangement', 
        answer: "None of your ideas will change the world if you keep them inside of your head." 
      },
      { 
        number: 3, 
        korean: "그녀는 자신의 결정이 어린 아들에게 미칠 영향을 결코 상상하지 못했다.", 
        hints: ["Never", "did", "she", "imagine", "the", "effect", "her", "decision", "would", "have", "on", "her", "young", "son"], 
        type: 'arrangement', 
        answer: "Never did she imagine the effect her decision would have on her young son." 
      },
      { 
        number: 4, 
        korean: "캔 위의 고무가 진동하면, 거울도 진동한다.", 
        hints: ["As", "the", "rubber", "on", "the", "can", "vibrates", "so", "does", "the", "mirror"], 
        type: 'arrangement', 
        answer: "As the rubber on the can vibrates, so does the mirror." 
      },
      { 
        number: 5, 
        korean: "오직 가족에 대한 헌신 때문에 그는 그런 힘든 일을 한다.", 
        hints: ["Only", "for", "the", "devotion", "to", "his", "family", "does", "he", "do", "such", "hard", "work"], 
        type: 'arrangement', 
        answer: "Only for the devotion to his family does he do such hard work." 
      },
      { 
        number: 6, 
        korean: "그녀가 정직하다고 믿었던 직원이 그녀를 속였다.", 
        hints: ["The", "employee", "who", "she", "believed", "was", "honest", "deceived", "her"], 
        type: 'arrangement', 
        answer: "The employee who she believed was honest deceived her." 
      },
      { 
        number: 7, 
        korean: "그는 자기 일에 그다지 능숙하지 않았고 나아지는 것처럼 보이지도 않았다.", 
        hints: ["He", "was", "not", "very", "good", "at", "his", "work", "nor", "did", "he", "seem", "to", "improve"], 
        type: 'arrangement', 
        answer: "He was not very good at his work nor did he seem to improve." 
      },
      { 
        number: 8, 
        korean: "내 집 근처에 내 친한 친구들이 운영하는 두 개의 큰 빵집이 있다.", 
        hints: ["Near", "my", "house", "are", "two", "big", "bakeries", "run", "by", "my", "close", "friends"], 
        type: 'arrangement', 
        answer: "Near my house are two big bakeries run by my close friends." 
      },
      { 
        number: 9, 
        korean: "그 당시에 나는 같은 교장 선생님이 10년 후에 내 인생에서 중요한 역할을 할 것이라는 것을 거의 알지 못했다.", 
        hints: ["Little", "did", "I", "know", "at", "that", "time", "that", "the", "same", "principal", "would", "play", "a", "major", "part", "in", "my", "life", "ten", "years", "later"], 
        type: 'arrangement', 
        answer: "Little did I know at that time that the same principal would play a major part in my life ten years later." 
      },
      { 
        number: 10, 
        korean: "상대의 주먹이 너무 빠르게 날아와서 Maggie는 펀치를 간신히 막을 수 있었다.", 
        hints: ["The", "opponent's", "fists", "flew", "so", "fast", "that", "Maggie", "could", "barely", "block", "the", "punches"], 
        type: 'arrangement', 
        answer: "The opponent's fists flew so fast that Maggie could barely block the punches." 
      },
      { 
        number: 11, 
        korean: "뚱뚱한 도마뱀인 Chuckwallas는 보통 길이가 20-25cm이고 성숙하면 약 1.5kg의 무게가 나간다.", 
        hints: ["fat lizards", "usually", "20-25cm long", "weigh", "about 1.5kg", "when mature"], 
        wordCount: 14, 
        type: 'arrangement', 
        answer: "Chuckwallas, fat lizards, are usually 20-25cm long and weigh about 1.5kg when mature." 
      },
      { 
        number: 12, 
        korean: "그는 대부분의 아이들보다 훨씬 일찍 말을 시작했을 뿐만 아니라, 동화책의 거의 모든 페이지를 암기할 수 있었다.", 
        hints: ["not only", "start talking", "much sooner", "than most children do", "but", "could memorize", "nearly all the pages", "of his fairy tale books"], 
        wordCount: 22, 
        instructions: "「Not only ~ but ~」 도치 구문을 사용할 것", 
        type: 'arrangement', 
        answer: "Not only did he start talking much sooner than most children do, but he could memorize nearly all the pages of his fairy tale books." 
      },
      { 
        number: 13, 
        korean: "그 집에 도착하자마자 나는 그것이 비어 있다는 것을 깨달았다.", 
        hints: ["reached", "the house", "realized", "it was empty"], 
        wordCount: 11, 
        instructions: "「No sooner ~ than」 도치 구문을 사용할 것", 
        type: 'arrangement', 
        answer: "No sooner had I reached the house than I realized it was empty." 
      },
      { 
        number: 14, 
        korean: "어제 Mr. Lane에게 청구서를 보낸 사람은 바로 내 비서였다.", 
        hints: ["my secretary", "sent", "the bill", "to Mr. Lane", "yesterday", "it was ~ that"], 
        wordCount: 12, 
        instructions: "강조 구문을 사용할 것", 
        type: 'arrangement', 
        answer: "It was my secretary that sent the bill to Mr. Lane yesterday." 
      },
      { 
        number: 15, 
        korean: "이전에는 이러한 주제들이 예술가들에게 적합하다고 여겨진 적이 없었다.", 
        hints: ["never before", "these subjects", "been considered", "appropriate", "for artists"], 
        wordCount: 10, 
        instructions: "「Never before」 도치 구문을 사용할 것", 
        type: 'arrangement', 
        answer: "Never before had these subjects been considered appropriate for artists." 
      },
    ],
  },
];
