import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Editor from "@monaco-editor/react";

interface EditScriptButtonProps {
  value: string;
  onChange: (value: string) => void;
}

export const EditScriptButton: React.FC<EditScriptButtonProps> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Cập nhật giá trị local khi mở dialog
  useEffect(() => {
    if (open) {
      setLocalValue(value);
    }
  }, [open, value]);

  const handleApply = () => {
    onChange(localValue);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
    setLocalValue(value);
  };

  return (
    <>
      <Button variant="outlined" size="small" onClick={() => setOpen(true)}>
        {"{...}"}
      </Button>
      <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle>Edit Chapter List Script</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            This script receives the `doc` object (parsed HTML) and should
            return a string of HTML containing `&lt;a
            href="..."&gt;Title&lt;/a&gt;` elements. You can use the `_` utility
            methods available in client.js. Examples: `return
            _.queryAll('.my-class a', doc).map(a =&gt; a.outerHTML).join('');`
          </Typography>
          <Editor
            height="400px"
            defaultLanguage="javascript"
            value={localValue || ""}
            onChange={(val) => setLocalValue(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              formatOnType: true,
              formatOnPaste: true,
              wordWrap: "on",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleApply} color="primary" variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
