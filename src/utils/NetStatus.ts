import { TreeNode } from "./TreeNode";

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

const statKeys = Object.keys(zeroStat);

export class NetNode<
  C extends NetNode = any,
  P extends NetNode = any
> extends TreeNode<C, P> {
  protected _stat = { ...zeroStat };
  get stat(): Readonly<NetStat> {
    return this._stat;
  }

  get status() {
    const { _stat } = this;
    return (
      [
        NetStatus.loading,
        NetStatus.waiting,
        NetStatus.error,
        NetStatus.success,
      ].find((status) => _stat[status]) ?? NetStatus.idle
    );
  }

  protected _composed: NetComposed = {
    available: 0,
    running: 0,
    buffer: 0,
    progress: 0,
    total: 0,
  };

  get composed(): Readonly<NetComposed> {
    return this._composed;
  }

  protected compose() {
    const { _stat, _composed } = this;
    const total = statKeys.reduce((total, key) => total + _stat[key], 0);

    const available = _stat.idle + _stat.error;
    const running = _stat.waiting + _stat.loading;

    const buffer = ((_stat.success + _stat.loading) / total) * 100;
    const progress = (_stat.success / total) * 100;

    Object.assign(_composed, { available, running, buffer, progress, total });
  }

  statChange(to: NetStatus, from: NetStatus = this.status) {
    const { _stat, parents } = this;
    _stat[from]--;
    _stat[to]++;
    this.compose();
    parents.forEach((parent) => {
      parent.statChange(to, from);
    });
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
    await Promise.all(this.children.map((child) => child.load()));
  }

  async unload() {
    await Promise.all(this.children.map((child) => child.unload()));
  }
}
