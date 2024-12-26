import { Text, View } from "@react-pdf/renderer";
import { VocabularyEntryType } from "./types";

interface Props {
  entry: VocabularyEntryType;
  styles: any;
}

export const VocabularyEntry = ({ entry, styles }: Props) => (
  <View style={styles.row}>
    <View style={[styles.cell, { width: '25%' }]}>
      <Text className="font-bold">{entry.word}</Text>
      <Text>{'⭐'.repeat(entry.difficulty || 1)}</Text>
      <Text className="text-sm text-gray-600">{entry.partOfSpeech}</Text>
      <Text className="text-xs italic">{entry.definition}</Text>
    </View>
    <View style={[styles.cell, { width: '25%' }]}>
      <Text>{entry.meaning}</Text>
    </View>
    <View style={[styles.cell, { width: '25%' }]}>
      {entry.synonyms.map((syn, i) => (
        <Text key={i}>{syn.word} - {syn.meaning}</Text>
      ))}
    </View>
    <View style={[styles.cell, { width: '25%' }]}>
      {entry.antonyms.map((ant, i) => (
        <Text key={i}>{ant.word} - {ant.meaning}</Text>
      ))}
    </View>
  </View>
);