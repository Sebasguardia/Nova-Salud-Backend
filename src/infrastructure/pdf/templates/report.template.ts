export interface ReportData {
  title:      string;
  period:     string;
  generatedAt:string;
  sections:   Array<{
    title: string;
    rows:  Array<Record<string, string | number>>;
  }>;
}