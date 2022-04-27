import { useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";

import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";

import useTheme from "@mui/material/styles/useTheme";

import DeleteIcon from "@mui/icons-material/DeleteOutline";

import { helper } from "./helper";
import { BookInfo } from "./models/Book.model";

export interface InfoProps {
  info: BookInfo;
  onImage(data?: Blob): void;
  image?: Blob;
}

export const Info = ({ info, image, onImage }: InfoProps) => {
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up("sm"));

  const onDrop = useCallback(
    ([file]: File[]) => {
      if (!file) return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        helper
          .imageToBlob(reader.result as string)
          .then((img) => onImage(img || undefined));
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

  const coverUrl = useMemo(() => cover && URL.createObjectURL(cover), [cover]);

  return (
    <Container sx={{ paddingY: 2 }}>
      <Grid container spacing={1}>
        <Grid item>
          <Box
            width={120}
            height={160}
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
                  src={coverUrl}
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
            <Typography variant="subtitle2" padding={2}>
              {isDragActive
                ? "Drop here ..."
                : "Drag-drop, paste or click here ..."}
            </Typography>

            <Box
              position="absolute"
              width="100%"
              height="100%"
              component="div"
              {...getRootProps()}
              contentEditable
              onFocus={(e: any) => {
                e.preventDefault();
                e.target.blur();
              }}
              style={{ opacity: "0" }}
            />
          </Box>
        </Grid>
        <Grid item flex={1}>
          <Box position="relative" height="100%">
            <Box position="absolute" style={{ inset: 0 }} overflow="auto">
              {info.tags?.map((tag, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  component="div"
                  dangerouslySetInnerHTML={{ __html: tag }}
                />
              ))}
              {upSM && (
                <Box textAlign="justify">
                  <Divider sx={{ marginY: 1 }} />
                  <Typography
                    variant="caption"
                    component="div"
                    dangerouslySetInnerHTML={{
                      __html: info.description ?? "",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
        {!upSM && (
          <Grid item xs={12} textAlign="justify">
            <Divider sx={{ marginY: 1 }} />
            <Typography
              variant="caption"
              component="div"
              dangerouslySetInnerHTML={{ __html: info.description ?? "" }}
            />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};
