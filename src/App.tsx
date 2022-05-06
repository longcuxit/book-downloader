import { useEffect, useState } from "react";
import "./App.css";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { ChapterModel } from "./models/Chapter.model";

import { BookList, BookListProps } from "./BookList";
import { Info } from "./Infor";
import { helper, withContainer } from "./helper";
import { control } from "./controller";
import { downloader } from "./Downloader";
import { AsyncDialogContainer, useConfirmDialog } from "./AsyncDialog";

type CacheItem = BookListProps | Promise<DownloadDataProps>;

const cacheData: Record<string, CacheItem> = {};

console.log(chrome.extension.getBackgroundPage());

const activeTab = () => {
  return new Promise<chrome.tabs.Tab>((next) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) =>
      next(tab)
    );
  });
};
//"/static/client.js", "/static/metruyenchu.ebook.js"
const executeScript = (src: string) => {
  return new Promise<any>(async (next) => {
    const { id } = await activeTab();
    chrome.scripting.executeScript(
      {
        target: { tabId: id! },
        files: [src],
      },
      ([{ result }]) => next(result)
    );
  });
};

activeTab().then(({ id }) => {});

function BookDownloader() {
  const [props, setProps] = useState<BookListProps>();
  const [image, setImage] = useState<Blob>();
  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    executeScript("/static/client.js");

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
        let { image = "link" } = data;
        downloader.maxChunks = maxChunks;
        let cover = (await helper.imageToBlob(info.cover)) ?? undefined;
        info.description = helper.cleanHTML(info.description ?? "");
        item = cacheData[href] = {
          info: { ...info, cover, href: href },
          chapters: chapters.map((chap, index) => {
            return new ChapterModel(chap, image);
          }),
        };
      }

      setProps(item);
    });
  }, [confirmDialog]);

  return (
    <>
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
    </>
  );
}

export default withContainer(AsyncDialogContainer)(BookDownloader);
