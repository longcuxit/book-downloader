export type DownloadStep = () => any;
class Downloader {
  schedules: [DownloadStep, () => void, (error: any) => void][] = [];
  loading = 0;
  maxChunks = 3;

  private progress() {
    if (!this.schedules.length) return;
    if (this.loading >= this.maxChunks) return;

    this.loading++;
    const [step, next, error] = this.schedules.shift()!;
    step()
      .then(() => {
        this.loading--;
        this.progress();
        next();
      })
      .catch(error);
    this.progress();
  }

  async add(step: DownloadStep) {
    if (!window.onbeforeunload) {
      window.onbeforeunload = function () {
        return "Are you sure cancel all download!...";
      };
    }
    const query = new Promise<void>((next, error) => {
      this.schedules.push([step, next, error]);
    });
    this.progress();
    await query;
  }

  remove(step: DownloadStep) {
    const index = this.schedules.findIndex(([query]) => step === query);
    if (index > -1) {
      const [[, , error]] = this.schedules.splice(index, 1);
      error(Error("rejected"));
    }
    return index > -1;
  }
}

export const downloader = new Downloader();
