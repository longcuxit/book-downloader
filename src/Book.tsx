import { useState } from "react";

import { saveAs } from "file-saver";

import { Box, IconButton, ListItem, ListItemText } from "@mui/material";

import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";

import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";

import { Chapter, ChapterStatus, useChaptersStat } from "./Chapter";
import { downloader } from "./Downloader";

export interface BookProps extends jEpubInitProps {
  cover?: string;
  chapters: Chapter[];
}

export const Book = ({ title, chapters, cover, ...props }: BookProps) => {
  const [chapterStat, composed] = useChaptersStat(chapters);

  const [saving, setSaving] = useState(false);

  const saveBook = async () => {
    setSaving(true);
    const epub = new jEpub().init({
      title,
      ...props,
    });

    chapters.forEach((chapter) => {
      epub.add(chapter.title, chapter.content);
    });

    try {
      if (cover) {
        const buffer = await fetch(cover).then((result) =>
          result.arrayBuffer()
        );
        epub.cover(buffer);
      }
      const epubZipContent = await epub.generate();
      console.log("created");
      saveAs(epubZipContent, `${title}.epub`);
      await new Promise((next) => setTimeout(next, 1000));
    } catch (_) {}

    setSaving(false);
  };

  return (
    <ListItem disableGutters>
      <ListItemText primary={title} />
      <IconButton
        aria-label="Download"
        hidden={composed.progress === 100}
        disabled={!!composed.running && !chapterStat[ChapterStatus.waiting]}
        onClick={() => {
          if (composed.running) {
            downloader.remove(chapters);
          } else {
            downloader.add(chapters);
          }
        }}
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
              {chapterStat[ChapterStatus.error]}
            </Box>
          </>
        ) : (
          <DownloadIcon color="success" />
        )}
      </IconButton>
      <IconButton
        disabled={
          !chapterStat[ChapterStatus.success] || !!composed.running || saving
        }
        color={chapterStat[ChapterStatus.error] ? "warning" : "success"}
        aria-label="Save"
        onClick={saveBook}
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
