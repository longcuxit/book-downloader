import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  defaultConfig,
  SelectorConfig,
  getActiveConfig,
  getCustomConfig,
  saveCustomConfig,
  emptyConfig,
} from "../config";
import { EditScriptButton } from "./EditScriptButton";

export const ConfigForm = ({
  onSave,
  domain,
}: {
  onSave: () => void;
  domain: string;
}) => {
  const [config, setConfig] = useState<SelectorConfig>(emptyConfig);

  useEffect(() => {
    setConfig(getActiveConfig(domain));
  }, [domain]);

  const handleChange = (
    section: keyof SelectorConfig,
    key: string,
    value: string,
  ) => {
    if (!config) return;
    const newConfig = { ...config };
    (newConfig as any)[section][key] = value;
    setConfig(newConfig);
  };

  const handleSave = () => {
    if (config) {
      const current = getCustomConfig();
      current[domain] = config;
      saveCustomConfig(current);
    }
    onSave();
  };

  const handleReset = () => {
    const fall = defaultConfig.hosts[domain] || defaultConfig.hosts["default"];
    setConfig(JSON.parse(JSON.stringify(fall)));
    const current = getCustomConfig();
    delete current[domain];
    saveCustomConfig(current);
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box flex={1} overflow="auto" px={2} py={1}>
        <Typography variant="subtitle2" gutterBottom>
          Info
        </Typography>
        <Box display="flex" flexDirection="column" gap={1} mb={2}>
          {["title", "author", "description", "cover", "tags"].map((k) => (
            <TextField
              key={`info-${k}`}
              label={`Info -> ${k}`}
              value={(config.info as any)[k] || ""}
              onChange={(e) => handleChange("info", k, e.target.value)}
              size="small"
              fullWidth
              variant="outlined"
            />
          ))}
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Chapter List
        </Typography>
        <Box mb={2} display="flex" gap={1}>
          <TextField
            label="chapterList"
            value={config.chapter?.list || ""}
            onChange={(e) => handleChange("chapter", "list", e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
          />
          <EditScriptButton
            value={config.chapter?.listScript || ""}
            onChange={(v) => handleChange("chapter", "listScript", v)}
          />
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Chapter Content
        </Typography>
        <Box mb={2} display="flex" gap={1}>
          <TextField
            label="chapterDetail"
            value={config.chapter?.content || ""}
            onChange={(e) => handleChange("chapter", "content", e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
          />
          <EditScriptButton
            value={config.chapter?.contentScript || ""}
            onChange={(v) => handleChange("chapter", "contentScript", v)}
          />
        </Box>
      </Box>
      <Box
        p={2}
        display="flex"
        justifyContent="space-between"
        borderTop="1px solid rgba(0,0,0,0.1)"
      >
        <Button onClick={handleReset} color="warning" size="small">
          Reset to Default
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          size="small"
        >
          Save & Apply
        </Button>
      </Box>
    </Box>
  );
};
