export interface Poll {
  id: number;
  creator: string;
  title: string;
  description: string;
  options: string[];
  endTime: number;
  voteCounts: number[];
  closed: boolean;
}
