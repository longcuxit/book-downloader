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
}

const zeroStat: NetStat = {
  idle: 0,
  waiting: 0,
  loading: 0,
  success: 0,
  error: 0,
};

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

  private _composed: NetComposed = {
    available: 0,
    running: 0,
    buffer: 0,
    progress: 0,
  };

  get composed(): Readonly<NetComposed> {
    return this._composed;
  }

  private compose() {
    const { _stat, _composed, children } = this;
    Object.assign(_composed, {
      available: _stat.idle + _stat.error,
      running: _stat.waiting + _stat.loading,
      buffer: ((_stat.success + _stat.loading) / children.length) * 100,
      progress: (_stat.success / children.length) * 100,
    });
  }

  statChange(to: NetStatus, from: NetStatus = this.status) {
    const { _stat, status, parents } = this;
    _stat[from]--;
    _stat[to]++;
    this.compose();
    const nextStatus = this.status;
    if (status !== nextStatus) {
      parents.forEach((parent) => {
        parent.statChange(status, nextStatus);
      });
    }
    this.notify();
  }

  add(...children: C[]): () => void {
    const { _stat } = this;
    children.forEach((child) => {
      _stat[child.status] += 1;
    });
    return final(super.add(...children), this.compose());
  }

  remove(...children: C[]): void {
    const { _stat } = this;
    children.forEach((child) => {
      _stat[child.status] -= 1;
    });
    return final(super.remove(...children), this.compose());
  }

  async load() {
    await Promise.all(this.children.map((child) => child.load()));
  }

  async unload() {
    await Promise.all(this.children.map((child) => child.unload()));
  }
}
