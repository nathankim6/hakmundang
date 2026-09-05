// 조건영작 서술형 DRILL - 원본 PDF 기반 정확한 데이터
// Unit 1~20, 각 유닛당 5문제
import { Problem, Unit } from './workbookData';

export const conditionalUnits: Unit[] = [
  // UNIT 1: 가주어 / 명사절 진주어 (1)
  {
    number: 1,
    title: "가주어 / 명사절 진주어 (1)",
    problems: [
      { 
        number: 1, 
        korean: "구성원들이 특별한 노력 없이 그들의 행동을 조정할 수 있을 것 같지 않다.", 
        hints: ["can", "making", "a", "special", "without", "their", "actions", "that", "members", "is", "coordinate", "unlikely", "effort", "It"], 
        type: 'conditional', 
        answer: "It is unlikely that members can coordinate their actions without making a special effort." 
      },
      { 
        number: 2, 
        korean: "방목이 목초지를 완전히 망칠 때까지 점점 더 많은 동물들이 목초지로 나오게 되는 일은 피할 수 없다.", 
        hints: ["overgrazing", "totally destroys", "that", "be", "onto", "the pasture", "more and more", "it", "until", "animals", "the pasture", "brought", "is", "inevitable", "will"], 
        type: 'conditional', 
        answer: "It is inevitable that more and more animals will be brought onto the pasture until overgrazing totally destroys the pasture." 
      },
      { 
        number: 3, 
        korean: "누가 그 일을 하느냐가 중요한 것이 아니라 언제 그 일이 끝날 것인지가 중요하다.", 
        hints: ["who", "will", "not", "be", "but", "it", "important", "when", "the", "do", "is", "work", "will", "work", "the", "done"], 
        type: 'conditional', 
        answer: "It is not important who will do the work but when the work will be done." 
      },
      { 
        number: 4, 
        korean: "그들이 협력할 때 학생들이 더 잘 배운다는 것은 놀라운 일이 아닐 것이다.", 
        hints: ["It", "should", "not", "be", "surprising", "that", "students", "learn", "better", "when", "they", "cooperate"], 
        type: 'conditional', 
        answer: "It should not be surprising that students learn better when they cooperate." 
      },
      { 
        number: 5, 
        korean: "나이 변화는 각기 다른 시기에 몸의 다른 부위에서 시작될 가능성이 있다.", 
        hints: ["It", "is", "likely", "that", "age", "changes", "begin", "in", "different", "parts", "of", "the", "body", "at", "different", "times"], 
        type: 'conditional', 
        answer: "It is likely that age changes begin in different parts of the body at different times." 
      },
    ],
  },
  // UNIT 2: 가주어 / to 부정사(구) 진주어 (2)
  {
    number: 2,
    title: "가주어 / to 부정사(구) 진주어",
    problems: [
      { 
        number: 1, 
        korean: "그 농부가 필요한 것보다 더 많은 씨앗을 뿌리는 것이 필요하다.", 
        hints: ["It", "is", "necessary", "for", "the farmer", "to", "sow", "more", "seed", "than", "is", "necessary"], 
        type: 'conditional', 
        answer: "It is necessary for the farmer to sow more seed than is necessary." 
      },
      { 
        number: 2, 
        korean: "그들만의 편협한 이기적인 욕망에 집중하는 아이들이나 어른들에게 동기부여하는 것은 어렵고 거의 불가능하다.", 
        hints: ["It", "is", "difficult", "and", "almost", "impossible", "to", "motivate", "kids", "or", "adults", "who", "are", "centered", "on", "their own", "narrow", "selfish", "desires"], 
        type: 'conditional', 
        answer: "It is difficult and almost impossible to motivate kids or adults who are centered on their own narrow selfish desires." 
      },
      { 
        number: 3, 
        korean: "우리가 현지 상황을 고려하고 융통성 있게 반응하는 것이 필요하다.", 
        hints: ["It", "is", "necessary", "for", "us", "to", "consider", "the local situation", "and", "respond", "with", "flexibility"], 
        type: 'conditional', 
        answer: "It is necessary for us to consider the local situation and respond with flexibility." 
      },
      { 
        number: 4, 
        korean: "아이가 새로운 학교에 갈 때 긴장하는 것은 당연하다.", 
        hints: ["It", "is", "natural", "for", "a child", "to", "feel", "nervous", "when", "moving", "to", "a new school"], 
        type: 'conditional', 
        answer: "It is natural for a child to feel nervous when moving to a new school." 
      },
      { 
        number: 5, 
        korean: "그 자체로 멋있기만 하고 그 지역의 환경을 망치는 다리를 만드는 것은 받아들여질 수 없다.", 
        hints: ["It", "is", "not", "acceptable", "to", "create", "a bridge", "that", "is", "spectacular", "in itself", "but", "spoils", "its", "local", "environment"], 
        type: 'conditional', 
        answer: "It is not acceptable to create a bridge that is spectacular in itself but spoils its local environment." 
      },
    ],
  },
  // UNIT 3: 가목적어 / 진목적어
  {
    number: 3,
    title: "가목적어 / 진목적어",
    problems: [
      { 
        number: 1, 
        korean: "현대 아이슬란드인은 중세 시대의 아이슬란드 영웅 전설을 읽는 것을 매우 어렵다고 생각하지 않는다.", 
        hints: ["sagas", "the", "not", "to", "the modern Icelander", "find", "the Middle Ages", "difficult", "Icelandic", "it", "read", "from", "does", "very"], 
        type: 'conditional', 
        answer: "The modern Icelander does not find it very difficult to read the Icelandic sagas from the Middle Ages." 
      },
      { 
        number: 2, 
        korean: "그는 그 문제와 관련이 없었다는 것을 분명히 했다.", 
        hints: ["clear", "nothing", "it", "to", "the", "with", "do", "had", "he", "made", "that", "matter", "he"], 
        type: 'conditional', 
        answer: "He made it clear that he had nothing to do with the matter." 
      },
      { 
        number: 3, 
        korean: "경쟁을 없애는 것은 모든 사람들이 단순한 전문성을 초월하는 장기적인 관계의 종류를 구축하는 것을 더 쉽게 만든다.", 
        hints: ["professionalism", "everyone", "easier", "it", "build", "transcend", "to", "that", "kinds", "of", "long-term", "for", "the", "makes", "competition", "mere", "eliminating", "relationships"], 
        type: 'conditional', 
        answer: "Eliminating competition makes it easier for everyone to build the kinds of long-term relationships that transcend mere professionalism." 
      },
      { 
        number: 4, 
        korean: "그것들은 더 이상 유용하지 않은 굳어버린 행동을 버리는 것을 어렵게 만든다.", 
        hints: ["They", "make", "it", "difficult", "to", "abandon", "entrenched", "behaviors", "that", "are", "no longer", "useful"], 
        type: 'conditional', 
        answer: "They make it difficult to abandon entrenched behaviors that are no longer useful." 
      },
      { 
        number: 5, 
        korean: "기술은 성급한 반응으로 상황을 악화시키는 것을 더 쉽게 만든다.", 
        hints: ["Technology", "makes", "it", "much", "easier", "to", "worsen", "a situation", "with", "a quick response"], 
        type: 'conditional', 
        answer: "Technology makes it much easier to worsen a situation with a quick response." 
      },
    ],
  },
  // UNIT 4: 사역동사
  {
    number: 4,
    title: "사역동사",
    problems: [
      { 
        number: 1, 
        korean: "나는 그들에게 사람들이 그들의 지역 공원들을 돌보게 하는 가장 좋은 방법을 조사하기 위한 실험에 참가하는 중이었다고 말했다.", 
        hints: ["take care of", "make", "them", "they", "in", "an experiment", "examine", "to", "that", "their local parks", "I", "told", "people", "participating", "to", "were", "the best way"], 
        type: 'conditional', 
        answer: "I told them that they were participating in an experiment to examine the best way to make people take care of their local parks." 
      },
      { 
        number: 2, 
        korean: "그는 몇 개의 상품 라벨을 그가 다시 디자인하게 해달라고 그의 회사 대표를 설득했다.", 
        hints: ["let", "the", "product", "of", "the head", "his", "some", "of", "he", "persuaded", "redesign", "to", "him", "company", "labels"], 
        type: 'conditional', 
        answer: "He persuaded the head of his company to let him redesign some of the product labels." 
      },
      { 
        number: 3, 
        korean: "그 연구자들은 두 마리의 개들을 서로 나란히 앉히고 각각의 개에게 번갈아 발을 내밀게 했다.", 
        hints: ["a paw", "and", "each dog in turn", "each other", "two", "sit next to", "to", "had", "the researchers", "dogs", "give", "asked"], 
        type: 'conditional', 
        answer: "The researchers had two dogs sit next to each other and asked each dog in turn to give a paw." 
      },
      { 
        number: 4, 
        korean: "현미경은 생물의 아주 작은 구성체까지 우리가 더 깊이 들여다볼 수 있게 도와준다.", 
        hints: ["Microscopes", "help", "us", "see", "further", "into", "the tiny building blocks", "of", "living", "creatures"], 
        type: 'conditional', 
        answer: "Microscopes help us see further into the tiny building blocks of living creatures." 
      },
      { 
        number: 5, 
        korean: "배가 부르면 사람들은 만족스럽고 더 행복해진다.", 
        hints: ["Having", "a", "full", "stomach", "makes", "people", "feel", "satisfied", "and", "happier"], 
        type: 'conditional', 
        answer: "Having a full stomach makes people feel satisfied and happier." 
      },
    ],
  },
  // UNIT 5: 지각동사
  {
    number: 5,
    title: "지각동사",
    problems: [
      { 
        number: 1, 
        korean: "나는 코치와 부모들이 아이들에게 개념을 설명하는 시간을 잘못 선택하는 것을 인지해오고 있었다.", 
        hints: ["noticed", "the wrong", "concepts", "children", "have", "to", "explain", "and", "parents", "to", "time", "I", "choose", "coaches"], 
        type: 'conditional', 
        answer: "I have noticed coaches and parents choose the wrong time to explain concepts to children." 
      },
      { 
        number: 2, 
        korean: "당신은 경기장에서 경기를 하고 있는 그의 아들을 지켜보는 아버지를 봤을지 모른다.", 
        hints: ["watching", "in", "a field", "you", "son", "a father", "his", "playing", "seen", "have", "might", "a game"], 
        type: 'conditional', 
        answer: "You might have seen a father watching his son playing a game in a field." 
      },
      { 
        number: 3, 
        korean: "그녀는 그녀의 창문 밖을 내다보고 빗줄기가 가늘어지기 시작하는 것을 보았다.", 
        hints: ["window", "she", "her", "saw", "beginning", "looked", "the", "fade", "out", "and", "to", "rain"], 
        type: 'conditional', 
        answer: "She looked out her window and saw the rain beginning to fade." 
      },
      { 
        number: 4, 
        korean: "나는 한 불쌍한 집시 여자가 그 지하철 역 밖에 있는 보도에 앉아 있는 것을 보았다.", 
        hints: ["I", "saw", "a", "poor", "gypsy", "woman", "sitting", "on", "the", "sidewalk", "outside", "the subway station"], 
        type: 'conditional', 
        answer: "I saw a poor gypsy woman sitting on the sidewalk outside the subway station." 
      },
      { 
        number: 5, 
        korean: "그는 땅 위에 떨어져 있는 낙엽들을 보았고, 이곳에서 저곳으로 날아다니는 나비들을 보았다.", 
        hints: ["He", "has", "seen", "the leaves", "fallen", "on the ground", "and", "watched", "butterflies", "fly", "from one place", "to another"], 
        type: 'conditional', 
        answer: "He has seen the leaves fallen on the ground and watched butterflies fly from one place to another." 
      },
    ],
  },
  // UNIT 6: 조동사 중요 구문
  {
    number: 6,
    title: "조동사 중요 구문",
    problems: [
      { 
        number: 1, 
        korean: "입 냄새에 대해서 당신이 들어봤을지도 모르는 사실이 아닌 두 가지가 여기 있다.", 
        hints: ["are", "have", "here", "that", "about", "bad breath", "not", "things", "true", "you", "may", "heard", "are", "two"], 
        type: 'conditional', 
        answer: "Here are two things you may have heard about bad breath that are not true." 
      },
      { 
        number: 2, 
        korean: "그들은 그 아주 작은 전화기가 사용하기가 얼마나 어려울지에 대해 생각해보지 않았을 수 있다.", 
        hints: ["to", "that", "hard", "will", "tiny", "use", "have", "may", "not", "thought", "be", "phone", "they", "how", "about"], 
        type: 'conditional', 
        answer: "They may not have thought about how hard that tiny phone will be to use." 
      },
      { 
        number: 3, 
        korean: "대부분의 아이들은 부모님이 충분히 엄격하지 않은 것보다 차라리 약간 더 엄격하기를 바란다.", 
        hints: ["parents", "than", "too strict", "not", "would rather", "kids", "a little", "that", "have", "enough", "strict", "are", "most"], 
        type: 'conditional', 
        answer: "Most kids would rather have parents that are a little too strict than not strict enough." 
      },
      { 
        number: 4, 
        korean: "이 애벌레들이 성체로 나타나는 데 2년이 더 필요했어야 했다.", 
        hints: ["These", "nymphs", "should", "have", "take", "a further", "two", "years", "to", "emerge", "as", "adults"], 
        type: 'conditional', 
        answer: "These nymphs should have taken a further two years to emerge as adults." 
      },
      { 
        number: 5, 
        korean: "그들은 기차가 그들의 아파트를 지나가곤 했던 그 시간 즈음에 전화하는 경향이 있었다.", 
        hints: ["They", "tended", "to", "call", "around", "the time", "when", "the trains", "used", "to", "run", "past", "their", "apartments"], 
        type: 'conditional', 
        answer: "They tended to call around the time when the trains used to run past their apartments." 
      },
    ],
  },
  // UNIT 7: 수동태 구문
  {
    number: 7,
    title: "수동태 구문",
    problems: [
      { 
        number: 1, 
        korean: "아동의 놀이를 관찰하는 것은 아동의 내면 세계에 대단히 깊은 통찰을 제공한다고 보여질 수 있다.", 
        hints: ["a child's", "seen", "rich insights", "observing", "can", "to", "provide", "a child's", "particularly", "inner world", "play", "be", "into"], 
        type: 'conditional', 
        answer: "Observing a child's play can be seen to provide particularly rich insights into a child's inner world." 
      },
      { 
        number: 2, 
        korean: "이 고리가 끊어지도록 하기 위해서, 그 회피는 수학에서의 몇 가지 긍정적인 경험을 통해 배우지 않았던 상태가 되어야 한다.", 
        hints: ["with math", "to", "in order", "be", "broken", "be", "must", "for this cycle", "the avoidance", "unlearned", "through", "some positive experiences"], 
        type: 'conditional', 
        answer: "The avoidance must be unlearned through some positive experiences with math in order for this cycle to be broken." 
      },
      { 
        number: 3, 
        korean: "연료와 토지 때문에 파괴되고 있는 그 숲들은 열대의 나라들에 위치해 있다.", 
        hints: ["destroyed", "in", "for fuel and land", "are", "the tropical countries", "being", "located", "the forests"], 
        type: 'conditional', 
        answer: "The forests being destroyed for fuel and land are located in the tropical countries." 
      },
      { 
        number: 4, 
        korean: "그 학생들은 그들이 3순위로 가장 아름답다고 순위를 정했던 그 포스터를 가지도록 허락되지 않았다.", 
        hints: ["The students", "were", "not", "allowed", "to", "keep", "the poster", "that", "they", "had rated", "as", "the third most", "beautiful"], 
        type: 'conditional', 
        answer: "The students were not allowed to keep the poster that they had rated as the third most beautiful." 
      },
      { 
        number: 5, 
        korean: "댐의 가장 나쁜 영향은 자신의 알을 낳기 위해 흐름을 거슬러 올라가야 하는 연어에서 관찰되어 왔다.", 
        hints: ["The", "worst", "effect", "of", "dams", "has", "been", "observed", "on salmon", "that", "have to", "travel upstream", "to", "lay", "their eggs"], 
        type: 'conditional', 
        answer: "The worst effect of dams has been observed on salmon that have to travel upstream to lay their eggs." 
      },
    ],
  },
  // UNIT 8: 수동태를 품은 단문과 복문
  {
    number: 8,
    title: "수동태를 품은 단문과 복문",
    problems: [
      { 
        number: 1, 
        korean: "플라톤의 추종자들이 스스로에게 다음과 같은 질문을 하기 위해서 모였다고 전해진다.", 
        hints: ["to", "Plato", "themselves", "that", "said", "it", "the followers", "the following question", "of", "ask", "gathered", "is"], 
        type: 'conditional', 
        answer: "It is said that the followers of Plato gathered to ask themselves the following question." 
      },
      { 
        number: 2, 
        korean: "그러한 관행은 매스컴이 \"pester power\"라고 칭했던 것에 굴복시키기 위해 부모님들에게 압력을 가한다고 믿어지고 있다.", 
        hints: ["yield", "believed", "to", "\"pester power\"", "to", "such practices", "parents", "put", "pressure", "what", "the media", "to", "have", "dubbed", "on", "are"], 
        type: 'conditional', 
        answer: "Such practices are believed to put pressure on parents to yield to what the media have dubbed \"pester power.\"" 
      },
      { 
        number: 3, 
        korean: "어떤 야구장들은 다른 야구장들보다 홈런을 치기 더 좋았다고 알려져 있다.", 
        hints: ["Some baseball parks", "are", "known", "to", "have", "been", "better for", "hitting", "home runs", "than", "others"], 
        type: 'conditional', 
        answer: "Some baseball parks are known to have been better for hitting home runs than others." 
      },
      { 
        number: 4, 
        korean: "금발은 고대 로마에서 더 젊어 보이는 외모를 주었다고 믿어지고 있다.", 
        hints: ["Blond hair", "is", "believed", "to", "have", "provided", "a more youthful appearance", "in", "ancient Rome"], 
        type: 'conditional', 
        answer: "Blond hair is believed to have provided a more youthful appearance in ancient Rome." 
      },
      { 
        number: 5, 
        korean: "이러한 종류의 유전자 추적은 의사들이 사람이 병에 걸릴 가능성을 예측하고 진단하는 것을 돕는다.", 
        hints: ["This kind of", "genetic", "tracking", "helps", "doctors", "to", "predict", "the likelihood", "of", "a person", "getting", "a disease", "and", "to", "diagnose", "it"], 
        type: 'conditional', 
        answer: "This kind of genetic tracking helps doctors to predict the likelihood of a person getting a disease and to diagnose it." 
      },
    ],
  },
  // UNIT 9: seem을 품은 단문과 복문
  {
    number: 9,
    title: "seem을 품은 단문과 복문",
    problems: [
      { 
        number: 1, 
        korean: "지나친 보상을 주는 것이 그 일을 하는 사람들의 태도에 부정적 영향을 주는 것처럼 보인다.", 
        hints: ["the attitude", "the work", "a negative effect", "that", "giving", "the people", "excessive reward", "doing", "on", "seems", "it", "have", "of", "may"], 
        type: 'conditional', 
        answer: "It seems that giving excessive reward may have a negative effect on the attitude of the people doing the work." 
      },
      { 
        number: 2, 
        korean: "이러한 작동 방식은 초과 칼로리가 액체의 형태로 섭취되면 제 기능을 충분히 발휘하지 않는 것처럼 보인다.", 
        hints: ["be", "liquids", "seem", "when", "in the form of", "excess calories", "to", "consumed", "are", "doesn't", "fully functional", "this mechanism"], 
        type: 'conditional', 
        answer: "This mechanism doesn't seem to be fully functional when excess calories are consumed in the form of liquids." 
      },
      { 
        number: 3, 
        korean: "우리들 대부분은 어느 정도까지는 어떻게 그것을 속여야 하는지를 알고 있는 것처럼 보인다.", 
        hints: ["It", "seems", "that", "most", "of", "us", "know", "how", "to", "fake", "it", "to some extent"], 
        type: 'conditional', 
        answer: "It seems that most of us know how to fake it to some extent." 
      },
      { 
        number: 4, 
        korean: "그들의 경계 신호는 탐지되어 온 포식자의 특성에 대해 매우 구체적인 정보를 전달하는 것처럼 보인다.", 
        hints: ["Their alarm calls", "seem", "to", "convey", "very specific", "information", "about", "the nature of the predator", "that", "has", "been", "detected"], 
        type: 'conditional', 
        answer: "Their alarm calls seem to convey very specific information about the nature of the predator that has been detected." 
      },
      { 
        number: 5, 
        korean: "나는 종종 학생들이 어떤 책들을 읽었다고 말하는 것을 듣는다.", 
        hints: ["I", "often", "hear", "the students", "say", "that", "they", "have", "read", "certain", "books"], 
        type: 'conditional', 
        answer: "I often hear the students say that they have read certain books." 
      },
    ],
  },
  // UNIT 10: 주(장), 요(구), 명(령), 제(안)
  {
    number: 10,
    title: "주(장), 요(구), 명(령), 제(안)_주·요·명·제의 문장 구성",
    problems: [
      { 
        number: 1, 
        korean: "그들은 가벼운 혈압 상승이 있는 환자들이 약을 복용할 것을 제안하는 지침을 작성했다.", 
        hints: ["wrote", "with mild blood pressure", "suggesting", "elevation", "should", "guidelines", "medicine", "they", "take", "patients"], 
        type: 'conditional', 
        answer: "They wrote guidelines suggesting patients with mild blood pressure elevation should take medicine." 
      },
      { 
        number: 2, 
        korean: "'객관성'이라는 용어는 측정에서 중요한데 관찰된 것(결과, 기록)들은 공개 검증을 받아야 한다는 과학적 요구 때문이다.", 
        hints: ["The term", "'objectivity'", "is", "important", "in", "measurement", "because of", "the scientific", "demand", "that", "observations", "be", "subject to", "public", "verification"], 
        type: 'conditional', 
        answer: "The term 'objectivity' is important in measurement because of the scientific demand that observations be subject to public verification." 
      },
      { 
        number: 3, 
        korean: "그는 나머지 가족들이 잠자리에 들 때 William이 잠자리에 들어야 한다고 주장했다.", 
        hints: ["He", "insisted", "that", "William", "should", "retire", "for the night", "when", "the rest of", "the family", "did"], 
        type: 'conditional', 
        answer: "He insisted that William should retire for the night when the rest of the family did." 
      },
      { 
        number: 4, 
        korean: "당신의 의사가 당신이 원하는 모든 일을 해보기를 권했다고 가정해 보자.", 
        hints: ["Suppose", "that", "your", "doctor", "recommended", "you", "do", "everything", "you", "wanted", "to", "do"], 
        type: 'conditional', 
        answer: "Suppose that your doctor recommended that you do everything you wanted to do." 
      },
      { 
        number: 5, 
        korean: "컴퓨터는 텔레비전보다 더 많은 학생들이 밤을 새게 만들었다.", 
        hints: ["Computers", "caused", "more", "students", "to", "have", "sleepless", "nights", "than", "TV", "did"], 
        type: 'conditional', 
        answer: "Computers caused more students to have sleepless nights than TV did." 
      },
    ],
  },
  // UNIT 11: too ~ to-v / ~ enough to-v
  {
    number: 11,
    title: "too ~ to-v / ~ enough to-v",
    problems: [
      { 
        number: 1, 
        korean: "그들은 바닥까지 살펴 내려다보고는 그 경사가 그들이 시도하기에 너무 가파르다고 결론을 내릴 것이다.", 
        hints: ["try", "look down", "will", "determine", "the slope", "steep", "too", "to the bottom", "that", "them", "they", "is", "for", "to", "and"], 
        type: 'conditional', 
        answer: "They will look down to the bottom and determine that the slope is too steep for them to try." 
      },
      { 
        number: 2, 
        korean: "그 아버지는 그의 배낭을 벗어 아들에게 건네주었고, 아들은 곧 그것이 자기가 가지고 다니기에는 너무 무겁다는 것을 즉시 발견했다.", 
        hints: ["his", "too", "son", "to", ", who", "that", "him", "it", "immediately discovered", "handed", "the father", "carry", "was", "it", "to", "heavy", "off", "for", "took", "his backpack", "and"], 
        type: 'conditional', 
        answer: "The father took off his backpack and handed it to his son, who immediately discovered that it was too heavy for him to carry." 
      },
      { 
        number: 3, 
        korean: "나는 너무 좌절하고 당황스러워서 그것들을 제대로 기억할 수 없었다.", 
        hints: ["was", "in my mind", "straight", "frustrated", "them", "I", "couldn't", "and", "I", "keep", "so", "embarrassed", "that"], 
        type: 'conditional', 
        answer: "I was so frustrated and embarrassed that I couldn't keep them straight in my mind." 
      },
      { 
        number: 4, 
        korean: "그는 너무 가난해서 병원에 갈 수 없는 사람들을 치료하기 위해 아프리카에 갔다.", 
        hints: ["He", "went", "to", "Africa", "to", "treat", "people", "who", "were", "too", "poor", "to", "go", "to", "a hospital"], 
        type: 'conditional', 
        answer: "He went to Africa to treat people who were too poor to go to a hospital." 
      },
      { 
        number: 5, 
        korean: "유년기와 청소년기는 너무나 귀중하여 어른들의 현재의 편의에 따라 희생될 수 없다.", 
        hints: ["Childhood", "and", "adolescence", "are", "too", "invaluable", "to", "be", "sacrificed", "to", "the present convenience", "of adults"], 
        type: 'conditional', 
        answer: "Childhood and adolescence are too invaluable to be sacrificed to the present convenience of adults." 
      },
    ],
  },
  // UNIT 12: 관계대명사
  {
    number: 12,
    title: "형용사가 길어진 문장 1 - 관계대명사",
    problems: [
      { 
        number: 1, 
        korean: "그가 'Satyr'를 그린 정원은 적의 막사 한가운데에 위치하고 있었다.", 
        hints: ["the garden", "was", "camp", "the 'Satyr'", "painted", "in the middle of", "in which", "the", "enemy's", "he", "situated"], 
        type: 'conditional', 
        answer: "The garden in which he painted the 'Satyr' was situated in the middle of the enemy's camp." 
      },
      { 
        number: 2, 
        korean: "그는 경영 사학자였는데 그의 연구는 경영사와 경영관리 연구에 집중해 왔다.", 
        hints: ["on", "of business history", "whose", "the study", "he", "was", "work", "centered", "has", "an economic historian", "and administration"], 
        type: 'conditional', 
        answer: "He was an economic historian whose work has centered on the study of business history and administration." 
      },
      { 
        number: 3, 
        korean: "대부분의 투자자들이 저지르는 가장 큰 실수는 손실을 보고 공황상태에 빠지는 것이다.", 
        hints: ["most investors", "losses", "into", "make", "over", "mistake", "biggest", "the", "is", "a panic", "getting", "that"], 
        type: 'conditional', 
        answer: "The biggest mistake that most investors make is getting into a panic over losses." 
      },
      { 
        number: 4, 
        korean: "그녀는 많은 이야기들을 들려주었는데, 그녀 자신의 모험 이야기라고 그녀가 주장한다.", 
        hints: ["She", "has told", "many", "stories", ",", "which", "she", "claims", "are", "her", "own", "adventures"], 
        type: 'conditional', 
        answer: "She has told many stories, which she claims are her own adventures." 
      },
      { 
        number: 5, 
        korean: "책장 선반을 둘러본 부모의 비율은 인쇄된 책을 빌린 부모의 비율과 같다.", 
        hints: ["The percentage", "of parents", "who", "browsed", "shelves", "is", "the same as", "that of", "parents", "who", "borrowed", "print books"], 
        type: 'conditional', 
        answer: "The percentage of parents who browsed shelves is the same as that of parents who borrowed print books." 
      },
    ],
  },
  // UNIT 13: 관계부사
  {
    number: 13,
    title: "형용사가 길어진 문장 2 - 관계부사",
    problems: [
      { 
        number: 1, 
        korean: "변화하는 사람들은 변화가 가능한지 어떤지를 질문하지 않거나 그들이 변화할 수 없는 이유를 찾지 않는다.", 
        hints: ["People", "who", "change", "do", "not", "question", "whether", "change", "is", "possible", "or", "look for", "reasons", "why", "they", "cannot", "change"], 
        type: 'conditional', 
        answer: "People who change do not question whether change is possible or look for reasons why they cannot change." 
      },
      { 
        number: 2, 
        korean: "주변 환경의 분위기를 바꿈으로써 우리의 기분에 영향을 끼치려고 다른 사람들이 노력하는 많은 상황들이 있다.", 
        hints: ["changing", "the environment", "by", "influence", "where", "many situations", "other", "our", "mood", "people", "there", "try to", "are", "the atmosphere", "of"], 
        type: 'conditional', 
        answer: "There are many situations where other people try to influence our mood by changing the atmosphere of the environment." 
      },
      { 
        number: 3, 
        korean: "그것들은 땅이 부드럽고 파기 쉬운 서식지를 선호하고 대부분의 시간을 땅 속에서 보낸다.", 
        hints: ["They", "prefer", "habitats", "where", "the earth", "is", "soft", "and", "easy", "to", "dig in", "and", "they", "spend", "most of", "their time", "underground"], 
        type: 'conditional', 
        answer: "They prefer habitats where the earth is soft and easy to dig in and they spend most of their time underground." 
      },
      { 
        number: 4, 
        korean: "단어의 정의가 시간이 지남에 따라 변해 온 한 가지 이유는 단순히 오용 때문이다.", 
        hints: ["One reason", "why", "the definitions", "of words", "have changed", "over time", "is", "simply", "because of", "their", "misuse"], 
        type: 'conditional', 
        answer: "One reason why the definitions of words have changed over time is simply because of their misuse." 
      },
      { 
        number: 5, 
        korean: "떠도는 부족민들은 목말라 죽지 않고 어떻게 사막을 안전하게 건널 수 있는지 알아야 했다.", 
        hints: ["Wandering", "tribesmen", "needed", "to know", "how", "they could", "cross", "deserts", "safely", "without", "dying of thirst"], 
        type: 'conditional', 
        answer: "Wandering tribesmen needed to know how they could cross deserts safely without dying of thirst." 
      },
    ],
  },
  // UNIT 14: 관계대명사 what
  {
    number: 14,
    title: "형용사가 길어진 문장 3 - 관계대명사 what",
    problems: [
      { 
        number: 1, 
        korean: "Sue가 생산성을 향상시키려고 의도한 가벼운 경고로 본 것은 사직을 초래한 위협으로 해석된다.", 
        hints: ["What Sue saw", "as", "a mild warning", "designed", "to improve", "output", "is", "interpreted", "as", "a threat", "resulting in", "a resignation"], 
        type: 'conditional', 
        answer: "What Sue saw as a mild warning designed to improve output is interpreted as a threat resulting in a resignation." 
      },
      { 
        number: 2, 
        korean: "그들은 당신이 성취하려고 노력하는 것에 진정으로 관심이 있고 당신의 모든 목표와 노력을 지지한다.", 
        hints: ["They", "are", "truly", "interested", "in", "what", "you", "are", "trying", "to achieve", "and", "support", "you", "in", "all of", "your goals", "and efforts"], 
        type: 'conditional', 
        answer: "They are truly interested in what you are trying to achieve and support you in all of your goals and efforts." 
      },
      { 
        number: 3, 
        korean: "가장 정상적이고 유능한 아이라도 살아가는 데 극복할 수 없어 보이는 문제들에 직면한다.", 
        hints: ["The most", "normal", "and", "competent", "child", "encounters", "what", "seem like", "insurmountable", "problems", "in living"], 
        type: 'conditional', 
        answer: "The most normal and competent child encounters what seem like insurmountable problems in living." 
      },
      { 
        number: 4, 
        korean: "그것을 감당할 수 있는 사람들은 기대할 수 있는 것보다 훨씬 높은 임금을 누릴 수 있었다.", 
        hints: ["Those", "who", "could afford", "it", "were", "able to", "enjoy", "wages", "far above", "what", "might be", "expected"], 
        type: 'conditional', 
        answer: "Those who could afford it were able to enjoy wages far above what might be expected." 
      },
      { 
        number: 5, 
        korean: "우리는 우리의 중요한 사람들이 우리를 위해 일을 하도록 격려한다.", 
        hints: ["We", "encourage", "our", "significant", "others", "to", "do", "things", "for", "us"], 
        type: 'conditional', 
        answer: "We encourage our significant others to do things for us." 
      },
    ],
  },
  // UNIT 15: 동격의 that
  {
    number: 15,
    title: "동격의 that",
    problems: [
      { 
        number: 1, 
        korean: "사건은 항상 힘의 장에서 발생한다는 개념은 중국인들에게 완전히 직관적이었을 것이다.", 
        hints: ["The notion", "that", "events", "always", "occur", "in", "a field", "of forces", "would have been", "completely", "intuitive", "to", "the Chinese"], 
        type: 'conditional', 
        answer: "The notion that events always occur in a field of forces would have been completely intuitive to the Chinese." 
      },
      { 
        number: 2, 
        korean: "음악이 통합되면 아이들이 수학에서 더 잘한다는 강력한 연구 증거가 있다.", 
        hints: ["There is", "strong", "research", "evidence", "that", "children", "perform", "better", "in", "mathematics", "if", "music", "is", "incorporated", "in it"], 
        type: 'conditional', 
        answer: "There is strong research evidence that children perform better in mathematics if music is incorporated in it." 
      },
      { 
        number: 3, 
        korean: "그것은 많은 아이들이 그들이 지능적이지 않고 교육에서 성공할 수 없다는 잘못된 생각을 갖고 자라나는 데 기여해 왔다.", 
        hints: ["It", "has contributed to", "many children", "growing up", "with", "the mistaken idea", "that", "they", "are not", "intelligent", "and", "cannot succeed", "in education"], 
        type: 'conditional', 
        answer: "It has contributed to many children growing up with the mistaken idea that they are not intelligent and cannot succeed in education." 
      },
      { 
        number: 4, 
        korean: "아이는 자신이 매우 복잡한 코드를 배우고 있다는 사실을 의식하지 못한 채 언어를 연습한다.", 
        hints: ["A child", "practices", "the language", "without", "being", "conscious", "of", "the fact", "that", "he", "is learning", "a highly", "complex", "code"], 
        type: 'conditional', 
        answer: "A child practices the language without being conscious of the fact that he is learning a highly complex code." 
      },
      { 
        number: 5, 
        korean: "컴퓨터가 여러 작업을 처리하는 속도는 모든 것이 동시에 일어난다는 착각을 불러일으킨다.", 
        hints: ["The speed", "with which", "computers", "process", "multiple tasks", "feeds", "the illusion", "that", "everything", "happens", "at", "the same time"], 
        type: 'conditional', 
        answer: "The speed with which computers process multiple tasks feeds the illusion that everything happens at the same time." 
      },
    ],
  },
  // UNIT 16: 부사절 접속사
  {
    number: 16,
    title: "부사절 접속사",
    problems: [
      { 
        number: 1, 
        korean: "1920년대 이래로 심리학자들에 의해 연구되어 왔지만, \"멀티태스킹\"이라는 용어는 1960년대까지 존재하지 않았다.", 
        hints: ["The concept of", "humans", "doing", "multiple things", "at a time", "has been", "studied", "by", "psychologists", "since", "the 1920s", "but", "the term", "\"multitasking\"", "didn't exist", "until", "the 1960s"], 
        type: 'conditional', 
        answer: "The concept of humans doing multiple things at a time has been studied by psychologists since the 1920s, but the term \"multitasking\" didn't exist until the 1960s." 
      },
      { 
        number: 2, 
        korean: "그녀의 10대 딸이 삶과 능력에 대해 부정적인 관점을 경험하고 있을 때, Nancy는 긍정적인 것을 보는 데 어려움을 겪고 있었다.", 
        hints: ["Nancy", "was", "struggling", "to see", "the positive", "when", "her teen daughter", "was experiencing", "a negative perspective", "on", "her life", "and abilities"], 
        type: 'conditional', 
        answer: "Nancy was struggling to see the positive when her teen daughter was experiencing a negative perspective on her life and abilities." 
      },
      { 
        number: 3, 
        korean: "그녀는 그에게 최근에 세상을 떠난 행상인과 결혼했었다고 말하기 시작했다.", 
        hints: ["She", "began", "to tell", "him", "that", "she", "had been", "married to", "a traveling salesman", ",", "who", "had recently", "passed away"], 
        type: 'conditional', 
        answer: "She began to tell him that she had been married to a traveling salesman, who had recently passed away." 
      },
      { 
        number: 4, 
        korean: "진화론은 다른 경쟁 이론들이 거짓임을 증명하는 엄청난 양의 설득력 있는 데이터를 모아 왔다.", 
        hints: ["The theory of evolution", "has", "assembled", "an enormous amount of", "convincing data", "proving", "that", "other", "competing theories", "are", "false"], 
        type: 'conditional', 
        answer: "The theory of evolution has assembled an enormous amount of convincing data proving that other competing theories are false." 
      },
      { 
        number: 5, 
        korean: "이것은 그 학생들이 다른 관점으로 세상을 보도록 가르칠 것이다.", 
        hints: ["This", "will", "teach", "the students", "to", "see", "the world", "from", "different", "points of view"], 
        type: 'conditional', 
        answer: "This will teach the students to see the world from different points of view." 
      },
    ],
  },
  // UNIT 17: 상관접속사
  {
    number: 17,
    title: "상관접속사",
    problems: [
      { 
        number: 1, 
        korean: "이것은 가장 추상적인 분야뿐만 아니라 겉보기에 더 실용적인 분야에서도 종종 그러하다.", 
        hints: ["This", "is often", "the case", "with", "the most", "abstract", "as well as", "the seemingly", "more practical", "disciplines"], 
        type: 'conditional', 
        answer: "This is often the case with the seemingly more practical disciplines as well as the most abstract." 
      },
      { 
        number: 2, 
        korean: "아이들의 말투도 어머니의 말투도 아버지의 말투와 조금도 닮지 않았다는 결과에 우리는 놀랐다.", 
        hints: ["We", "were surprised at", "the result", "that", "neither", "the children's", "speaking style", "nor", "the mother's style", "bore", "any resemblance", "to", "the father's style"], 
        type: 'conditional', 
        answer: "We were surprised at the result that neither the children's speaking style nor the mother's style bore any resemblance to the father's style." 
      },
      { 
        number: 3, 
        korean: "사람들은 자신이 보고 싶어 하는 것이나 보도록 훈련받은 것을 본다는 것을 기억하는 것이 중요하다.", 
        hints: ["It is important", "to remember", "that", "people", "see", "what", "they", "either", "want to see", "or", "are trained", "to see"], 
        type: 'conditional', 
        answer: "It is important to remember that people see what they either want to see or are trained to see." 
      },
      { 
        number: 4, 
        korean: "공상과학은 학생들이 과학 원리를 보도록 도울 뿐만 아니라 그들의 비판적 사고와 창의적 기술을 구축한다.", 
        hints: ["Science fiction", "not only", "helps", "students", "see", "scientific principles", ",", "but also", "builds", "their", "critical thinking", "and creative skills"], 
        type: 'conditional', 
        answer: "Science fiction not only helps students see scientific principles, but also builds their critical thinking and creative skills." 
      },
      { 
        number: 5, 
        korean: "그의 아버지는 그의 아들이 그가 시작하고 있던 새 의류 사업에 그와 함께해 줄 것을 부탁했다.", 
        hints: ["His father", "asked", "his son", "to", "join him", "in", "a new clothing business", "that", "he was", "starting"], 
        type: 'conditional', 
        answer: "His father asked his son to join him in a new clothing business that he was starting." 
      },
    ],
  },
  // UNIT 18: 분사구문
  {
    number: 18,
    title: "분사구문",
    problems: [
      { 
        number: 1, 
        korean: "집안으로 밀고 들어오는 낯선 실루엣의 모습에 놀란 이 개들은 코 대신 눈을 사용하고 있었다.", 
        hints: ["Surprised by", "the vision", "of", "an unfamiliar silhouette", "pushing into", "the house", ",", "these dogs", "were using", "their eyes", "instead of", "their noses"], 
        type: 'conditional', 
        answer: "Surprised by the vision of an unfamiliar silhouette pushing into the house, these dogs were using their eyes instead of their noses." 
      },
      { 
        number: 2, 
        korean: "Richard Rha라는 심리학자가 내성적인 사람들을 불러 모아 수학 수업을 가르치는 척하면서 외향적인 사람처럼 행동하도록 요청했다.", 
        hints: ["A psychologist named", "Richard Rha", "called", "a group of", "introverts", "and asked them", "to act like", "extroverts", ",", "while pretending", "to teach", "a math class"], 
        type: 'conditional', 
        answer: "A psychologist named Richard Rha called a group of introverts and asked them to act like extroverts, while pretending to teach a math class." 
      },
      { 
        number: 3, 
        korean: "형들이 선물을 여는 것을 지켜본 후, 나는 이미 큰 선물이 반드시 가장 좋은 것은 아니라는 것을 알았다.", 
        hints: ["Having watched", "the older children", "opening", "their gifts", ",", "I", "already knew", "that", "the big gifts", "were not necessarily", "the nicest ones"], 
        type: 'conditional', 
        answer: "Having watched the older children opening their gifts, I already knew that the big gifts were not necessarily the nicest ones." 
      },
      { 
        number: 4, 
        korean: "뭔가 빠져 있었을 것이라는 것을 깨닫고, 참모총장은 보고서를 다시 썼다.", 
        hints: ["Realizing", "that", "something", "must have been", "missing", ",", "the chief of staff", "rewrote", "the report"], 
        type: 'conditional', 
        answer: "Realizing that something must have been missing, the chief of staff rewrote the report." 
      },
      { 
        number: 5, 
        korean: "부하들이 눈보라에서 살아남았다는 것에 안도하며, 그들의 지휘관은 어떻게 탈출했는지 물었다.", 
        hints: ["Relieved", "that", "his men", "had survived", "the snowstorm", ",", "their commanding officer", "asked", "how", "they made", "their way out"], 
        type: 'conditional', 
        answer: "Relieved that his men had survived the snowstorm, their commanding officer asked how they made their way out." 
      },
    ],
  },
  // UNIT 19: with 분사구문
  {
    number: 19,
    title: "with 분사구문",
    problems: [
      { 
        number: 1, 
        korean: "나머지 팀이 나를 기다리고 있어서, 나는 여자친구에게 작별인사를 할 시간이 없었다.", 
        hints: ["With", "the rest of", "the team", "waiting for", "me", ",", "I", "had", "no time", "to say goodbye", "to", "my girlfriend"], 
        type: 'conditional', 
        answer: "With the rest of the team waiting for me, I had no time to say goodbye to my girlfriend." 
      },
      { 
        number: 2, 
        korean: "많은 학생들이 우울증과 불안을 보고하면서, 학교 관계자들은 기분을 좋게 하고 스트레스를 줄이기 위해 반려동물 치료 행사를 마련한다.", 
        hints: ["With", "many students", "reporting", "depression", "and anxiety", ",", "school officials", "arrange", "pet therapy events", "to", "spread cheer", "and fight stress"], 
        type: 'conditional', 
        answer: "With many students reporting depression and anxiety, school officials arrange pet therapy events to spread cheer and fight stress." 
      },
      { 
        number: 3, 
        korean: "아이들과 청소년들이 학교에서 식사와 간식을 섭취하므로, 음식 알레르기에 대해 알고 있어야 한다.", 
        hints: ["With", "children", "and teenagers", "consuming", "meals and snacks", "in school", ",", "it is", "necessary", "to be informed", "about", "food allergies"], 
        type: 'conditional', 
        answer: "With children and teenagers consuming meals and snacks in school, it is necessary to be informed about food allergies." 
      },
      { 
        number: 4, 
        korean: "겨우 수천 마리의 들소만 남아 있는 상황에서, 한 평원 사냥꾼이 저녁으로 혀만 잘라내기 위해 미국 들소를 죽였다.", 
        hints: ["With", "only", "a few thousand", "bison", "left", ",", "a plainsman", "killed", "an American bison", "for", "cutting out", "only", "the tongue", "for", "his dinner"], 
        type: 'conditional', 
        answer: "With only a few thousand bison left, a plainsman killed an American bison for cutting out only the tongue for his dinner." 
      },
      { 
        number: 5, 
        korean: "많은 부모들이 일하고 있어서, 아이들은 스스로 점심을 준비해야 한다.", 
        hints: ["With", "many", "parents", "working", ",", "children", "have to", "prepare", "their own", "lunch"], 
        type: 'conditional', 
        answer: "With many parents working, children have to prepare their own lunch." 
      },
    ],
  },
  // UNIT 20: 부정사/접속사/기타
  {
    number: 20,
    title: "부정사/접속사/기타",
    problems: [
      { 
        number: 1, 
        korean: "대부분의 아이들은 부모님이 충분히 엄격하지 않은 것보다 차라리 약간 더 엄격하기를 바란다.", 
        hints: ["Most kids", "would rather", "have", "parents", "that are", "a little", "too strict", "than", "not strict enough"], 
        type: 'conditional', 
        answer: "Most kids would rather have parents that are a little too strict than not strict enough." 
      },
      { 
        number: 2, 
        korean: "우리 각자는 우리의 능력에 자신감을 갖고 목표를 향해 나아갈 수 있도록 격려해주는 사람들이 필요하다.", 
        hints: ["Each of us", "needs", "people", "in our lives", "who", "encourage us", "so that", "we can", "feel confident", "in our capabilities", "and", "move forward", "toward our goals"], 
        type: 'conditional', 
        answer: "Each of us needs people in our lives who encourage us so that we can feel confident in our capabilities and move forward toward our goals." 
      },
      { 
        number: 3, 
        korean: "Bradley와 나는 당신이 올해 다시 체조 여름 캠프를 개최한다는 것을 알게 되어 매우 기뻤다.", 
        hints: ["Bradley and I", "were", "thrilled", "to learn", "that", "you", "are holding", "your", "Gymnastics Summer Camp", "again", "this year"], 
        type: 'conditional', 
        answer: "Bradley and I were thrilled to learn that you are holding your Gymnastics Summer Camp again this year." 
      },
      { 
        number: 4, 
        korean: "당신은 가족에게 '예'라고 말하고는 당신이 가진 양질의 시간 부족에 좌절감을 느낄 수 있다.", 
        hints: ["You", "may say", "'yes'", "to family members", "only to", "feel frustrated", "by", "the lack of", "quality time", "that", "you have"], 
        type: 'conditional', 
        answer: "You may say 'yes' to family members only to feel frustrated by the lack of quality time that you have." 
      },
      { 
        number: 5, 
        korean: "정기적으로 운동하는 것은 신체적 건강뿐만 아니라 정신적 건강도 향상시킨다.", 
        hints: ["Exercising", "regularly", "improves", "not only", "physical health", "but also", "mental health"], 
        type: 'conditional', 
        answer: "Exercising regularly improves not only physical health but also mental health." 
      },
    ],
  },
  // UNIT 21: 가정법 - if 조건절
  {
    number: 21,
    title: "가정법 - if 조건절",
    problems: [
      { 
        number: 1, 
        korean: "그들이 잘 정리된 환경에서 어느 정도 기간 동안 일한다면, 그들은 자신이 얼마나 더 생산적인지에 놀랄 것이다.", 
        hints: ["If", "they", "worked", "in", "a well-organized environment", "for any length of time", ",", "they", "would be", "surprised at", "how much more", "productive", "they were"], 
        type: 'conditional', 
        answer: "If they worked in a well-organized environment for any length of time, they would be surprised at how much more productive they were." 
      },
      { 
        number: 2, 
        korean: "Ernest Hamwi가 zalabia를 팔 때 그 태도를 취했다면, 그는 노점상으로 생을 마감했을 수도 있다.", 
        hints: ["If", "Ernest Hamwi", "had taken", "that attitude", "when", "he was selling", "zalabia", ",", "he", "might have ended", "his days", "as", "a street vendor"], 
        type: 'conditional', 
        answer: "If Ernest Hamwi had taken that attitude when he was selling zalabia, he might have ended his days as a street vendor." 
      },
      { 
        number: 3, 
        korean: "휴대폰으로 복잡한 기계를 어떻게 조작하는지 설명하려 한다면, 당신은 걸음을 멈출 것이다.", 
        hints: ["If", "you", "were", "trying", "to explain", "on the cell phone", "how to operate", "a complex machine", ",", "you", "would", "stop walking"], 
        type: 'conditional', 
        answer: "If you were trying to explain on the cell phone how to operate a complex machine, you would stop walking." 
      },
      { 
        number: 4, 
        korean: "그가 야외 활동의 가장 기본적인 규칙 중 하나를 따랐다면, 그가 직면한 끔찍한 사건은 피할 수 있었을 것이다.", 
        hints: ["If", "he", "had followed", "one of", "the most basic rules", "of outdoor activities", ",", "the horrible incident", "he faced", "could have been", "avoided"], 
        type: 'conditional', 
        answer: "If he had followed one of the most basic rules of outdoor activities, the horrible incident he faced could have been avoided." 
      },
    ],
  },
  // UNIT 22: wish, as if, without
  {
    number: 22,
    title: "wish, as if, without",
    problems: [
      { 
        number: 1, 
        korean: "STEM 지식이 없으면 우리 사회는 생존할 수 없지만, 인문학적 지식이 없어도 우리는 똑같이 빈곤해질 것이다.", 
        hints: ["Our society", "could not survive", "without", "STEM knowledge", ",", "but", "we", "would be", "equally", "impoverished", "without", "humanistic knowledge", "as well"], 
        type: 'conditional', 
        answer: "Our society could not survive without STEM knowledge, but we would be equally impoverished without humanistic knowledge as well." 
      },
      { 
        number: 2, 
        korean: "유아는 주변 사람들의 동요에 마치 그것이 자신의 것인 것처럼 반응하며, 다른 아이의 눈물을 보면 운다.", 
        hints: ["Infants", "react to", "a disturbance", "in those around them", "as if", "it were", "their own", ",", "crying", "when", "they see", "another child's tears"], 
        type: 'conditional', 
        answer: "Infants react to a disturbance in those around them as if it were their own, crying when they see another child's tears." 
      },
      { 
        number: 3, 
        korean: "시에서 더 많은 커뮤니티 정원을 만들어 나 같은 시민들에게 자신의 음식을 재배할 장소를 주었으면 좋겠다.", 
        hints: ["I", "wish", "the city", "would", "build", "more", "community gardens", "and", "give", "the citizens", "like me", "a place", "to grow", "their own food"], 
        type: 'conditional', 
        answer: "I wish the city would build more community gardens and give the citizens like me a place to grow their own food." 
      },
      { 
        number: 4, 
        korean: "Phil이 교장 선생님의 말을 끊는 것을 보았을 때, 나는 마치 객관적으로 무례한 행동을 관찰하는 것 같았다.", 
        hints: ["When", "I", "saw", "Phil", "interrupt", "the principal", ",", "I", "felt", "as if", "I", "were", "observing", "an objectively", "rude act"], 
        type: 'conditional', 
        answer: "When I saw Phil interrupt the principal, I felt as if I were observing an objectively rude act." 
      },
    ],
  },
  // UNIT 23: forget, remember, regret + to-v / -ing
  {
    number: 23,
    title: "forget, remember, regret + to-v / -ing",
    problems: [
      { 
        number: 1, 
        korean: "체육관에 가지 않는 것을 얼마나 후회할지 잠시만 생각해도 운동 동기를 유발하는 데 도움이 될 것이다.", 
        hints: ["Just", "a few moments'", "thinking about", "how much", "you", "will regret", "not going", "to the gym", "will help", "motivate", "you", "to exercise"], 
        type: 'conditional', 
        answer: "Just a few moments' thinking about how much you will regret not going to the gym will help motivate you to exercise." 
      },
      { 
        number: 2, 
        korean: "나는 방 건너편에서 내 딸이 눈에 눈물이 고이는 것을 지켜본 것을 기억한다.", 
        hints: ["I", "remember", "watching", "my daughter", "from across", "the room", ",", "her eyes", "welling with", "tears"], 
        type: 'conditional', 
        answer: "I remember watching my daughter from across the room, her eyes welling with tears." 
      },
      { 
        number: 3, 
        korean: "우리가 '감사합니다'라고 말할 시간을 가지는 것을 잊기 쉽지만, 그것은 다른 사람들과의 상호작용에서 필수적인 부분이다.", 
        hints: ["Although", "it is", "really easy", "for us", "to forget", "to take", "the time", "to say", "'Thank-You'", ",", "it is", "an essential part", "of interaction", "with others"], 
        type: 'conditional', 
        answer: "Although it is really easy for us to forget to take the time to say 'Thank-You', it is an essential part of interaction with others." 
      },
      { 
        number: 4, 
        korean: "그들은 다가오는 터널이나 다리를 주시하는 것을 잊어버릴 정도로 매우 집중했다.", 
        hints: ["They", "were", "so intensely", "focused", "that", "they", "forgot", "to watch", "for", "upcoming", "tunnels", "or", "bridges"], 
        type: 'conditional', 
        answer: "They were so intensely focused that they forgot to watch for upcoming tunnels or bridges." 
      },
    ],
  },
  // UNIT 24: 동명사 관용 표현
  {
    number: 24,
    title: "동명사 관용 표현",
    problems: [
      { 
        number: 1, 
        korean: "가끔씩 간식을 제공하거나 가끔 점심을 사주는 것은 직원들이 감사함을 느끼고 사무실이 더 환영받는 느낌을 주는 데 도움이 될 수 있다.", 
        hints: ["Providing", "an occasional snack", "or", "paying for", "a lunch", "now and then", "can help", "your employees", "feel appreciated", "and", "make", "the office", "feel", "more welcoming"], 
        type: 'conditional', 
        answer: "Providing an occasional snack or paying for a lunch now and then can help your employees feel appreciated and make the office feel more welcoming." 
      },
      { 
        number: 2, 
        korean: "우리가 바닥에 계란을 떨어뜨리거나, 밀가루로 주방을 덮거나, 스토브에서 수프를 끓여 넘친 횟수는 셀 수 없다.", 
        hints: ["We", "can't tell you", "how many times", "we have", "dropped eggs", "on the floor", ",", "coated", "the kitchen", "in flour", ",", "or", "boiled", "soup over", "on the stove"], 
        type: 'conditional', 
        answer: "We can't tell you how many times we have dropped eggs on the floor, coated the kitchen in flour, or boiled soup over on the stove." 
      },
      { 
        number: 3, 
        korean: "재정적 안정은 의미 있다고 생각하지 않는 일과 다음 월급에 대한 걱정에서 우리를 해방시킬 수 있다.", 
        hints: ["Financial security", "can", "liberate us", "from", "work", "we don't find", "meaningful", "and from", "having to worry", "about", "the next paycheck"], 
        type: 'conditional', 
        answer: "Financial security can liberate us from work we don't find meaningful and from having to worry about the next paycheck." 
      },
      { 
        number: 4, 
        korean: "변화하는 사람들은 변화가 가능한지 의문을 품거나 변화할 수 없는 이유를 찾지 않는다.", 
        hints: ["People", "who", "change", "don't", "question", "whether", "change", "is possible", "or", "look for", "reasons", "why", "they", "cannot", "change"], 
        type: 'conditional', 
        answer: "People who change don't question whether change is possible or look for reasons why they cannot change." 
      },
    ],
  },
  // UNIT 25: 비교급 / 동등비교
  {
    number: 25,
    title: "비교급 / 동등비교",
    problems: [
      { 
        number: 1, 
        korean: "과학 분야에서, 효과가 없는 것을 발견하는 것은 효과가 있는 것을 발견하는 것만큼 중요하다.", 
        hints: ["In the field of", "science", ",", "finding out", "what", "does not work", "is", "as important as", "finding out", "what", "does"], 
        type: 'conditional', 
        answer: "In the field of science, finding out what does not work is as important as finding out what does." 
      },
      { 
        number: 2, 
        korean: "큰 동물들은 실제로 작은 동물들보다 등산객들에게 덜 위험하다.", 
        hints: ["Large animals", "are", "actually", "less dangerous", "to", "hikers", "than", "smaller ones"], 
        type: 'conditional', 
        answer: "Large animals are actually less dangerous to hikers than smaller ones." 
      },
      { 
        number: 3, 
        korean: "1999년에, 수입 신선 과일의 시장 점유율은 수입 건조 과일의 두 배였다.", 
        hints: ["In 1999", ",", "the market share", "of", "imported fresh fruit", "was", "twice as much as", "that of", "imported dried fruit"], 
        type: 'conditional', 
        answer: "In 1999, the market share of imported fresh fruit was twice as much as that of imported dried fruit." 
      },
      { 
        number: 4, 
        korean: "당근이나 감자 같은 뿌리채소는 항상 식물의 나머지 부분보다 훨씬 더 달다.", 
        hints: ["Roots", "such as", "carrots", "and", "potatoes", "are", "always", "much sweeter", "than", "the rest of", "the plant"], 
        type: 'conditional', 
        answer: "Roots such as carrots and potatoes are always much sweeter than the rest of the plant." 
      },
      { 
        number: 5, 
        korean: "이 요구사항은 예술의 본질에 관한 것이라기보다 인간 지각 기관의 본질에 관한 것이다.", 
        hints: ["This requirement", "is", "not", "about", "the nature of art", "so much as", "about", "the nature", "of the human", "perceptive apparatus"], 
        type: 'conditional', 
        answer: "This requirement is not about the nature of art so much as about the nature of the human perceptive apparatus." 
      },
    ],
  },
  // UNIT 26: 비교급 / 최상급
  {
    number: 26,
    title: "비교급 / 최상급",
    problems: [
      { 
        number: 1, 
        korean: "많은 언론 보도들이 아침이 하루 세 끼 중 가장 중요하다고 주장한다.", 
        hints: ["Lots of", "media reports", "claim", "that", "breakfast", "is", "the most significant", "out of", "the three meals", "of the day"], 
        type: 'conditional', 
        answer: "Lots of media reports claim that breakfast is the most significant out of the three meals of the day." 
      },
      { 
        number: 2, 
        korean: "아이들에게 자신의 돈을 쓰게 하는 것보다 물건의 가격에 대해 더 빨리 가르쳐주는 것은 없다.", 
        hints: ["Nothing", "teaches", "kids", "quicker", "about", "what things cost", "than", "by giving them", "their own money", "to spend"], 
        type: 'conditional', 
        answer: "Nothing teaches kids quicker about what things cost than by giving them their own money to spend." 
      },
      { 
        number: 3, 
        korean: "대부분의 동물들은 미래에 더 큰 보상보다 지금 당장 작은 보상을 선호한다.", 
        hints: ["Most animals", "prefer", "smaller rewards", "right now", ",", "rather than", "greater ones", "in the future"], 
        type: 'conditional', 
        answer: "Most animals prefer smaller rewards right now, rather than greater ones in the future." 
      },
      { 
        number: 4, 
        korean: "언어는 인간을 다른 동물들과 구별하는 가장 중요한 특징 중 하나이다.", 
        hints: ["Language", "is", "one of", "the most important", "features", "that", "distinguish", "humans", "from", "other animals"], 
        type: 'conditional', 
        answer: "Language is one of the most important features that distinguish humans from other animals." 
      },
      { 
        number: 5, 
        korean: "결혼 성공은 다른 어떤 요인보다 의사소통 능력과 더 밀접하게 연관되어 있다.", 
        hints: ["Marital success", "is", "more closely", "linked to", "communication skills", "than", "to any other", "factor"], 
        type: 'conditional', 
        answer: "Marital success is more closely linked to communication skills than to any other factor." 
      },
    ],
  },
  // UNIT 27: The 비교급, the 비교급
  {
    number: 27,
    title: "The 비교급, the 비교급",
    problems: [
      { 
        number: 1, 
        korean: "그들이 브랜드나 제품을 사용하기 시작하는 나이가 어릴수록, 앞으로 수년간 그것을 계속 사용할 가능성이 더 높다.", 
        hints: ["The younger", "they are", "when", "they start using", "a brand or product", ",", "the more likely", "they are", "to keep using", "it", "for years to come"], 
        type: 'conditional', 
        answer: "The younger they are when they start using a brand or product, the more likely they are to keep using it for years to come." 
      },
      { 
        number: 2, 
        korean: "이 투자에서 나오는 과학이 많을수록, 충분한 이해로 과학의 요점을 따라가야 할 필요성이 더 커진다.", 
        hints: ["The more science", "that emerges", "from", "this investment", ",", "the greater", "the need", "for us", "to follow", "the point", "of the science", "with sufficient understanding"], 
        type: 'conditional', 
        answer: "The more science that emerges from this investment, the greater the need for us to follow the point of the science with sufficient understanding." 
      },
      { 
        number: 3, 
        korean: "무언가가 당신의 심장을 더 빠르게 뛰게 할수록, 한 마디도 말하거나 타이핑하기 전에 한 발 물러서는 것이 더 중요하다.", 
        hints: ["The more", "something", "causes", "your heart", "to race", ",", "the more important", "it is", "to step back", "before speaking", "or typing", "a single word"], 
        type: 'conditional', 
        answer: "The more something causes your heart to race, the more important it is to step back before speaking or typing a single word." 
      },
      { 
        number: 4, 
        korean: "독자에 대해 더 많이 알수록, 그들의 필요와 기대를 충족시킬 가능성이 더 커진다.", 
        hints: ["The more", "you know", "about", "your reader", ",", "the greater", "the chances", "that", "you", "will meet", "their needs", "and expectations"], 
        type: 'conditional', 
        answer: "The more you know about your reader, the greater the chances that you will meet their needs and expectations." 
      },
    ],
  },
  // UNIT 28: 도치
  {
    number: 28,
    title: "도치",
    problems: [
      { 
        number: 1, 
        korean: "훈련된 무능력의 뿌리에는 다양성이 거의 없고 반복적인 작업이 있는 직업이 있다.", 
        hints: ["At the root of", "trained incapacity", "is", "a job", "with", "little variety", "and", "repetitive tasks"], 
        type: 'conditional', 
        answer: "At the root of trained incapacity is a job with little variety and repetitive tasks." 
      },
      { 
        number: 2, 
        korean: "이미지 형성의 물리학 측면에서만 눈과 카메라는 공통점이 있다.", 
        hints: ["Only", "in terms of", "the physics", "of image formation", "do", "the eye", "and camera", "have", "anything", "in common"], 
        type: 'conditional', 
        answer: "Only in terms of the physics of image formation do the eye and camera have anything in common." 
      },
      { 
        number: 3, 
        korean: "정직은 좋은 관계에서 자리가 있지만, 상대방의 기본적인 선함에 대한 추정도 마찬가지이다.", 
        hints: ["Honesty", "has", "its place", "in", "a good relationship", ",", "but", "so does", "the presumption", "of the other's", "basic goodness"], 
        type: 'conditional', 
        answer: "Honesty has its place in a good relationship, but so does the presumption of the other's basic goodness." 
      },
      { 
        number: 4, 
        korean: "집에 도착해서 집 열쇠를 찾으려 했을 때에야 비로소 버스 정류장 벤치에 지갑을 두고 왔다는 것을 깨달았다.", 
        hints: ["Not until", "I got home", "and reached for", "the house key", "did I realize", "that", "I had left", "my purse", "on the bench", "at the bus stop"], 
        type: 'conditional', 
        answer: "Not until I got home and reached for the house key did I realize that I had left my purse on the bench at the bus stop." 
      },
      { 
        number: 5, 
        korean: "집에 도착하자마자 나는 그것이 비어 있다는 것을 깨달았다.", 
        hints: ["No sooner", "had", "I", "reached", "the house", "than", "I", "realized", "it", "was", "empty"], 
        type: 'conditional', 
        answer: "No sooner had I reached the house than I realized it was empty." 
      },
    ],
  },
  // UNIT 29: 강조/it takes/get+pp
  {
    number: 29,
    title: "강조/it takes/get+pp",
    problems: [
      { 
        number: 1, 
        korean: "Lippershey가 아니라 그의 아이들이 이중 렌즈가 근처의 풍향계를 더 크게 보이게 한다는 것을 발견했다.", 
        hints: ["It was", "not", "Lippershey", "but", "his children", "who", "discovered", "that", "the double lenses", "made", "a nearby weathervane", "look", "bigger"], 
        type: 'conditional', 
        answer: "It was not Lippershey but his children who discovered that the double lenses made a nearby weathervane look bigger." 
      },
      { 
        number: 2, 
        korean: "사람들이 그에게 우울하게 만드는 것은 그의 생각이라고 말해도, 그는 그것을 받아들이지 않았다.", 
        hints: ["Even if", "people", "told him", "that", "it was", "his thinking", "that", "was depressing", "him", ",", "he", "didn't accept", "it"], 
        type: 'conditional', 
        answer: "Even if people told him that it was his thinking that was depressing him, he didn't accept it." 
      },
      { 
        number: 3, 
        korean: "그의 아버지는 페인트를 약간 흘리긴 했지만, 즐기면서 더 보기 좋은 벽을 만들었다.", 
        hints: ["His father", "did", "spill", "a few drops", "of paint", "but", "made", "a better-looking wall", "while", "having fun"], 
        type: 'conditional', 
        answer: "His father did spill a few drops of paint but made a better-looking wall while having fun." 
      },
      { 
        number: 4, 
        korean: "9시가 지나서야 비행기가 이륙을 위해 바다를 향해 활주로를 달리기 시작했다.", 
        hints: ["It wasn't", "until", "after 9", "that", "an airplane", "started", "to run down", "the runway", "toward", "the ocean", "for", "takeoff"], 
        type: 'conditional', 
        answer: "It wasn't until after 9 that an airplane started to run down the runway toward the ocean for takeoff." 
      },
      { 
        number: 5, 
        korean: "주차장이 가장 찬 레스토랑이 보통 가장 좋은 음식을 가지고 있다.", 
        hints: ["The restaurant", "with", "the fullest", "parking lot", "usually", "does have", "the best", "food"], 
        type: 'conditional', 
        answer: "The restaurant with the fullest parking lot usually does have the best food." 
      },
    ],
  },
  // UNIT 30: 기타 주요 구문
  {
    number: 30,
    title: "기타 주요 구문",
    problems: [
      { 
        number: 1, 
        korean: "전 세계 남성들이 화장품에서 성형수술까지 모든 것에 수십억 달러를 쓰고 있다.", 
        hints: ["Men", "all over the world", "are spending", "billions of dollars", "on", "everything", "from", "cosmetics", "to", "plastic surgery"], 
        type: 'conditional', 
        answer: "Men all over the world are spending billions of dollars on everything from cosmetics to plastic surgery." 
      },
      { 
        number: 2, 
        korean: "새 직원이 그의 새 직업을 익히는 데 어려움을 겪고 있다.", 
        hints: ["A new employee", "has been", "having", "trouble", "mastering", "his new job"], 
        type: 'conditional', 
        answer: "A new employee has been having trouble mastering his new job." 
      },
      { 
        number: 3, 
        korean: "새 단어를 배울 때, 그 단어를 숙달하기 위해서는 다양한 간격으로 여러 번 반복해야 한다.", 
        hints: ["When", "you learn", "a new word", ",", "it takes", "several repetitions", "at", "various intervals", "for", "the word", "to be", "mastered"], 
        type: 'conditional', 
        answer: "When you learn a new word, it takes several repetitions at various intervals for the word to be mastered." 
      },
      { 
        number: 4, 
        korean: "정보가 매우 좋든 매우 나쁘든, 사람이 정보를 처리하는 데는 시간이 걸린다.", 
        hints: ["It takes", "time", "for", "a person", "to", "process", "information", "whether", "it is", "very good", "or", "very bad"], 
        type: 'conditional', 
        answer: "It takes time for a person to process information whether it is very good or very bad." 
      },
      { 
        number: 5, 
        korean: "충분한 잠을 자고 있다면, 상쾌함을 느끼고 침대에서 일어나는 데 어려움이 없어야 한다.", 
        hints: ["If", "you are", "getting", "sufficient sleep", ",", "you should", "feel", "refreshed", "and", "not have trouble", "getting out of", "bed"], 
        type: 'conditional', 
        answer: "If you are getting sufficient sleep, you should feel refreshed and not have trouble getting out of bed." 
      },
    ],
  },
];
