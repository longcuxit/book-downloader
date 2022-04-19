import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";

import DownloadIcon from "@mui/icons-material/Download";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";

import { BookList } from "./BookList";
import { Chapter, ChapterStatus, useChaptersStat } from "./Chapter";
import { downloader } from "./Downloader";
import { BookProps } from "./Book";
import { CircularProgress } from "@mui/material";

const DownloadAll = ({
  chapters,
  skip,
}: {
  chapters: Chapter[];
  skip: number;
}) => {
  chapters = useMemo(() => chapters.slice(skip), [chapters, skip]);
  const [chapterStat, composed] = useChaptersStat(chapters);
  return (
    <Button
      fullWidth
      variant="contained"
      startIcon={
        composed.running ? (
          <PauseIcon />
        ) : composed.progress ? (
          <ReplayIcon />
        ) : (
          <DownloadIcon />
        )
      }
      disabled={
        composed.progress === 100 ||
        (!!composed.running && !chapterStat[ChapterStatus.waiting])
      }
      onClick={() => {
        if (composed.running) {
          downloader.remove(chapters);
        } else {
          downloader.add(chapters);
        }
      }}
    >
      All
    </Button>
  );
};

function BookDownloader({ fetchData, formatContent }: BookDownloaderProps) {
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const [props, setProps] = useState<BookProps>();
  const [config, setConfig] = useState({ skip: 0, split: 0 });

  useEffect(() => {
    if (!open || props) return;
    fetchData().then((data) => {
      console.log(data);
      if (!data.chapters.length) return;
      setProps({
        ...data,
        chapters: data.chapters.map(
          (chap) => new Chapter(chap.title, chap.url, formatContent)
        ),
      });
    });
  }, [fetchData, formatContent, open, props]);

  return (
    <>
      <IconButton id="book-download" onClick={handleOpen}>
        <DownloadIcon />
      </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Paper
          style={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: 400,
            width: "90%",
            maxHeight: "90%",
            padding: "16px 0",
            overflow: "auto",
          }}
        >
          {props ? (
            <Container>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <TextField
                    label="Skip chapters"
                    size="small"
                    type="number"
                    fullWidth
                    defaultValue={config.skip}
                    onBlur={({ target }) => {
                      setConfig({ ...config, skip: +target.value });
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Split chapters"
                    size="small"
                    type="number"
                    fullWidth
                    defaultValue={config.skip}
                    onBlur={({ target }) => {
                      setConfig({ ...config, split: +target.value });
                    }}
                  />
                </Grid>

                <Grid item xs={4}>
                  <DownloadAll chapters={props.chapters} skip={config.skip} />
                </Grid>
              </Grid>
              <BookList
                {...props}
                skip={config.skip || 0}
                split={config.split || props.chapters.length}
              />
            </Container>
          ) : (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          )}
        </Paper>
      </Modal>
    </>
  );
}

export default BookDownloader;
