import { Text, View } from "@react-pdf/renderer";
import { VocabularyEntryType } from "./types";
import { StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  wordText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#4A21EF'
  },
  partOfSpeechText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2
  },
  definitionText: {
    fontSize: 10,
    color: '#444444',
    marginBottom: 2
  },
  meaningText: {
    fontSize: 11,
    color: '#333333'
  },
  relatedWordText: {
    fontSize: 11,
    color: '#4A21EF',
    marginBottom: 2
  }
});

const getKoreanPartOfSpeech = (eng: string): string => {
  const map: { [key: string]: string } = {
    'noun': '명사',
    'verb': '동사',
    'adjective': '형용사',
    'adverb': '부사',
    'n': '명사',
    'v': '동사',
    'adj': '형용사',
    'adv': '부사'
  };
  return map[eng.toLowerCase()] || eng;
};

interface Props {
  entry: VocabularyEntryType;
  styles: any;
}

export const VocabularyEntry = ({ entry, styles: containerStyles }: Props) => (
  <View style={containerStyles.row}>
    <View style={[containerStyles.cell, { width: '30%' }]}>
      <Text style={styles.wordText}>{entry.word}</Text>
      <Text style={styles.partOfSpeechText}>{getKoreanPartOfSpeech(entry.partOfSpeech)}</Text>
      <Text style={styles.definitionText}>{entry.definition}</Text>
      <Text style={styles.meaningText}>{entry.meaning}</Text>
    </View>
    <View style={[containerStyles.cell, { width: '35%' }]}>
      {entry.synonyms.map((syn, i) => (
        <View key={i}>
          <Text style={styles.relatedWordText}>
            {syn.word} - {syn.meaning}
          </Text>
        </View>
      ))}
    </View>
    <View style={[containerStyles.cell, { width: '35%' }]}>
      {entry.antonyms.map((ant, i) => (
        <View key={i}>
          <Text style={styles.relatedWordText}>
            {ant.word} - {ant.meaning}
          </Text>
        </View>
      ))}
    </View>
  </View>
);