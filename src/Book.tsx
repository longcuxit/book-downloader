import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";

import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";

import { BookModel } from "./models/Book.model";
import { useEventEmitter } from "./helper";

export interface BookProps {
  book: BookModel;
}

export const Book = ({ book }: BookProps) => {
  const { stat, composed, info } = book;

  const { saving } = useEventEmitter(book, "stat,saving");

  return (
    <ListItem disableGutters>
      <ListItemText primary={info.title} />
      <IconButton
        aria-label="Download"
        hidden={composed.progress === 100}
        disabled={!!composed.running && !stat.waiting}
        onClick={book.toggleDownload}
      >
        {composed.running ? (
          <PauseIcon color="error" />
        ) : composed.progress ? (
          <>
            <ReplayIcon color="warning" />
            <Box
              position="absolute"
              top={9}
              bottom={0}
              right="68%"
              fontSize={10}
            >
              {stat.error}
            </Box>
          </>
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
        {saving ? <CircularProgress size={20} /> : <SaveIcon />}
      </IconButton>
      {Boolean(composed.progress) && (
        <LinearProgress
          style={{ position: "absolute", left: 0, bottom: 0, right: 0 }}
          variant="buffer"
          value={composed.progress}
          valueBuffer={composed.buffer}
        />
      )}
    </ListItem>
  );
};
