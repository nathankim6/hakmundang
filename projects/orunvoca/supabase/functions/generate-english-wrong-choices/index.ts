import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { correctWord, englishDefinition, koreanMeaning, numberOfChoices = 3 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!correctWord) {
      throw new Error('correctWord is required');
    }

    console.log(`Generating English wrong choices for: "${correctWord}" with meaning: "${koreanMeaning || englishDefinition}"`);

    // 다양한 오답을 위한 랜덤 시드 생성
    const randomSeed = Math.random().toString(36).substring(7);
    const timestamp = Date.now();
    
    // 정답 단어의 대략적인 음절 수 추정 (난이도 지표)
    const estimateSyllables = (word: string): number => {
      const vowelGroups = word.toLowerCase().match(/[aeiouy]+/g);
      return vowelGroups ? vowelGroups.length : 1;
    };
    const targetSyllables = estimateSyllables(correctWord);
    const difficultyHint = targetSyllables <= 2 ? 'simple (1-2 syllables)' : 
                           targetSyllables <= 3 ? 'intermediate (2-3 syllables)' : 
                           'advanced (3+ syllables)';
    
    const prompt = `You are a vocabulary test expert creating high-quality English distractors.

[TARGET WORD]: "${correctWord}"
[MEANING]: "${koreanMeaning || englishDefinition || ''}"
[DIFFICULTY LEVEL]: ${difficultyHint} - distractors MUST match this complexity
[UNIQUE ID]: ${randomSeed}-${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: PART OF SPEECH DETECTION (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyze "${correctWord}" and its meaning to determine the EXACT part of speech.

Detection Rules:
• NOUN: person, place, thing, concept, abstract idea
  - English: -tion, -ment, -ness, -ity, -er, -or, -ism, -ance, -ence
  - Korean: 것, 자, 성, 화, 움, ~이다 (without 하다)

• VERB: action, state, occurrence  
  - English: -ate, -ize, -ify, -en, base verbs (run, make, give)
  - Korean: ~하다, ~되다, ~시키다, ~짓다

• ADJECTIVE: describes nouns
  - English: -tive, -ous, -ful, -less, -able, -ible, -al, -ic, -ent, -ant, -ary, -ory
  - Korean: ~적인, ~한, ~스러운, ~로운

• ADVERB: describes verbs/adjectives/other adverbs
  - English: -ly (mostly)
  - Korean: ~게, ~히, ~으로

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: GENERATE ${numberOfChoices} DISTRACTORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANDATORY REQUIREMENTS:
✓ SAME part of speech as "${correctWord}" (100% required)
✓ SAME difficulty level: ${difficultyHint}
✓ SIMILAR word length (±3 characters from "${correctWord}")
✓ CEFR B1-C1 vocabulary level
✓ Semantically COMPLETELY UNRELATED to the target meaning
✓ From a COMPLETELY DIFFERENT topic/domain/field than "${correctWord}"

CRITICAL - SEMANTIC DISTANCE RULES:
• Each distractor must be from a DIFFERENT semantic field than "${correctWord}"
• If "${correctWord}" is about emotions → distractors must NOT be about emotions, feelings, or mental states
• If "${correctWord}" is about science → distractors must NOT be about science or technology
• If "${correctWord}" is about movement → distractors must NOT be about motion or direction
• Distractors should feel RANDOM and UNRELATED when placed next to "${correctWord}"
• A student should NEVER be able to guess the answer by eliminating related words

FORBIDDEN:
✗ Different part of speech
✗ Synonyms, antonyms, or semantically related words
✗ Words from same topic/domain/semantic field as "${correctWord}"
✗ Words that could be associated with "${correctWord}" in any context
✗ Words matching ANY other dictionary sense of "${correctWord}" (polysemy) - never acceptable as a second correct answer
✗ Common test words: substantial, preliminary, concurrent, comprehensive, significant

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT (JSON only, no markdown)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{"detectedPartOfSpeech": "noun/verb/adjective/adverb", "wrongChoices": ["word1", "word2", "word3"]}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { 
            role: 'system', 
            content: `You are a professional vocabulary test designer. Your ONLY task is to generate distractors that:
1. Have the EXACT SAME part of speech as the target word (this is non-negotiable)
2. Match the difficulty/complexity level of the target word
3. Are from COMPLETELY DIFFERENT semantic fields - absolutely NO topical or conceptual overlap with the target word
4. Are appropriate for intermediate-advanced English learners
5. Would make it IMPOSSIBLE for a student to guess the answer by eliminating related words

