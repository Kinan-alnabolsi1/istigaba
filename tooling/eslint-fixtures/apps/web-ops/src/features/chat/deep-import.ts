// VIOLATION: imports another feature's internals instead of its index.ts
import { reportCard } from '../reports/components/ReportCard';
export const deep = reportCard;
