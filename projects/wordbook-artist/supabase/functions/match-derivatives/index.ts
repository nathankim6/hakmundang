import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WordInfo {
  id: string;
  word: string;
  meaning: string;
  word_type: string | null;
  part_of_speech: string | null;
  sort_order: number;
}

interface DayInfo {
  dayGroupId: string;
  dayName: string;
  headwords: WordInfo[];
  derivatives: WordInfo[];
}

// ─── Automated morphological matching ───

function normalize(w: string): string {
  return w.toLowerCase().replace(/[^a-z]/g, "");
}

function extractRoots(word: string): string[] {
  const w = normalize(word);
  const roots: string[] = [w];
  // Common suffixes to strip
  const suffixes = ["tion", "sion", "ment", "ness", "ity", "ence", "ance", "ment", "able", "ible", "ful", "less", "ous", "ive", "al", "ic", "ly", "er", "or", "ist", "ism", "ing", "ed", "es", "s"];
  for (const suf of suffixes) {
    if (w.endsWith(suf) && w.length > suf.length + 2) {
      roots.push(w.slice(0, w.length - suf.length));
    }
  }
  // Common prefixes to strip
  const prefixes = ["un", "im", "in", "dis", "re", "pre", "mis", "over", "under", "fore"];
  for (const pre of prefixes) {
    if (w.startsWith(pre) && w.length > pre.length + 2) {
      roots.push(w.slice(pre.length));
    }
  }
  return roots;
}