CRITICAL: If the target is a NOUN, ALL distractors must be NOUNS.
If the target is a VERB, ALL distractors must be VERBS.
If the target is an ADJECTIVE, ALL distractors must be ADJECTIVES.
If the target is an ADVERB, ALL distractors must be ADVERBS.

SEMANTIC DISTANCE IS PARAMOUNT: Each distractor must come from a completely different domain/topic than the target word. For example, if the target is "subjective" (opinion-related), distractors should NOT be other opinion/judgment words like "objective", "biased", "partial". Instead use words like "cylindrical", "volcanic", "nocturnal" - same POS, similar level, but totally unrelated topic.

Respond ONLY with clean JSON. No explanation, no markdown.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('AI Response:', generatedContent);

    // JSON 파싱 시도
    let wrongChoices: string[];
    let detectedPartOfSpeech: string = '';
    try {
      // JSON 블록 추출 (마크다운 코드 블록 처리)
      let jsonStr = generatedContent;
      const jsonMatch = generatedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      
      const parsed = JSON.parse(jsonStr);
      
      // 새로운 형식: {detectedPartOfSpeech, wrongChoices}
      if (parsed.wrongChoices && Array.isArray(parsed.wrongChoices)) {
        wrongChoices = parsed.wrongChoices;
        detectedPartOfSpeech = parsed.detectedPartOfSpeech || '';
        console.log('AI detected part of speech:', detectedPartOfSpeech);
      } else if (Array.isArray(parsed)) {
        // 이전 형식 호환: 배열만 반환된 경우
        wrongChoices = parsed;
      } else {
        throw new Error('Invalid response format');
      }

      // 정답과 중복되는 선택지 제거
      wrongChoices = wrongChoices.filter(choice => 
        choice.toLowerCase() !== correctWord.toLowerCase()
      );

      // 필요한 개수만큼 자르기
      wrongChoices = wrongChoices.slice(0, numberOfChoices);

    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedContent);
      // Fallback: 품사별 다양한 영어 오답 선택지 풀
      const fallbackPools = {
        'verb': [
          'abandon', 'accelerate', 'acknowledge', 'acquire', 'advocate', 'anticipate', 'articulate',
          'collaborate', 'compensate', 'consolidate', 'contribute', 'cultivate', 'demonstrate',
          'deteriorate', 'diminish', 'distinguish', 'elaborate', 'eliminate', 'embrace', 'emphasize',
          'endure', 'enhance', 'escalate', 'evaluate', 'exaggerate', 'exceed', 'exhibit', 'exploit',
          'flourish', 'generate', 'hesitate', 'illustrate', 'incorporate', 'indicate', 'initiate',
          'innovate', 'integrate', 'interpret', 'intervene', 'investigate', 'justify', 'manipulate',
          'navigate', 'negotiate', 'observe', 'obtain', 'occupy', 'oppose', 'overcome', 'perceive',
          'persist', 'persuade', 'portray', 'precede', 'predict', 'preserve', 'prevail', 'proceed',
          'prohibit', 'promote', 'propose', 'pursue', 'reinforce', 'reject', 'relocate', 'resemble',
          'resolve', 'restore', 'retain', 'reveal', 'revise', 'stimulate', 'sustain', 'terminate',
          'tolerate', 'transform', 'transmit', 'undergo', 'undertake', 'validate', 'withdraw'
        ],
        'noun': [
          'abundance', 'achievement', 'acquisition', 'adaptation', 'administration', 'adversity',
          'allegiance', 'ambiguity', 'amendment', 'apparatus', 'appreciation', 'arrangement',
          'assumption', 'boundary', 'bureaucracy', 'capability', 'circumstance', 'coalition',
          'commodity', 'compensation', 'complexity', 'configuration', 'consensus', 'constraint',
          'controversy', 'correlation', 'criterion', 'deficiency', 'dimension', 'discipline',
          'disposition', 'distinction', 'diversity', 'duration', 'efficiency', 'emergence',
          'endeavor', 'enterprise', 'enthusiasm', 'equivalent', 'evolution', 'expedition',
          'expertise', 'flexibility', 'fluctuation', 'foundation', 'fragment', 'harmony',
          'heritage', 'hypothesis', 'implication', 'incentive', 'indication', 'infrastructure',
          'initiative', 'innovation', 'institution', 'integration', 'integrity', 'intensity',
          'interaction', 'intervention', 'jurisdiction', 'magnitude', 'manifestation', 'mechanism',
          'methodology', 'modification', 'momentum', 'narrative', 'necessity', 'occurrence',
          'obstacle', 'orientation', 'paradox', 'phenomenon', 'portfolio', 'precedent', 'precision',
          'prevalence', 'priority', 'prosperity', 'provision', 'proximity', 'rationale', 'reliability',
          'remnant', 'renaissance', 'resilience', 'resolution', 'revelation', 'scrutiny', 'segment',
          'simulation', 'solidarity', 'spectrum', 'stimulus', 'strategy', 'succession', 'surveillance',
          'symmetry', 'syndrome', 'terminology', 'threshold', 'trajectory', 'transition', 'validity'
        ],
        'adjective': [
          'abundant', 'accessible', 'acute', 'adequate', 'adjacent', 'adverse', 'ambiguous',
          'ample', 'anonymous', 'apparent', 'arbitrary', 'authentic', 'autonomous', 'beneficial',
          'bizarre', 'chronic', 'coherent', 'compatible', 'compelling', 'complementary', 'concise',
          'conducive', 'confidential', 'consistent', 'conspicuous', 'conventional', 'credible',
          'crucial', 'cumulative', 'decisive', 'deliberate', 'dense', 'detrimental', 'distinct',
          'diverse', 'dominant', 'drastic', 'dynamic', 'elaborate', 'eligible', 'elusive',
          'empirical', 'equivalent', 'erratic', 'ethical', 'evident', 'excessive', 'exclusive',
          'explicit', 'extensive', 'feasible', 'flexible', 'formidable', 'fragile', 'fundamental',
          'genuine', 'gradual', 'graphic', 'hazardous', 'horizontal', 'hostile', 'humble',
          'identical', 'immense', 'implicit', 'inclined', 'indigenous', 'inevitable', 'infinite',
          'inherent', 'innovative', 'integral', 'intense', 'intermediate', 'intimate', 'intricate',
          'intrinsic', 'intuitive', 'legitimate', 'liable', 'liberal', 'literal', 'logical',
          'lucrative', 'marginal', 'medieval', 'meticulous', 'minimal', 'moderate', 'mutual',
          'negligible', 'nominal', 'notorious', 'novel', 'obsolete', 'optimal', 'orthodox',
          'paramount', 'passive', 'peripheral', 'persistent', 'plausible', 'pragmatic', 'precise',
          'predominant', 'prevalent', 'primitive', 'profound', 'prominent', 'proportional', 'prospective',
          'provisional', 'prudent', 'radical', 'random', 'rational', 'redundant', 'relevant',
          'reliable', 'reluctant', 'remote', 'renowned', 'repetitive', 'respective', 'rigid',
          'robust', 'rural', 'scarce', 'secular', 'simultaneous', 'skeptical', 'sophisticated',
          'spontaneous', 'stable', 'static', 'strategic', 'stringent', 'structural', 'subordinate',
          'subtle', 'successive', 'superficial', 'supplementary', 'sustainable', 'symbolic',
          'tangible', 'temporary', 'tentative', 'terminal', 'thermal', 'thorough', 'toxic',
          'transparent', 'trivial', 'ultimate', 'unanimous', 'uniform', 'unique', 'urban',
          'urgent', 'valid', 'verbal', 'versatile', 'vertical', 'viable', 'vigorous', 'virtual',
          'visible', 'visual', 'vital', 'vivid', 'volatile', 'voluntary', 'vulnerable', 'widespread'
        ],
        'adverb': [
          'abruptly', 'abundantly', 'accordingly', 'accurately', 'adequately', 'allegedly',
          'alternatively', 'apparently', 'appropriately', 'approximately', 'arguably', 'assertively',
          'automatically', 'barely', 'blatantly', 'briefly', 'broadly', 'cautiously', 'chronically',
          'coincidentally', 'collectively', 'comparatively', 'competently', 'completely', 'consistently',
          'constantly', 'continuously', 'conversely', 'convincingly', 'critically', 'crucially',
          'currently', 'decisively', 'deliberately', 'densely', 'desperately', 'diligently',
          'distinctly', 'dramatically', 'drastically', 'eagerly', 'effectively', 'efficiently',
          'elsewhere', 'enormously', 'entirely', 'equally', 'erroneously', 'essentially', 'eventually',
          'evidently', 'excessively', 'exclusively', 'explicitly', 'extensively', 'externally',
          'extremely', 'fairly', 'firmly', 'formally', 'formerly', 'fortunately', 'frankly',
          'freely', 'frequently', 'fully', 'fundamentally', 'generally', 'genuinely', 'gradually',
          'graphically', 'greatly', 'hardly', 'hastily', 'hence', 'hereby', 'historically',
          'honestly', 'hopefully', 'horizontally', 'however', 'hugely', 'ideally', 'identically',
          'immediately', 'immensely', 'implicitly', 'importantly', 'incidentally', 'increasingly',
          'incredibly', 'independently', 'indirectly', 'individually', 'inevitably', 'infinitely',
          'informally', 'initially', 'innocently', 'instantly', 'intensely', 'intentionally',
          'internally', 'ironically', 'jointly', 'largely', 'lately', 'legitimately', 'literally',
          'locally', 'logically', 'loosely', 'mainly', 'manually', 'marginally', 'markedly',
          'meanwhile', 'merely', 'minimally', 'moderately', 'moreover', 'mostly', 'mutually',
          'namely', 'naturally', 'necessarily', 'negatively', 'nevertheless', 'nonetheless',
          'normally', 'notably', 'noticeably', 'nowadays', 'objectively', 'obviously', 'occasionally',
          'oddly', 'officially', 'openly', 'optionally', 'ordinarily', 'originally', 'otherwise',
          'outwardly', 'overall', 'overtly', 'overwhelmingly', 'painfully', 'paradoxically',
          'partially', 'particularly', 'partly', 'passively', 'patiently', 'peculiarly', 'perfectly',
          'periodically', 'permanently', 'personally', 'physically', 'plainly', 'pleasantly',
          'politically', 'poorly', 'popularly', 'positively', 'possibly', 'potentially', 'practically',
          'precisely', 'predominantly', 'preferably', 'presently', 'presumably', 'previously',
          'primarily', 'principally', 'privately', 'probably', 'profoundly', 'progressively',
          'prominently', 'promptly', 'properly', 'proportionally', 'publicly', 'purely', 'quickly',
          'quietly', 'radically', 'randomly', 'rapidly', 'rarely', 'rationally', 'readily',
          'realistically', 'reasonably', 'recently', 'regrettably', 'regularly', 'relatively',
          'reliably', 'reluctantly', 'remarkably', 'remotely', 'repeatedly', 'reportedly',
          'respectively', 'responsibly', 'reversely', 'rigorously', 'roughly', 'routinely',
          'scarcely', 'seemingly', 'selectively', 'seldom', 'separately', 'seriously', 'severely',
          'sharply', 'shortly', 'significantly', 'similarly', 'simply', 'simultaneously',
          'sincerely', 'skeptically', 'slightly', 'slowly', 'smoothly', 'socially', 'solely',
          'somehow', 'somewhat', 'specifically', 'spontaneously', 'steadily', 'steeply', 'sternly',
          'strangely', 'strategically', 'strictly', 'strongly', 'structurally', 'subsequently',
          'substantially', 'subtly', 'successfully', 'suddenly', 'sufficiently', 'superficially',
          'supposedly', 'surely', 'surprisingly', 'symbolically', 'temporarily', 'tentatively',
          'terminally', 'terribly', 'theoretically', 'thereby', 'therefore', 'thoroughly',
          'thus', 'tightly', 'traditionally', 'transparently', 'tremendously', 'truly', 'typically',
          'ultimately', 'unanimously', 'uncertainly', 'unconditionally', 'undeniably', 'undoubtedly',
          'unexpectedly', 'unfortunately', 'uniformly', 'uniquely', 'universally', 'unlikely',
          'unnecessarily', 'unofficially', 'unusually', 'upwardly', 'urgently', 'usually',
          'utterly', 'vaguely', 'validly', 'vastly', 'verbally', 'vertically', 'vigorously',
          'virtually', 'visually', 'vitally', 'vividly', 'voluntarily', 'warmly', 'weakly',
          'widely', 'willingly', 'wisely', 'wrongly'
        ]
      };
      
      // 랜덤으로 폴백 단어 선택 (중복 방지)
      const shuffleArray = (arr: string[]) => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };
      
      // 형용사를 기본값으로 사용 (더 안전한 선택)
      wrongChoices = shuffleArray(fallbackPools['adjective'])
        .filter(word => word.toLowerCase() !== correctWord.toLowerCase())
        .slice(0, numberOfChoices);
    }

    return new Response(JSON.stringify({ wrongChoices, detectedPartOfSpeech }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-english-wrong-choices function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});