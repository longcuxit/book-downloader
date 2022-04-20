import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

import DownloadIcon from "@mui/icons-material/Download";
import KeyboardDoubleArrowDownIconIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import CloseIcon from "@mui/icons-material/Close";

import { BookList } from "./BookList";
import { Chapter, ChapterStatus, useChaptersStat } from "./Chapter";
import { downloader } from "./Downloader";
import { BookProps } from "./Book";
import { Infor } from "./Infor";
import { _ } from "./helper";

const duplicateStyle = {
  color: "#000",
  filter: "drop-shadow(#000 3px -3px 0px)",
};

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
    <IconButton
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
      style={{ textShadow: "2px 2px 4px #000000" }}
    >
      {composed.running ? (
        <PauseIcon style={duplicateStyle} />
      ) : composed.progress ? (
        <ReplayIcon style={duplicateStyle} />
      ) : (
        <KeyboardDoubleArrowDownIconIcon />
      )}
    </IconButton>
  );
};

function BookDownloader({ fetchData, formatContent }: BookDownloaderProps) {
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const [props, setProps] = useState<BookProps>();
  const [config, setConfig] = useState({ skip: 0, split: 0 });
  const [image, setImage] = useState<string>();

  useEffect(() => {
    if (!open || props) return;
    fetchData().then(async (data) => {
      console.log(data);
      if (!data.chapters.length) return;
      const cover = await _.getImage(data.cover);
      console.log(cover);
      setProps({
        ...data,
        cover,
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
        hideBackdrop
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ pointerEvents: "none" }}
      >
        <Paper
          style={{
            pointerEvents: "auto",
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
          <IconButton
            onClick={handleClose}
            size="small"
            style={{ position: "absolute", top: 0, right: 0 }}
          >
            <CloseIcon />
          </IconButton>
          {props ? (
            <Container>
              <Infor {...props} onImage={setImage} image={image} />
              <hr />
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
                cover={props.cover ?? image}
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
