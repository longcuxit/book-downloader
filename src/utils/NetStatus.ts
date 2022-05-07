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

const statKeys = Object.keys(zeroStat);

export class NetNode<
  C extends NetNode = any,
  P extends NetNode = any
> extends TreeNode<C, P> {
  private _status = NetStatus.idle;

  get status() {
    return this._status;
  }

  set status(status: NetStatus) {
    const { _status } = this;
    if (_status === status) return;
    this.parents.forEach((parent) => {
      parent.changeStat(_status, status);
    });
    this.notify();
    this._status = status;
  }

  stat = { ...zeroStat };

  composed: NetComposed = {
    available: 0,
    running: 0,
    buffer: 0,
    progress: 0,
  };

  changeStat(from: NetStatus, to: NetStatus) {
    this.stat[from]--;
    this.stat[to]++;
    this.notify();
  }

  add(...children: C[]): () => void {
    children.forEach((child) => {
      statKeys.forEach((key) => {
        this.stat[key] += child.stat[key];
      });
    });

    return super.add(...children);
  }

  remove(...children: C[]): void {
    children.forEach((child) => {
      statKeys.forEach((key) => {
        this.stat[key] -= child.stat[key];
      });
    });
    return super.remove(...children);
  }
}
