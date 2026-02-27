import { control } from "utils/controller";
import { downloader, DownloadStep } from "utils/Downloader";
import { TreeNode } from "./TreeNode";
import { final, getKeys } from "./helpers";
export enum NetStatus {
  idle = "idle",
  waiting = "waiting",
  loading = "loading",
  error = "error",
  success = "success",
}

export type NetStat = Record<NetStatus, number>;

export interface NetComposed {
  available: number;
  running: number;
  buffer: number;
  progress: number;
  total: number;
}

const zeroStat: NetStat = {
  idle: 0,
  waiting: 0,
  loading: 0,
  success: 0,
  error: 0,
};

const statKeys = getKeys(zeroStat);

export class NetNode<
  C extends NetNode = any,
  P extends NetNode = any,
> extends TreeNode<C, P> {
  private _queries: DownloadStep[] = [];

  protected _stat = { ...zeroStat };
  get stat(): Readonly<NetStat> {
    return this._stat;
  }

  private _composed: NetComposed = {
    available: 0,
    running: 0,
    buffer: 0,
    progress: 0,
    total: 0,
  };

  get composed(): Readonly<NetComposed> {
    return this._composed;
  }

  private compose() {
    const { _stat, _composed } = this;
    const total = statKeys.reduce((total, key) => total + _stat[key], 0);

    const available = _stat.idle + _stat.error;
    const running = _stat.waiting + _stat.loading;

    const buffer = ((_stat.success + _stat.loading) / total) * 100;
    const progress = (_stat.success / total) * 100;

    Object.assign(_composed, { available, running, buffer, progress, total });
  }

  private statChange(from: NetStatus, to: NetStatus) {
    const { _stat, parents } = this;
    _stat[from]--;
    _stat[to]++;
    this.compose();
    parents.forEach((parent) => parent.statChange(from, to));
    this.notify();
  }

  add(...children: C[]): () => void {
    const addStat = (parent: NetNode) => {
      children.forEach((child) => {
        statKeys.forEach((key) => {
          parent._stat[key] += child.stat[key];
        });
      });
    };
    addStat(this);
    this.recursiveParents(addStat);
    return final(super.add(...children), this.compose());
  }

  remove(...children: C[]): void {
    const subStat = (parent: NetNode) => {
      children.forEach((child) => {
        statKeys.forEach((key) => {
          parent._stat[key] -= child.stat[key];
        });
      });
    };
    subStat(this);
    this.recursiveParents(subStat);
    return final(super.remove(...children), this.compose());
  }

  async load() {
    downloader.resume();
    const { _stat } = this;
    const queries = this._queries.map(async (query) => {
      try {
        this.statChange(
          _stat.idle ? NetStatus.idle : NetStatus.error,
          NetStatus.waiting,
        );
        await downloader.add(query);
      } catch (error: any) {
        this.statChange(NetStatus.loading, NetStatus.error);
      }
    });

    await Promise.all(queries);
    await Promise.all(this.children.map((child) => child.load()));
  }

  unload() {
    this._queries.forEach((query) => downloader.remove(query));
    this.children.map((child) => child.unload());
  }

  protected pushQuery(query: DownloadStep) {
    this._stat.idle++;
    const { _queries } = this;
    const step = async () => {
      this.statChange(NetStatus.waiting, NetStatus.loading);
      control.send({ action: "running" });
      await query();
      _queries.splice(_queries.indexOf(step));
      this.statChange(NetStatus.loading, NetStatus.success);
    };
    _queries.push(step);
    this.compose();
  }
}
