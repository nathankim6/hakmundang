import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { VocabularyEntry } from "./VocabularyEntry";
import { VocabularyEntryType } from "./types";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  tableContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#000',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 24,
    flexWrap: 'wrap',
  },
  cell: {
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
});

interface Props {
  vocabularyList: VocabularyEntryType[];
}

export const VocabularyPDF = ({ vocabularyList }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Vocabulary List</Text>
      <View style={styles.tableContainer}>
        <View style={styles.row}>
          <View style={[styles.cell, { width: '25%' }]}>
            <Text>Word / Part of Speech / Definition</Text>
          </View>
          <View style={[styles.cell, { width: '25%' }]}>
            <Text>Meaning</Text>
          </View>
          <View style={[styles.cell, { width: '25%' }]}>
            <Text>Synonyms</Text>
          </View>
          <View style={[styles.cell, { width: '25%' }]}>
            <Text>Antonyms</Text>
          </View>
        </View>
        {vocabularyList.map((entry, index) => (
          <VocabularyEntry key={index} entry={entry} styles={styles} />
        ))}
      </View>
    </Page>
  </Document>
);