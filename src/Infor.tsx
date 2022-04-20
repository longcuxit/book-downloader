import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import DeleteIcon from "@mui/icons-material/DeleteOutline";

import { _ } from "./helper";
import { BookInfo } from "./models/Book.model";

export interface InfoProps {
  info: BookInfo;
  onImage(data?: string): void;
  image?: string;
}

export const Info = ({ info, image, onImage }: InfoProps) => {
  const onDrop = useCallback(
    ([file]: File[]) => {
      if (!file) return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => _.getImage(reader.result as string).then(onImage);
    },
    [onImage]
  );

  const onPaste = useCallback(
    (e: any) => {
      e.preventDefault();
      const files = Array.from<File>(e.clipboardData.files);
      files.filter(({ type }) => type.startsWith("image/"));
      if (files.length) onDrop(files);
    },
    [onDrop]
  );

  useEffect(() => {
    window.addEventListener("paste" as any, onPaste);

    return () => window.removeEventListener("paste" as any, onPaste);
  }, [onPaste]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: "image/*",
  });

  const cover = image ?? info.cover;

  return (
    <Grid container spacing={1}>
      <Grid item>
        <Box
          width={150}
          height={200}
          bgcolor="#ccc"
          display="flex"
          alignItems="center"
          textAlign="center"
          justifyContent="center"
          position="relative"
          borderRadius={1}
          overflow="hidden"
          style={{ cursor: "pointer" }}
        >
          <input
            {...getInputProps()}
            onKeyDown={(e) => e.preventDefault()}
            onPaste={(e: any) => {
              e.preventDefault();
              const files = Array.from<File>(e.clipboardData.files);
              files.filter(({ type }) => type.startsWith("image/"));
              if (files.length) onDrop(files);
            }}
          />
          {cover && !isDragActive && (
            <>
              <Box
                position="absolute"
                width="100%"
                height="100%"
                component="img"
                style={{ objectFit: "cover" }}
                src={cover}
                alt="Cover"
              />
              {image && (
                <Button
                  startIcon={<DeleteIcon />}
                  variant="contained"
                  fullWidth
                  style={{
                    position: "absolute",
                    bottom: 0,
                    borderRadius: 0,
                    zIndex: 1,
                    opacity: 0.7,
                  }}
                  color="error"
                  onClick={() => onImage()}
                >
                  Delete
                </Button>
              )}
            </>
          )}
          <Typography variant="subtitle2">
            {isDragActive ? "Drop here ..." : "Drag, drop or click here ..."}
          </Typography>

          <Box
            position="absolute"
            width="100%"
            height="100%"
            component="div"
            {...getRootProps()}
            contentEditable
            onKeyDown={(e: any) => {
              if (e.ctrlKey || e.metaKey) return;
              e.preventDefault();
            }}
            onPaste={({ target }: any) => target.blur()}
            style={{ opacity: "0" }}
          />
        </Box>
      </Grid>
      <Grid item flex={1}>
        <Box position="relative" height="100%">
          <Box
            display="flex"
            flexDirection="column"
            position="absolute"
            style={{ inset: 0 }}
          >
            <Typography variant="h6">{info.title}</Typography>
            <Box overflow="auto">
              {info.tags?.map((tag, i) => (
                <Typography key={i} variant="subtitle2">
                  {tag}
                </Typography>
              ))}
              <hr />
              <Typography variant="caption">{info.description}</Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
