import { useEffect, useState } from "react";
import "./App.css";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

import { ChapterModel } from "./models/Chapter.model";

import { BookList, BookListProps } from "./BookList";
import { Info } from "./Infor";
import { helper } from "./helper";
import { control } from "./controller";
import { downloader } from "./Downloader";

type CacheItem = BookListProps | Promise<DownloadDataProps>;

const cacheData: Record<string, CacheItem> = {};

function BookDownloader() {
  const [props, setProps] = useState<BookListProps>();
  const [image, setImage] = useState<Blob>();

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.keyCode === 27) control.closeModal();
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
    };
  }, []);

  useEffect(() => {
    return control.effect("initialize", async ({ href }: { href: string }) => {
      let item = cacheData[href];
      window.focus();
      if (!item) {
        setProps(undefined);
        item = cacheData[href] = control.request(href);
      }

      if (item instanceof Promise) {
        const data: DownloadDataProps = await item;
        const { info, chapters, maxChunks = 5 } = data;
        downloader.maxChunks = maxChunks;
        const cover = await helper.downloadImage(info.cover);
        info.description = helper.cleanHTML(info.description ?? "");
        item = cacheData[href] = {
          info: { ...info, cover, href: href },
          chapters: chapters.map((chap, index) => {
            return new ChapterModel(
              href,
              chap.title,
              chap.url ?? helper.base64URL(index.toString())
            );
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
      onClick={({ target }) => {
        if (!(target as any).closest(".modal-content")) {
          control.closeModal();
        }
      }}
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
            marginX: "auto",
            position: "relative",
            boxSizing: "border-box",
            minHeight: { xs: "100%", md: 300 },
          }}
        >
          <section>
            <AppBar position="sticky">
              <Toolbar variant="dense">
                <Typography
                  variant="subtitle1"
                  component="div"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  sx={{ flexGrow: 1 }}
                >
                  {props?.info.title}
                </Typography>

                <IconButton onClick={control.closeModal} color="inherit">
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>

            {props ? (
              <>
                <Info info={props.info} onImage={setImage} image={image} />
                <BookList {...props} image={image} />
              </>
            ) : (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </section>
        </Paper>
      </Box>
    </Box>
  );
}

export default BookDownloader;
