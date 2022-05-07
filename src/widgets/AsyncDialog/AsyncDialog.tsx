import Dialog from "@mui/material/Dialog";
import {
  createContext,
  FC,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type PopDialog<T = any> = (value?: T) => void;

type DialogCreator<T = any> = (pop: PopDialog<T>) => ReactElement;

type PushDialog<T = any> = (create: DialogCreator<T>) => Promise<T>;

type DialogItem<T = any> = { pop: PopDialog<T>; content: ReactElement };

const Context = createContext<PushDialog | null>(null);

export function useAsyncDialog<T>() {
  return useContext(Context) as PushDialog<T>;
}

export const AsyncDialogContainer: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [dialogs, setDialogs] = useState<DialogItem[]>([]);

  const pushDialog = useCallback(async (create: DialogCreator) => {
    let item: DialogItem;
    const rs = await new Promise((next) => {
      const content = create(next);
      item = { pop: next, content };
      setDialogs((dialogs) => [...dialogs, item]);
    });
    setDialogs((dialogs) => dialogs.filter((old) => old !== item));
    return rs;
  }, []);

  const dialog = dialogs[dialogs.length - 1];

  return (
    <Context.Provider value={pushDialog}>
      <Dialog open={Boolean(dialog)} onClose={() => dialog.pop()}>
        <>{dialog?.content}</>
      </Dialog>
      {children}
    </Context.Provider>
  );
};
