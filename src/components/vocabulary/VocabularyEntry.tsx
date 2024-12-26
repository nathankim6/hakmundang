import { Text, View } from "@react-pdf/renderer";
import { VocabularyEntryType } from "./types";
import { StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  wordText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2
  },
  difficultyText: {
    fontSize: 10,
    color: '#FFD700',
    marginBottom: 2
  },
  partOfSpeechText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2
  },
  definitionText: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#444444'
  }
});

interface Props {
  entry: VocabularyEntryType;
  styles: any;
}

export const VocabularyEntry = ({ entry, styles: containerStyles }: Props) => (
  <View style={containerStyles.row}>
    <View style={[containerStyles.cell, { width: '25%' }]}>
      <Text style={styles.wordText}>{entry.word}</Text>
      <Text style={styles.difficultyText}>{'⭐'.repeat(entry.difficulty || 1)}</Text>
      <Text style={styles.partOfSpeechText}>{entry.partOfSpeech}</Text>
      <Text style={styles.definitionText}>{entry.definition}</Text>
    </View>
    <View style={[containerStyles.cell, { width: '25%' }]}>
      <Text>{entry.meaning}</Text>
    </View>
    <View style={[containerStyles.cell, { width: '25%' }]}>
      {entry.synonyms.map((syn, i) => (
        <Text key={i}>{syn.word} - {syn.meaning}</Text>
      ))}
    </View>
    <View style={[containerStyles.cell, { width: '25%' }]}>
      {entry.antonyms.map((ant, i) => (
        <Text key={i}>{ant.word} - {ant.meaning}</Text>
      ))}
    </View>
  </View>
);