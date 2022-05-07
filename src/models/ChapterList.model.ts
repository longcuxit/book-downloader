import { NetNode } from "utils/NetStatus";
import { ChapterModel } from "./Chapter.model";

export class ChapterListModel extends NetNode<ChapterModel> {
  // get composed(): ChapterListCompose {
  //   const { stat, chapters } = this;
  //   const available = stat.idle + stat.error;
  //   const running = stat.waiting + stat.loading;
  //   const totalProgress =
  //     chapters.length +
  //     chapters.reduce((count, chapter) => {
  //       return count + (chapter.chunks?.length ?? 0);
  //     }, 0);
  //   const totalSuccess =
  //     stat.success +
  //     chapters.reduce((count, chapter) => {
  //       return count + chapter.progress;
  //     }, 0);
  //   const progress = (totalSuccess / totalProgress) * 100;
  //   const buffer = ((totalSuccess + stat.loading) / totalProgress) * 100;
  //   return { available, running, progress, buffer };
  // }
}
