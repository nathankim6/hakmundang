import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface ExampleTableProps {
  title: string;
  headers: string[];
  rows: string[][];
}

const ExampleTable = ({ title, headers, rows }: ExampleTableProps) => {
  return (
    <Card className="overflow-hidden animate-slide-up">
      <div className="bg-primary/5 px-6 py-4 border-b border-border">
        <h4 className="font-semibold text-foreground">{title}</h4>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10 hover:bg-primary/10">
              {headers.map((header, index) => (
                <TableHead key={index} className="text-primary font-semibold text-center">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/50 transition-colors">
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-center font-medium">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ExampleTable;
