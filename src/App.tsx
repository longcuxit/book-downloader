import React, { useEffect, useState } from "react";
import "./App.css";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";

import { ChapterModel } from "./models/Chapter.model";

import { BookList, BookListProps } from "./BookList";
import { Info } from "./Infor";
import { _ } from "./helper";

function BookDownloader({ fetchData, formatContent }: BookDownloaderProps) {
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const [props, setProps] = useState<BookListProps>();
  const [image, setImage] = useState<string>();

  useEffect(() => {
    if (!open || props) return;
    fetchData().then(async ({ info, chapters }) => {
      if (!chapters.length) return;
      const cover = await _.getImage(info.cover);

      setProps({
        info: { ...info, cover },
        chapters: chapters.map((chap) => {
          return new ChapterModel(chap.title, chap.url, formatContent);
        }),
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
          elevation={3}
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "100%",
            width: 600,
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
            <Container>
              <Info info={props.info} onImage={setImage} image={image} />
              <hr />
              <BookList {...props} image={image} />
            </Container>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height={300}
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
