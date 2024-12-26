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
    color: '#4A21EF',
    fontWeight: 'bold'
  },
  tableContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    minHeight: 24,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8F9FA',
    padding: 12,
  },
  headerCell: {
    padding: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  cell: {
    padding: 8,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
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
        <View style={styles.headerRow}>
          <View style={[styles.headerCell, { width: '30%' }]}>
            <Text>단어 / 품사 / 의미</Text>
          </View>
          <View style={[styles.headerCell, { width: '35%' }]}>
            <Text>동의어</Text>
          </View>
          <View style={[styles.headerCell, { width: '35%' }]}>
            <Text>반의어</Text>
          </View>
        </View>
        {vocabularyList.map((entry, index) => (
          <VocabularyEntry key={index} entry={entry} styles={styles} />
        ))}
      </View>
    </Page>
  </Document>
);