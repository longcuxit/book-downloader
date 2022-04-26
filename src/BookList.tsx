import { useEffect, useMemo, useState } from "react";

import List from "@mui/material/List";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import DownloadIcon from "@mui/icons-material/Download";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveIcon from "@mui/icons-material/Save";

import { ChapterModel } from "./models/Chapter.model";

import { Book } from "./Book";
import { BookInfo, BookModel } from "./models/Book.model";
import { useEventEmitter } from "./helper";

const AllButtons = ({ books }: { books: BookModel[] }) => {
  const allBooks = useMemo(() => {
    const chapters = books.flatMap((book) => book.chapters);

    return new BookModel({} as BookInfo, chapters);
  }, [books]);

  useEventEmitter(allBooks, "stat");

  const { stat, composed } = allBooks;

  useEffect(() => () => allBooks.destroy(), [allBooks]);

  return (
    <>
      <Button
        variant="contained"
        disabled={
          composed.progress === 100 || (!!composed.running && !stat.waiting)
        }
        onClick={allBooks.toggleDownload}
        sx={{ minWidth: 44 }}
      >
        {composed.running ? (
          <PauseIcon />
        ) : composed.progress ? (
          <ReplayIcon />
        ) : (
          <DownloadIcon />
        )}
        <Box display={{ xs: "none", sm: "block" }}>Fetch</Box>
      </Button>

      <Button
        variant="contained"
        sx={{ marginLeft: 1, minWidth: 44 }}
        // startIcon={<SaveIcon />}
        disabled={!!composed.running || !stat.success}
        onClick={() => books.forEach((book) => book.save())}
      >
        <SaveIcon />
        <Box display={{ xs: "none", sm: "block" }}>Save</Box>
      </Button>
    </>
  );
};

export interface BookListProps {
  chapters: ChapterModel[];
  info: BookInfo;
  image?: Blob;
}

export const BookList = ({ chapters, info, image }: BookListProps) => {
  const [config, setConfig] = useState({ skip: 0, split: 1000 });

  const [books, setBooks] = useState<BookModel[]>([]);

  const skip = config.skip;
  const split = config.split || chapters.length;

  useEffect(() => {
    const books: BookModel[] = [];
    let start = 0;
    while (start < chapters.length) {
      const bookStart = Math.max(start, skip);
      const end = Math.min(start + split, chapters.length);
      if (bookStart < end) {
        const bookInfo: BookInfo = {
          ...info,
          title: `${info.title} (${bookStart + 1}-${end})`,
        };
        const book = new BookModel(bookInfo, chapters.slice(bookStart, end));
        books.push(book);
      }
      start += split;
    }
    setBooks(books);
  }, [skip, split, chapters, info]);

  useMemo(() => {
    books.forEach((book) => {
      book.info.cover = image ?? info.cover;
    });
  }, [image, info, books]);

  useEffect(() => () => books.forEach((book) => book.destroy()), [books]);

  return (
    <>
      <AppBar position="sticky" sx={{ paddingTop: 1, marginTop: 1 }}>
        <Toolbar variant="dense">
          <TextField
            label="Skip chapters"
            size="small"
            type="number"
            margin="dense"
            defaultValue={config.skip}
            sx={{ marginRight: 1 }}
            onBlur={({ target }) => {
              setConfig({ ...config, skip: +target.value });
            }}
          />
          <TextField
            label="Book chapters"
            size="small"
            type="number"
            margin="dense"
            defaultValue={config.split}
            sx={{ marginRight: 1 }}
            onBlur={({ target }) => {
              setConfig({ ...config, split: +target.value });
            }}
            onSubmit={({ currentTarget }) => currentTarget.blur()}
          />
          <Box flexGrow={1} />
          <AllButtons books={books} />
        </Toolbar>
      </AppBar>
      <Container>
        <List sx={{ width: "100%" }}>
          {books.map((book, i) => (
            <Book key={i} book={book} />
          ))}
        </List>
      </Container>
    </>
  );
};
