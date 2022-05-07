import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { ReactNode, useCallback } from "react";
import { useAsyncDialog } from "./AsyncDialog";

export type ConfirmDialogProps = {
  title?: ReactNode;
  content?: ReactNode;
  cancel?: ReactNode;
  accept?: ReactNode;
};

export const useConfirmDialog = () => {
  const asyncDialog = useAsyncDialog<boolean>();
  return useCallback(
    ({ title, content, cancel, accept }: ConfirmDialogProps) => {
      return asyncDialog((pop) => (
        <>
          {title && <DialogTitle>{title}</DialogTitle>}
          {content && <DialogContent>{content}</DialogContent>}

          <DialogActions>
            {cancel && <Button onClick={() => pop()}>{cancel}</Button>}
            <Button onClick={() => pop(true)} autoFocus>
              {accept ?? "Ok"}
            </Button>
          </DialogActions>
        </>
      ));
    },
    [asyncDialog]
  );
};
