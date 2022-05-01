import ReactDOM from "react-dom/client";
import BookDownloader from "./App";
import JSZip from "jszip";

// const libs = [
//   "https://unpkg.com/jszip@3.2.0/dist/jszip.min.js",
//   "https://unpkg.com/ejs@3.1.6/ejs.min.js",
//   "https://unpkg.com/jepub/dist/jepub.min.js",
// ];

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<BookDownloader />);

Object.assign(window, {
  JSZip,
});