function autoMatch(headwords: WordInfo[], derivatives: WordInfo[]): Map<number, number> {
  const matched = new Map<number, number>(); // derivative index → headword index (0-based)

  for (let di = 0; di < derivatives.length; di++) {
    const dv = derivatives[di];
    const dvWord = dv.word.toLowerCase();
    const dvWords = dvWord.split(/[,\s]+/).filter(Boolean);
    const dvRoots = dvWords.flatMap(w => extractRoots(w));

    let bestHw = -1;
    let bestScore = 0;

    for (let hi = 0; hi < headwords.length; hi++) {
      const hw = headwords[hi];
      const hwWord = hw.word.toLowerCase();
      const hwRoots = extractRoots(hwWord);

      let score = 0;

      // Check if derivative contains the headword or vice versa
      if (dvWord.includes(hwWord) || hwWord.includes(normalize(dvWord))) {
        score = 100;
      }

      // Check phrasal: "be X of", "X on" etc
      for (const dw of dvWords) {
        if (normalize(dw) === normalize(hwWord)) {
          score = Math.max(score, 90);
        }
      }

      // Check root overlap
      for (const dr of dvRoots) {
        for (const hr of hwRoots) {
          if (dr.length >= 3 && hr.length >= 3) {
            if (dr === hr) {
              score = Math.max(score, 80);
            } else if (dr.startsWith(hr) || hr.startsWith(dr)) {
              const overlap = Math.min(dr.length, hr.length);
              if (overlap >= 4) score = Math.max(score, 70);
              else if (overlap >= 3) score = Math.max(score, 50);
            }
          }
        }
      }

      // Check longest common substring (min 4 chars)
      const nDv = normalize(dvWord);
      const nHw = normalize(hwWord);
      for (let len = Math.min(nDv.length, nHw.length); len >= 4; len--) {
        let found = false;
        for (let i = 0; i <= nDv.length - len; i++) {
          const sub = nDv.substring(i, i + len);
          if (nHw.includes(sub)) {
            score = Math.max(score, 40 + len * 2);
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (score > bestScore) {
        bestScore = score;
        bestHw = hi;
      }
    }

    if (bestScore >= 50) {
      matched.set(di, bestHw);
    }
  }

  return matched;
}

// ─── AI matching for remaining derivatives ───

function buildPromptForUnmatched(
  dayInfo: DayInfo,
  unmatchedIndices: number[],
  preMatched: Map<number, number>
): string {
  const hwList = dayInfo.headwords
    .map((h, idx) => {
      const pos = h.part_of_speech ? ` [${h.part_of_speech}]` : "";
      const matchedDerivs = [...preMatched.entries()]
        .filter(([_, hi]) => hi === idx)
        .map(([di]) => dayInfo.derivatives[di].word);
      const already = matchedDerivs.length > 0 ? ` (already matched: ${matchedDerivs.join(", ")})` : "";
      return `  H${idx + 1}. ${h.word}${pos} — ${h.meaning}${already}`;
    })
    .join("\n");

  const dvList = unmatchedIndices
    .map((di, i) => {
      const dv = dayInfo.derivatives[di];
      const pos = dv.part_of_speech ? ` [${dv.part_of_speech}]` : "";
      return `  U${i + 1}. ${dv.word}${pos} — ${dv.meaning}`;
    })
    .join("\n");

  return `${dayInfo.dayName}:
Headwords (${dayInfo.headwords.length}):
${hwList}

Unmatched Derivatives (${unmatchedIndices.length}):
${dvList}`;
}

const SYSTEM_PROMPT = `You are a linguistics expert. Given headwords and their UNMATCHED derivatives, assign each unmatched derivative to exactly one headword.

Some derivatives are already matched (shown in parentheses). Focus on the UNMATCHED ones.

RULES:
1. Return JSON: { "assignments": [h_index_for_U1, h_index_for_U2, ...] }
2. Array length MUST EXACTLY equal the unmatched derivative count
3. Each index is 1-based (1 to headword_count)

MATCHING GUIDELINES:
1. Synonyms with same meaning: "hire" → "employ", "chance" → "opportunity", "search" → "research"
2. Antonyms (opposite meaning): "humble" → "proud", "negative" → "positive", "physical" → "mental", "passive" → "negative", "ignorant" → "aware"
3. Same semantic field: "substance" → "material", "quantity" → "amount"
4. Supply/demand pairs: "supply" → "demand"
5. Look at the KOREAN MEANING to find the best match — words with the same or opposite Korean meaning belong together

OUTPUT: { "assignments": [3, 5, 1, ...] }`;

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

    const body = await req.json();
    const { workbookId, force = false, startDay = 0, maxDays = 10 } = body;

    // Auth check
    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader && !authHeader.includes(supabaseServiceKey)) {
      const authClient = createClient(
        supabaseUrl,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user }, error: authError } = await authClient.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!workbookId) {
      return new Response(
        JSON.stringify({ error: "workbookId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const db = createClient(supabaseUrl, supabaseServiceKey);

    const { data: dayGroups } = await db
      .from("day_groups")
      .select("id, day_name, sort_order")
      .eq("workbook_id", workbookId)
      .order("sort_order");

    if (!dayGroups || dayGroups.length === 0) {
      return new Response(
        JSON.stringify({ error: "No day groups found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const daysToProcess: DayInfo[] = [];

    for (const dg of dayGroups) {
      const dayNum = parseInt(dg.day_name.match(/\d+/)?.[0] || "0");
      if (dayNum < startDay) continue;

      const { data: allWords } = await db
        .from("words")
        .select("id, word, meaning, word_type, part_of_speech, sort_order, created_at")
        .eq("day_group_id", dg.id);

      if (!allWords) continue;

      const headwords = allWords
        .filter((w) => w.word_type === "표제어")
        .sort((a, b) => a.sort_order - b.sort_order) as WordInfo[];
      const derivatives = allWords
        .filter((w) => w.word_type === "파생어")
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) as WordInfo[];

      if (headwords.length > 0 && derivatives.length > 0) {
        if (force) {
          daysToProcess.push({ dayGroupId: dg.id, dayName: dg.day_name, headwords, derivatives });
        } else {
          const lastHwIdx = Math.max(...headwords.map((h) => allWords.findIndex((w) => w.id === h.id)));
          const firstDvIdx = Math.min(...derivatives.map((d) => allWords.findIndex((w) => w.id === d.id)));
          if (lastHwIdx < firstDvIdx) {
            daysToProcess.push({ dayGroupId: dg.id, dayName: dg.day_name, headwords, derivatives });
          }
        }
      }
    }

    const limitedDays = daysToProcess.slice(0, maxDays);

    if (limitedDays.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No reordering needed", daysProcessed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${limitedDays.length} of ${daysToProcess.length} days`);

    let totalReordered = 0;

    for (const dayInfo of limitedDays) {
      // Step 1: Auto-match using morphological analysis
      const autoMatched = autoMatch(dayInfo.headwords, dayInfo.derivatives);
      const unmatchedIndices = dayInfo.derivatives
        .map((_, i) => i)
        .filter((i) => !autoMatched.has(i));

      console.log(`${dayInfo.dayName}: auto-matched ${autoMatched.size}/${dayInfo.derivatives.length}, unmatched: ${unmatchedIndices.length}`);

      // Step 2: Use AI for unmatched derivatives
      const finalAssignments = new Map(autoMatched);

      if (unmatchedIndices.length > 0) {
        const prompt = buildPromptForUnmatched(dayInfo, unmatchedIndices, autoMatched);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (!response.ok) {
          console.error(`AI error for ${dayInfo.dayName}:`, await response.text());
          // Fall back: assign unmatched to nearest headword by position
          for (const di of unmatchedIndices) {
            finalAssignments.set(di, 0);
          }
        } else {
          const aiResult = await response.json();
          let content = aiResult.choices?.[0]?.message?.content || "";
          content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

          try {
            const parsed = JSON.parse(content);
            const aiAssigns: number[] = parsed.assignments || parsed[dayInfo.dayName] || Object.values(parsed)[0] as number[];
            
            if (Array.isArray(aiAssigns)) {
              for (let i = 0; i < unmatchedIndices.length; i++) {
                let idx = Number(aiAssigns[i]);
                if (!Number.isFinite(idx)) idx = 1;
                idx = Math.max(1, Math.min(dayInfo.headwords.length, Math.floor(idx)));
                finalAssignments.set(unmatchedIndices[i], idx - 1); // 0-based
              }
            }
          } catch {
            console.error(`Failed to parse AI response for ${dayInfo.dayName}:`, content);
            for (const di of unmatchedIndices) {
              finalAssignments.set(di, 0);
            }
          }
        }
      }

      // Step 3: Apply assignments
      await applyMatchedAssignments(db, dayInfo, finalAssignments);
      totalReordered += dayInfo.headwords.length + dayInfo.derivatives.length;
    }

    return new Response(
      JSON.stringify({ success: true, daysProcessed: limitedDays.length, wordsReordered: totalReordered }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("match-derivatives error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function applyMatchedAssignments(
  db: ReturnType<typeof createClient>,
  dayInfo: DayInfo,
  assignments: Map<number, number> // derivative index → headword index (0-based)
) {
  const headwordCount = dayInfo.headwords.length;

  // Group derivatives by headword
  const groups: string[][] = Array.from({ length: headwordCount }, () => []);
  for (const [di, hi] of assignments) {
    groups[hi].push(dayInfo.derivatives[di].id);
  }

  // Build ordered list: headword then its derivatives
  const ordered: string[] = [];
  for (let i = 0; i < headwordCount; i++) {
    ordered.push(dayInfo.headwords[i].id);
    ordered.push(...groups[i]);
  }

  // Update sort_order
  const updates = ordered.map((id, idx) =>
    db.from("words").update({ sort_order: idx }).eq("id", id)
  );
  for (let b = 0; b < updates.length; b += 20) {
    await Promise.all(updates.slice(b, b + 20));
  }

  const assignedCounts = groups.map((g) => g.length);
  console.log(
    `${dayInfo.dayName}: ${ordered.length} words reordered, derivative distribution: [${assignedCounts.join(",")}]`
  );
}
