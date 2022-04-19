import React from "react";
import ReactDOM from "react-dom/client";
import BookDownloader from "./App";

const libs = [
  "https://unpkg.com/jszip@3.2.0/dist/jszip.min.js",
  "https://unpkg.com/ejs@3.1.6/ejs.min.js",
  "https://unpkg.com/jepub/dist/jepub.min.js",
];

libs.forEach((src) => {
  const script = document.createElement("script");
  script.src = src;
  document.head.appendChild(script);
});

window.bookDownloaderRegister = (container, props) => {
  const root = ReactDOM.createRoot(container);
  root.render(<BookDownloader {...props} />);
};
