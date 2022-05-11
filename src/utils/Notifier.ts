import { useEffect, useState } from "react";

export type Listener = () => void;

export class Notifier {
  private _listens: Listener[] = [];

  get hasListen() {
    return Boolean(this._listens.length);
  }

  listen(...listens: Listener[]) {
    const { _listens } = this;
    _listens.push(...listens);
    return () => {
      const index = _listens.indexOf(listens[0]);
      _listens.splice(index, _listens.length);
    };
  }

  notify() {
    const { _listens } = this;
    for (let i = 0; i < _listens.length; i++) {
      _listens[i]();
    }
  }

  dispose() {
    this._listens.length = 0;
  }
}

export function useNotifier<N extends Notifier>(notifier: N) {
  const [, setState] = useState({});
  useEffect(() => notifier.listen(() => setState({})), [notifier]);
  return notifier;
}
