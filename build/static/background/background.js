const { IndexDB } = require("./indexDB");

const db = await new indexedDB().open();

// chrome.runtime.onMessage.addListener(({ type, name }) => {
//   if (type === "set-name") {
//     savedName = name;
//   }
// });
