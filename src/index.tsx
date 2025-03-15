import ReactDOM from "react-dom/client";
import "utils/polyfill";
import BookDownloader from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<BookDownloader />);
