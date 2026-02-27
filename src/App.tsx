import { useEffect, useState } from "react";
import "./App.css";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import DialogContentText from "@mui/material/DialogContentText";
import Grid from "@mui/material/Grid";

import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

import { ChapterModel } from "./models/Chapter.model";

import { BookList, BookListProps } from "./widgets/BookList";
import { Info } from "./widgets/Infor";
import { ConfigForm } from "./widgets/ConfigForm";
import { defaultConfig, getActiveConfig } from "./config";
import { helper, withContainer } from "./utils/helpers";
import { control } from "./utils/controller";
import { downloader } from "./utils/Downloader";
import { AsyncDialogContainer, useConfirmDialog } from "widgets/AsyncDialog";

type CacheItem = BookListProps | Promise<DownloadDataProps>;

const cacheData: Record<string, CacheItem> = {};

const confirmUnblock = {
  title: "Access Control-Allow-Origin - Unblock",
  content: (
    <DialogContentText>
      If you want download image for content, please install extension Access
      Control-Allow-Origin - Unblock and active it.
      <br />
      <br />
      <Link
        href="https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino"
        target="_blank"
      >
        CORS Unblock
      </Link>{" "}
      for Chrome
      <br />
      <Link
        href="https://addons.mozilla.org/vi/firefox/addon/access-control-allow-origin/"
        target="_blank"
      >
        Allow CORS
      </Link>{" "}
      for Firefox
    </DialogContentText>
  ),
};

function BookDownloader() {
  const [props, setProps] = useState<BookListProps>();
  const [image, setImage] = useState<Blob>();
  const [domain, setDomain] = useState<string>("");
  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) {
        control.closeModal();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [confirmDialog]);

  useEffect(() => {
    return control.effect(
      "BookDownloader-open",
      async ({ href }: { href: string }) => {
        console.log("BookDownloader-open", href);
        let item = cacheData[href];
        window.focus();

        const urlObj = new URL(href);
        setDomain(urlObj.hostname);

        if (!item) {
          setProps(undefined);
          const activeConfig = getActiveConfig(urlObj.hostname);
          item = cacheData[href] = control.request("initialize", {
            href,
            config: activeConfig,
          });
        }

        if (item instanceof Promise) {
          const data: DownloadDataProps = await item;
          const { info, chapters, maxChunks = 5 } = data;
          let { image = "link" } = data;
          downloader.maxChunks = maxChunks;
          let cover;
          if (image === "download") {
            do {
              cover = (await helper.imageToBlob(info.cover)) ?? undefined;
            } while (!cover && (await confirmDialog(confirmUnblock)));
            if (!cover) {
              cover = await helper.noCors(info.cover, helper.imageToBlob);
              image = "embed";
            }
          } else {
            cover = await helper.noCors(info.cover, (img: string) =>
              helper.imageToBlob(img, "image/jpeg"),
            );
          }

          info.description = helper.cleanHTML(info.description ?? "");
          item = cacheData[href] = {
            info: { ...info, cover, href: href },
            chapters: chapters.map((chap) => new ChapterModel(chap, image)),
          };
        }

        setProps(item);
      },
    );
  }, [confirmDialog]);

  return (
    <Box
      position="fixed"
      display="flex"
      alignItems="center"
      bgcolor="rgba(0,0,0, 0.5)"
      sx={{ inset: 0 }}
      onClick={({ target }) => {
        if (!(target as any).closest(".MuiPaper-root")) {
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
          sx={{
            maxWidth: "100%",
            width: 1000,
            marginX: "auto",
            position: "relative",
            boxSizing: "border-box",
            minHeight: { xs: "100%", md: 400 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AppBar position="sticky">
            <Toolbar variant="dense">
              <Typography
                variant="subtitle1"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                sx={{ width: "35%" }}
              >
                Config Selectors
              </Typography>
              <Typography
                variant="subtitle1"
                component="div"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                sx={{ flexGrow: 1 }}
              >
                {props?.info.title || domain}
              </Typography>

              <IconButton onClick={control.closeModal} color="inherit">
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Box flex={1}>
            <Grid container spacing={0} height="100%">
              {/* Cột trái: Config Form */}
              <Grid
                item
                xs={12}
                md={4}
                height={{ xs: "auto", md: "100%" }}
                borderRight={{ xs: "none", md: "1px solid rgba(0,0,0,0.1)" }}
              >
                <ConfigForm
                  onSave={() => {
                    if (props?.info?.href) {
                      delete cacheData[props.info.href];
                      control.emit("BookDownloader-open", {
                        href: props.info.href,
                      });
                    }
                  }}
                  domain={domain}
                />
              </Grid>

              {/* Cột phải: Info & Chapter List */}
              <Grid
                item
                xs={12}
                md={8}
                height={{ xs: "auto", md: "100%" }}
                sx={{ overflowY: "auto", position: "relative", minHeight: 300 }}
              >
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
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default withContainer(AsyncDialogContainer)(BookDownloader);
