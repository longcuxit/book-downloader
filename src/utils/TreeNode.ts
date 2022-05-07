import { Notifier } from "./Notifier";
import "./Array.polyfill";

export class TreeLeaf<P extends TreeNode = TreeNode> extends Notifier {
  private _parents: P[] = [];

  get parents(): Readonly<P[]> {
    return this._parents;
  }

  visit(parent: P) {
    this._parents.push(parent);
  }

  leave(parent: P) {
    this._parents.remove(parent);
  }

  dispose() {
    for (const parent of [...this._parents]) {
      parent.remove(this);
    }
  }
}

export class TreeNode<
  C extends TreeLeaf = any,
  P extends TreeNode = any
> extends TreeLeaf<P> {
  private _children: C[] = [];

  get children(): Readonly<C[]> {
    return this._children;
  }

  add(...children: C[]) {
    const { _children } = this;
    _children.push(...children);
    children.forEach((child) => child.visit(this));
    return () => this.remove(...children);
  }

  remove(...children: C[]) {
    this._children.remove(...children).forEach((child) => child.leave(this));
  }

  dispose(): void {
    this.remove(...this._children);
    super.dispose();
  }
}
