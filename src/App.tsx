import { useEffect, useState } from "react";
import "./App.css";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

import CloseIcon from "@mui/icons-material/Close";

import { ChapterModel } from "./models/Chapter.model";

import { BookList, BookListProps } from "./BookList";
import { Info } from "./Infor";
import { helper } from "./helper";
import { control } from "./controller";

type CacheItem = BookListProps | Promise<DownloadDataProps>;

const cacheData: Record<string, CacheItem> = {};

function BookDownloader() {
  const [props, setProps] = useState<BookListProps>();
  const [image, setImage] = useState<Blob>();

  const handleClose = () => control.send("BookDownload-close");
  const onClickOverlay = (e: any) => {
    if (!e.target.closest(".modal-content")) {
      handleClose();
    }
  };
  // DownloadDataProps
  useEffect(() => {
    return control.effect("initialize", async ({ uid }: { uid: string }) => {
      let item = cacheData[uid];

      if (!item) {
        setProps(undefined);
        item = cacheData[uid] = control.request(uid);
      }

      if (item instanceof Promise) {
        const data: DownloadDataProps = await item;
        const { info, chapters } = data;
        const cover = await helper.downloadImage(info.cover);
        item = cacheData[uid] = {
          info: { ...info, cover },
          chapters: chapters.map((chap) => {
            return new ChapterModel(chap.title, chap.url);
          }),
        };
      }

      setProps(item);
    });
  }, []);

  return (
    <Box
      position="fixed"
      display="flex"
      alignItems="center"
      bgcolor="rgba(0,0,0, 0.5)"
      sx={{ inset: 0 }}
      onClick={onClickOverlay}
    >
      <Box
        width="100%"
        maxHeight="100%"
        overflow="auto"
        height={{ xs: "100%", md: "auto" }}
      >
        <Paper
          elevation={3}
          className="modal-content"
          sx={{
            maxWidth: "100%",
            width: 600,
            padding: "16px 0",
            marginX: "auto",
            position: "relative",
            height: { xs: "100%", md: "auto" },
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
      </Box>
    </Box>
  );
}

export default BookDownloader;
