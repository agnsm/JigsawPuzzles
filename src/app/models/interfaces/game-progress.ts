import { ProgressBar } from "./progress-bar";
import { Stopwatch } from "./stopwatch";

export interface GameProgress {
  progressBar: ProgressBar;
  time: Stopwatch | null;
}
