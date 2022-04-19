import List from "@mui/material/List";

import { Book, BookProps } from "./Book";

export interface BookListProps extends BookProps {
  split: number;
  skip: number;
}

export const BookList = ({
  chapters,
  split,
  skip,
  title,
  ...props
}: BookListProps) => {
  const books = () => {
    const books: BookProps[] = [];
    let start = 0;
    while (start < chapters.length) {
      const bookStart = Math.max(start, skip);
      const end = Math.min(start + split, chapters.length);
      if (bookStart < end) {
        books.push({
          ...props,
          title: `${title} (${bookStart + 1}-${end})`,
          chapters: chapters.slice(bookStart, end),
        });
      }
      start += split;
    }

    return books;
  };

  return (
    <List sx={{ width: "100%" }}>
      {books().map((book, i) => (
        <Book key={i} {...book} />
      ))}
    </List>
  );
};
