import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";

import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";

import { BookModel } from "./models/Book.model";
import { useNotifier } from "utils/Notifier";

export interface BookProps {
  book: BookModel;
}

export const Book = ({ book }: BookProps) => {
  useNotifier(book);
  const { stat, composed, info, children } = book;
  const saving = false;

  const getChapterNum = (num: number) => {
    num = (num / composed.total) * children.length;
    return Math.round(num * 100) / 100;
  };

  const actions = (
    <>
      <IconButton
        aria-label="Download"
        hidden={composed.progress === 100}
        disabled={!composed.available && !composed.running}
        onClick={() => (composed.available ? book.load() : book.unload())}
      >
        <Box position="absolute" top={9} bottom={0} right="68%" fontSize={10}>
          {getChapterNum(composed.running || composed.available)}
        </Box>
        {composed.running ? (
          <PauseIcon color="error" />
        ) : composed.progress ? (
          <ReplayIcon color="warning" />
        ) : (
          <DownloadIcon color="success" />
        )}
      </IconButton>
      <IconButton
        disabled={!stat.success || !!composed.running || saving}
        color={stat.error ? "warning" : "success"}
        aria-label="Save"
        onClick={() => book.save()}
      >
        <Box position="absolute" top={9} bottom={0} right="75%" fontSize={10}>
          {getChapterNum(stat.success)}
        </Box>
        {saving ? <CircularProgress size={20} /> : <SaveIcon />}
      </IconButton>
    </>
  );

  return (
    <ListItem disableGutters>
      <ListItemButton
        disableGutters
        disabled={saving}
        onClick={() => {
          if (composed.running) {
            // book.stopDownload();
          } else if (composed.available) {
            // book.startDownload();
          } else {
            book.save();
          }
        }}
      >
        <ListItemText
          secondary={info.title}
          secondaryTypographyProps={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        />
      </ListItemButton>
      {Boolean(composed.progress) && (
        <LinearProgress
          style={{ position: "absolute", left: 0, bottom: 0, right: 0 }}
          variant="buffer"
          value={composed.progress}
          valueBuffer={composed.buffer}
        />
      )}
      {actions}
    </ListItem>
  );
};
