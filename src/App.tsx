import React, { useEffect, useState } from "react";
import "./App.css";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";

import { ChapterModel } from "./models/Chapter.model";

import { BookList, BookListProps } from "./BookList";
import { Info } from "./Infor";
import { _ } from "./helper";

function BookDownloader({ fetchData, parseChapter }: BookDownloaderProps) {
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const [props, setProps] = useState<BookListProps>();
  const [image, setImage] = useState<Blob>();

  useEffect(() => {
    if (!open || props) return;
    fetchData().then(async ({ info, chapters }) => {
      if (!chapters.length) return;
      const cover = await _.downloadImage(info.cover);

      setProps({
        info: { ...info, cover },
        chapters: chapters.map((chap) => {
          return new ChapterModel(chap.title, chap.url, parseChapter);
        }),
      });
    });
  }, [fetchData, open, parseChapter, props]);

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
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999999,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: "100%",
            width: 600,
            height: { xs: "100%", md: "auto" },
            maxHeight: "100%",
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
            <>
              <Info info={props.info} onImage={setImage} image={image} />
              <BookList {...props} image={image} />
            </>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              minHeight={300}
            >
              <CircularProgress />
            </Box>
          )}
        </Paper>
      </Modal>
    </>
  );
}

export default BookDownloader;
