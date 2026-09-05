-- DAY 1~DAY 20의 단어들에 대한 meaning 타입 캐시 삭제
-- 삭제 후 다음 퀴즈 실행 시 새로운 선지가 GPT를 통해 생성되어 저장됨

DELETE FROM word_quiz_cache 
WHERE quiz_type = 'meaning'
AND word IN (
  -- DAY 1
  'brave', 'shy', 'kind', 'friendly', 'clever', 'smart', 'wise', 'foolish', 'stupid', 'rude',
  'serious', 'mean', 'gentle', 'honesty', 'humor', 'cheerful', 'curious', 'wonder', 'character',
  'on one''s own', 'creative', 'active', 'lively', 'pretend', 'temper', 'attitude', 'personality',
  'modest', 'optimistic', 'get along', 'young', 'old', 'tall', 'short', 'big', 'giant', 'fat', 'slim', 'skinny',
  -- DAY 2
  'weak', 'pretty', 'beauty', 'lovely', 'handsome', 'seem', 'image', 'beard', 'bald', 'spot',
  'different from', 'sideburns', 'overweight', 'male', 'female', 'pale', 'cheek', 'wrinkle', 'forehead',
  'eyebrow', 'eyelash', 'shoulder', 'elbow', 'wrist', 'thumb', 'knee', 'ankle', 'heel', 'toe', 'chin',
  'muscle', 'bone', 'skin', 'blood', 'tongue', 'lip', 'lung', 'stomach', 'throat', 'jaw',
  -- DAY 3
  'sight', 'smell', 'taste', 'touch', 'sense', 'feel', 'blind', 'deaf', 'breathe', 'breath',
  'sweat', 'brain', 'heart', 'organ', 'mental', 'physical', 'suffer', 'pain', 'ache', 'hurt',
  'sore', 'wound', 'bleed', 'bruise', 'scar', 'injury', 'injure', 'itch', 'symptom', 'sneeze',
  'cough', 'fever', 'dizzy', 'nausea', 'vomit', 'diarrhea', 'fatigue', 'exhausted', 'sick', 'ill',
  -- DAY 4
  'disease', 'cancer', 'diabetes', 'infection', 'infect', 'virus', 'bacteria', 'immune', 'allergy',
  'allergic', 'asthma', 'patient', 'cure', 'heal', 'treat', 'treatment', 'therapy', 'surgery', 'operate',
  'operation', 'medicine', 'drug', 'pill', 'dose', 'prescription', 'pharmacy', 'pharmacist', 'vaccine',
  'inject', 'injection', 'bandage', 'cast', 'crutch', 'wheelchair', 'ambulance', 'emergency', 'hospital',
  'clinic', 'doctor', 'nurse',
  -- DAY 5
  'physician', 'surgeon', 'dentist', 'psychiatrist', 'psychologist', 'therapist', 'examine', 'examination',
  'diagnose', 'diagnosis', 'check-up', 'test', 'scan', 'x-ray', 'recover', 'recovery', 'improve',
  'improvement', 'health', 'healthy', 'fit', 'fitness', 'exercise', 'workout', 'diet', 'nutrition',
  'nutrient', 'vitamin', 'protein', 'carbohydrate', 'calorie', 'appetite', 'digest', 'digestion',
  'absorb', 'metabolism', 'obesity', 'underweight', 'balance', 'balanced',
  -- DAY 6
  'stress', 'anxious', 'anxiety', 'nervous', 'tense', 'tension', 'relax', 'relaxation', 'calm',
  'peaceful', 'comfortable', 'uncomfortable', 'rest', 'sleep', 'asleep', 'awake', 'wake', 'dream',
  'nightmare', 'snore', 'insomnia', 'nap', 'yawn', 'tired', 'sleepy', 'drowsy', 'refresh', 'refreshed',
  'energetic', 'energy', 'strength', 'strong', 'powerful', 'power', 'force', 'vigor', 'vigorous',
  'vital', 'vitality', 'lively',
  -- DAY 7
  'happy', 'happiness', 'joy', 'joyful', 'pleased', 'pleasure', 'delight', 'delighted', 'glad',
  'satisfied', 'satisfaction', 'content', 'contented', 'excited', 'excitement', 'thrill', 'thrilled',
  'enthusiastic', 'enthusiasm', 'eager', 'passion', 'passionate', 'emotion', 'emotional', 'mood',
  'feeling', 'sentiment', 'sentimental', 'sensitive', 'sensitivity', 'sensible', 'reasonable', 'rational',
  'logical', 'logic', 'intuition', 'intuitive', 'instinct', 'instinctive', 'impulse',
  -- DAY 8
  'impulsive', 'spontaneous', 'deliberate', 'careful', 'careless', 'cautious', 'caution', 'alert',
  'aware', 'awareness', 'conscious', 'consciousness', 'unconscious', 'subconscious', 'mind', 'mindful',
  'thoughtful', 'thought', 'think', 'believe', 'belief', 'opinion', 'view', 'perspective', 'point of view',
  'standpoint', 'position', 'stance', 'attitude', 'approach', 'method', 'way', 'manner', 'style',
  'fashion', 'trend', 'tendency', 'habit', 'custom', 'tradition',
  -- DAY 9
  'traditional', 'conventional', 'conservative', 'liberal', 'progressive', 'radical', 'moderate',
  'extreme', 'excessive', 'excess', 'sufficient', 'enough', 'adequate', 'insufficient', 'lack', 'shortage',
  'scarce', 'scarcity', 'rare', 'rarity', 'common', 'ordinary', 'usual', 'unusual', 'normal', 'abnormal',
  'regular', 'irregular', 'standard', 'typical', 'atypical', 'unique', 'special', 'particular', 'specific',
  'general', 'universal', 'global', 'local', 'regional',
  -- DAY 10
  'national', 'international', 'domestic', 'foreign', 'abroad', 'overseas', 'native', 'immigrant',
  'emigrant', 'refugee', 'citizen', 'citizenship', 'nationality', 'ethnic', 'ethnicity', 'race', 'racial',
  'culture', 'cultural', 'civilization', 'civilized', 'society', 'social', 'community', 'public', 'private',
  'individual', 'personal', 'collective', 'group', 'team', 'organization', 'institution', 'establishment',
  'foundation', 'association', 'union', 'alliance', 'partnership',
  -- DAY 11
  'cooperation', 'cooperate', 'collaborate', 'collaboration', 'participate', 'participation', 'contribute',
  'contribution', 'volunteer', 'voluntary', 'involve', 'involvement', 'engage', 'engagement', 'commit',
  'commitment', 'dedicate', 'dedication', 'devote', 'devotion', 'loyal', 'loyalty', 'faithful', 'faith',
  'trust', 'reliable', 'reliability', 'depend', 'dependable', 'independent', 'independence', 'freedom',
  'free', 'liberty', 'liberate', 'liberation', 'release', 'relieve', 'relief',
  -- DAY 12
  'support', 'assist', 'assistance', 'aid', 'help', 'helpful', 'benefit', 'beneficial', 'advantage',
  'advantageous', 'disadvantage', 'harm', 'harmful', 'harmless', 'damage', 'destroy', 'destruction',
  'destructive', 'ruin', 'spoil', 'waste', 'wasteful', 'save', 'rescue', 'protect', 'protection',
  'defend', 'defense', 'guard', 'secure', 'security', 'safe', 'safety', 'danger', 'dangerous', 'risk',
  'risky', 'threaten', 'threat', 'vulnerable',
  -- DAY 13
  'expose', 'exposure', 'reveal', 'hide', 'conceal', 'secret', 'mysterious', 'mystery', 'puzzle',
  'confuse', 'confusion', 'complex', 'complexity', 'complicated', 'simple', 'simplify', 'simplicity',
  'easy', 'difficult', 'difficulty', 'hard', 'tough', 'challenge', 'challenging', 'obstacle', 'barrier',
  'hurdle', 'overcome', 'conquer', 'defeat', 'victory', 'triumph', 'success', 'successful', 'succeed',
  'achieve', 'achievement', 'accomplish', 'accomplishment', 'fulfill',
  -- DAY 14
  'fulfillment', 'complete', 'completion', 'finish', 'end', 'conclude', 'conclusion', 'final', 'finally',
  'ultimate', 'ultimately', 'eventual', 'eventually', 'initial', 'initially', 'begin', 'beginning', 'start',
  'commence', 'launch', 'initiate', 'introduce', 'introduction', 'establish', 'create', 'creation', 'invent',
  'invention', 'discover', 'discovery', 'find', 'found', 'develop', 'development', 'grow', 'growth',
  'expand', 'expansion', 'extend',
  -- DAY 15
  'extension', 'spread', 'increase', 'rise', 'raise', 'boost', 'enhance', 'improve', 'advance',
  'progress', 'proceed', 'continue', 'continuous', 'constant', 'steady', 'stable', 'stability', 'maintain',
  'sustain', 'sustainable', 'persist', 'persistent', 'remain', 'stay', 'keep', 'preserve', 'conserve',
  'conservation', 'retain', 'restore', 'restoration', 'renew', 'renewal', 'revive', 'revival', 'recover',
  'rebuild', 'reconstruct', 'reform', 'transform',
  -- DAY 16
  'transformation', 'convert', 'conversion', 'change', 'alter', 'modify', 'modification', 'adjust',
  'adjustment', 'adapt', 'adaptation', 'flexible', 'flexibility', 'rigid', 'rigidity', 'stiff', 'firm',
  'solid', 'liquid', 'gas', 'vapor', 'steam', 'smoke', 'fog', 'mist', 'cloud', 'rain', 'snow', 'ice',
  'freeze', 'melt', 'boil', 'heat', 'warm', 'hot', 'cool', 'cold', 'temperature', 'degree',
  -- DAY 17
  'weather', 'climate', 'season', 'spring', 'summer', 'autumn', 'fall', 'winter', 'sunny', 'cloudy',
  'rainy', 'snowy', 'windy', 'stormy', 'storm', 'thunder', 'lightning', 'flood', 'drought', 'hurricane',
  'tornado', 'earthquake', 'disaster', 'catastrophe', 'calamity', 'crisis', 'emergency', 'urgent', 'urgency',
  'immediate', 'instant', 'sudden', 'abrupt', 'gradual', 'slow', 'quick', 'fast', 'rapid', 'swift',
  -- DAY 18
  'speed', 'pace', 'rate', 'frequency', 'frequent', 'often', 'sometimes', 'occasionally', 'rarely',
  'seldom', 'never', 'always', 'usually', 'normally', 'generally', 'typically', 'commonly', 'mostly',
  'mainly', 'primarily', 'chiefly', 'largely', 'greatly', 'highly', 'extremely', 'very', 'quite', 'rather',
  'fairly', 'pretty', 'somewhat', 'slightly', 'hardly', 'barely', 'scarcely', 'almost', 'nearly', 'approximately',
  'about', 'around',
  -- DAY 19
  'exactly', 'precisely', 'accurately', 'correctly', 'properly', 'appropriately', 'suitably', 'adequately',
  'sufficiently', 'completely', 'entirely', 'totally', 'fully', 'wholly', 'absolutely', 'utterly', 'thoroughly',
  'perfectly', 'ideally', 'optimally', 'maximally', 'minimally', 'partially', 'partly', 'somewhat', 'half',
  'quarter', 'third', 'double', 'triple', 'multiple', 'single', 'sole', 'only', 'alone', 'lonely', 'isolated',
  'separate', 'apart', 'together',
  -- DAY 20
  'united', 'unity', 'union', 'join', 'combine', 'merge', 'blend', 'mix', 'mixture', 'compound',
  'element', 'component', 'ingredient', 'material', 'substance', 'matter', 'object', 'thing', 'item',
  'article', 'product', 'goods', 'merchandise', 'commodity', 'resource', 'supply', 'demand', 'need',
  'require', 'requirement', 'necessity', 'essential', 'necessary', 'vital', 'crucial', 'critical', 'important',
  'significance', 'significant', 'meaningful'
);