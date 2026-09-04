/* ORUN FLOW — 먼저 보기(모델) + 훈련 3문장
   토큰 역할: s 주어 · v 본동사 · c 접속사 · s2 종속절 주어 · v2 종속절 동사 · m 수식어 · null 기타 */
module.exports = {
"01":{
 model:{n:"⑧",
  toks:[["If","c"],["the writer","s2"],["cannot repeat","v2"],["it,",null],
        ["a translator","s"],["in another country","m"],["certainly",null],["cannot reproduce","v"],["it.",null]],
  ko:"작가조차 그 순간을 되풀이할 수 없다면, 다른 나라의 번역자는 더더욱 그것을 재현할 수 없다."},
 drill:[
  {n:"③",en:"Each country writes its literature in its own tongue, so no reader can reach all of it.",
   ans:"S Each country · △V writes · M in its own tongue · [so] S′ no reader · △V′ can reach",
   ko:"나라마다 자기 언어로 문학을 쓰기 때문에, 어떤 독자도 그것을 전부 읽을 수는 없다."},
  {n:"⑩",en:"A word may sound bright and alive to people who grew up with it, and mean almost nothing to everyone else.",
   ans:"S A word · △V may sound / (may) mean · M to people who grew up with it, to everyone else",
   ko:"어떤 낱말은 함께 자란 사람들에게는 생생하게 들리지만, 다른 사람에게는 거의 아무 의미가 없다."},
  {n:"⑬",en:"Moods, images, and even thoughts are tied to words; once the words change, the rest changes as well.",
   ans:"S Moods, images, and even thoughts · △V are tied · [once] S′ the words · △V′ change · S the rest · △V changes",
   ko:"분위기와 이미지, 생각까지도 말에 묶여 있어서, 말이 바뀌면 나머지도 바뀐다."}]},
"02":{
 model:{n:"⑤",
  toks:[["Everyone","s"],["who speaks English","m"],["understands","v"],["the word “food,”",null],
        ["even though","c"],["each person","s2"],["pictures","v2"],["a different dish.",null]],
  ko:"각자 떠올리는 음식은 다르더라도, 영어를 쓰는 사람은 누구나 ‘food’라는 말을 이해한다."},
 drill:[
  {n:"④",en:"They are invented sounds, written with invented letters, and joined by a grammar that a culture has agreed on.",
   ans:"S They · △V are · M written with invented letters, joined by a grammar …",
   ko:"그것들은 만들어진 소리이고, 만들어진 문자로 적히며, 한 문화가 합의한 문법으로 이어진다."},
  {n:"⑨",en:"The picture appears to arrive directly, so we treat it as reality itself.",
   ans:"S The picture · △V appears · M directly · [so] S′ we · △V′ treat · O it",
   ko:"그림은 곧바로 도착하는 것처럼 보여서, 우리는 그것을 현실 그 자체로 여긴다."},
  {n:"⑫",en:"Whether it is painted, photographed, or built on a screen, it is still a version of the thing, not the thing.",
   ans:"[Whether] S′ it · △V′ is painted / photographed / built · S it · △V is · C a version of the thing",
   ko:"그려졌든 사진이든 화면 위의 것이든, 그것은 사물의 한 판본일 뿐 사물 자체가 아니다."}]},
"03":{
 model:{n:"⑫",
  toks:[["We","s"],["practise","v"],["so that","c"],["we","s2"],["are","v2"],["free to fly",null],
        ["wherever the music asks.","m"]],
  ko:"우리는 음악이 요구하는 곳 어디로든 자유롭게 날아가기 위해 연습한다."},
 drill:[
  {n:"②",en:"Playing the piano is not only remembering notes; it is physical work that needs reflex and endurance.",
   ans:"S Playing the piano · △V is · C remembering notes · S it · △V is · C physical work · M that needs reflex and endurance",
   ko:"피아노 연주는 음을 외우는 일만이 아니라, 반사 신경과 지구력이 필요한 육체노동이다."},
  {n:"④",en:"So the question is not whether to practise, but how to make the long hours offstage serve the short hours onstage.",
   ans:"S the question · △V is · C not whether to practise, but how to make …",
   ko:"문제는 연습을 할지 말지가 아니라, 무대 밖의 긴 시간을 무대 위에 쓰는 방법이다."},
  {n:"⑪",en:"The bolts of an aircraft matter enormously, but once you sit in the cockpit your eyes look ahead, not down.",
   ans:"S The bolts · M of an aircraft · △V matter · [but / once] S′ you · △V′ sit · S your eyes · △V look",
   ko:"비행기의 볼트는 대단히 중요하지만, 조종석에 앉으면 눈은 앞을 본다."}]},
"04":{
 model:{n:"⑩",
  toks:[["When","c"],["she","s2"],["is finally brought back","v2"],["to the castle,","m"],
        ["she","s"],["has","v"],["no way to face what is waiting there.",null]],
  ko:"마침내 성으로 돌아왔을 때, 그녀에게는 그곳에서 기다리는 것을 감당할 방법이 없다."},
 drill:[
  {n:"②",en:"They plan a great celebration and welcome everyone who loves her — everyone except Maleficent.",
   ans:"S They · △V plan / welcome · O a great celebration / everyone · M who loves her, except Maleficent",
   ko:"그들은 성대한 잔치를 계획하고 그녀를 사랑하는 모든 사람을 맞이한다 — 말레피센트만 빼고."},
  {n:"⑦",en:"The two rulers are building a world around Aurora with nothing dangerous in it.",
   ans:"S The two rulers · △V are building · O a world · M around Aurora, with nothing dangerous in it",
   ko:"두 통치자는 오로라 주위에 위험한 것이 하나도 없는 세계를 세우고 있다."},
  {n:"⑨",en:"Sixteen years without risk leave her innocent, untested, and weak.",
   ans:"S Sixteen years · M without risk · △V leave · O her · C innocent, untested, and weak",
   ko:"위험이 없는 열여섯 해는 그녀를 순진하고 시험받지 못하고 나약하게 남겨 둔다."}]},
"05":{
 model:{n:"⑬",
  toks:[["Literature itself","s"],["is","v"],["one long conversation,",null],["and","c"],
        ["you","s2"],["join","v2"],["it",null],["fully",null],["only when you start talking.","m"]],
  ko:"문학 그 자체가 하나의 긴 대화이며, 우리는 말을 하기 시작할 때에야 비로소 온전히 참여한다."},
 drill:[
  {n:"⑥",en:"When you read different kinds of writing, from different times and places, you often come to love books you would never have chosen alone.",
   ans:"[When] S′ you · △V′ read · S you · △V come to love · O books · M you would never have chosen alone",
   ko:"서로 다른 시대와 장소의 글을 읽다 보면, 혼자서는 고르지 않았을 책을 사랑하게 된다."},
  {n:"⑨",en:"Writing about a work, and talking about it with other students, forces you to look more closely and to consider views that are not your own.",
   ans:"S Writing … and talking … · △V forces · O you · M to look more closely, to consider views that are not your own",
   ko:"작품에 대해 쓰고 다른 학생들과 이야기하는 일은 더 가까이 보고 다른 관점을 고려하게 만든다."},
  {n:"⑩",en:"A clear understanding of what a story is doing does not arrive like lightning from a blue sky.",
   ans:"S A clear understanding · M of what a story is doing · △V does not arrive · M like lightning from a blue sky",
   ko:"이야기가 무엇을 하는지에 대한 분명한 이해는 맑은 하늘의 번개처럼 오지 않는다."}]}
};
