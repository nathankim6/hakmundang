
export const getOrderPrompt = (text: string) => {
  // Split text into sentences
  const sentences = text.split(/(?<=[.!?])\s+/).filter(sentence => sentence.trim().length > 0);
  
  if (sentences.length < 5) {
    return "Insufficient sentences for question generation";
  }

  // Take first 1-2 sentences as the opening
  const openingSentences = sentences.slice(0, Math.min(2, Math.floor(sentences.length / 3)));
  const remainingSentences = sentences.slice(openingSentences.length);
  
  if (remainingSentences.length < 6) {
    return "Insufficient sentences for question generation";
  }

  // Divide remaining sentences into 3 segments (A), (B), (C)
  const segmentLength = Math.floor(remainingSentences.length / 3);
  const segmentA = remainingSentences.slice(0, segmentLength);
  const segmentB = remainingSentences.slice(segmentLength, segmentLength * 2);
  const segmentC = remainingSentences.slice(segmentLength * 2);

  // Create the question format
  const opening = openingSentences.join(' ');
  const partA = segmentA.join(' ');
  const partB = segmentB.join(' ');
  const partC = segmentC.join(' ');

  // Generate answer choices (6 possible combinations)
  const choices = [
    "(A)-(B)-(C)",
    "(A)-(C)-(B)", 
    "(B)-(A)-(C)",
    "(B)-(C)-(A)",
    "(C)-(A)-(B)",
    "(C)-(B)-(A)"
  ];

  // Randomly select the correct answer from options 1-5
  const correctAnswer = Math.floor(Math.random() * 5) + 1;
  const correctSequence = choices[correctAnswer - 1];
  
  // Rearrange the segments so that when arranged according to the correct answer, 
  // they form the original text order
  let displayPartA, displayPartB, displayPartC;
  
  switch(correctSequence) {
    case "(A)-(B)-(C)":
      // Original order: partA-partB-partC, so A=partA, B=partB, C=partC
      displayPartA = partA;
      displayPartB = partB;
      displayPartC = partC;
      break;
    case "(A)-(C)-(B)":
      // Need A-C-B to give original order, so A=partA, C=partB, B=partC
      displayPartA = partA;
      displayPartB = partC;
      displayPartC = partB;
      break;
    case "(B)-(A)-(C)":
      // Need B-A-C to give original order, so B=partA, A=partB, C=partC
      displayPartA = partB;
      displayPartB = partA;
      displayPartC = partC;
      break;
    case "(B)-(C)-(A)":
      // Need B-C-A to give original order, so B=partA, C=partB, A=partC
      displayPartA = partC;
      displayPartB = partA;
      displayPartC = partB;
      break;
    case "(C)-(A)-(B)":
      // Need C-A-B to give original order, so C=partA, A=partB, B=partC
      displayPartA = partB;
      displayPartB = partC;
      displayPartC = partA;
      break;
    default:
      displayPartA = partA;
      displayPartB = partB;
      displayPartC = partC;
  }

  return `주어진 글 다음에 이어질 글의 순서로 알맞은 것은?

${opening}

(A) ${displayPartA}

(B) ${displayPartB}

(C) ${displayPartC}

① ${choices[0]}    ② ${choices[1]}    ③ ${choices[2]}
④ ${choices[3]}    ⑤ ${choices[4]}

[정답] ${correctAnswer === 1 ? '①' : correctAnswer === 2 ? '②' : correctAnswer === 3 ? '③' : correctAnswer === 4 ? '④' : '⑤'}`;
};
