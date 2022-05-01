const redirects = {};
const onBeforeRedirect = (d) => {
  if (d.type === "main_frame") {
    return;
  }
  redirects[d.tabId] = redirects[d.tabId] || {};
  redirects[d.tabId][d.requestId] = true;
};

const onHeadersReceived = (d) => {
  if (d.type === "main_frame") {
    return;
  }

  console.log(d);
  const { initiator, originUrl, responseHeaders, requestId, tabId } = d;
  let origin = "*";

  const redirect = redirects[tabId] ? redirects[tabId][requestId] : false;
  if (redirect !== true) {
    try {
      const o = new URL(initiator || originUrl);
      origin = o.origin;
    } catch (e) {
      console.warn("cannot extract origin for initiator", initiator);
    }
  } else {
    origin = "*";
  }
  if (redirects[tabId]) {
    delete redirects[tabId][requestId];
  }

  const o = responseHeaders.find(
    ({ name }) => name.toLowerCase() === "access-control-allow-origin"
  );

  if (o) {
    if (o.value !== "*") {
      o.value = origin;
    }
  } else {
    responseHeaders.push({
      name: "Access-Control-Allow-Origin",
      value: origin,
    });
  }
  // if (prefs.methods.length > 3) {
  //   // GET, POST, HEAD are mandatory
  //   const o = responseHeaders.find(
  //     ({ name }) => name.toLowerCase() === "access-control-allow-methods"
  //   );
  //   if (o) {
  //     // only append methods that are not in the supported list
  //     o.value = [
  //       ...new Set([
  //         ...prefs.methods,
  //         ...o.value.split(/\s*,\s*/).filter((a) => {
  //           return DEFAULT_METHODS.indexOf(a) === -1;
  //         }),
  //       ]),
  //     ].join(", ");
  //   } else {
  //     responseHeaders.push({
  //       name: "Access-Control-Allow-Methods",
  //       value: prefs.methods.join(", "),
  //     });
  //   }
  // }
  // The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*'
  // when the request's credentials mode is 'include'.
  // if (prefs["allow-credentials"] === true) {
  //   const o = responseHeaders.find(
  //     ({ name }) => name.toLowerCase() === "access-control-allow-origin"
  //   );
  //   if (!o || o.value !== "*") {
  //     const o = responseHeaders.find(
  //       ({ name }) => name.toLowerCase() === "access-control-allow-credentials"
  //     );
  //     if (o) {
  //       o.value = "true";
  //     } else {
  //       responseHeaders.push({
  //         name: "Access-Control-Allow-Credentials",
  //         value: "true",
  //       });
  //     }
  //   }
  // }
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers
  // if (prefs["allow-headers"] === true) {
  //   const o = responseHeaders.find(
  //     ({ name }) => name.toLowerCase() === "access-control-allow-headers"
  //   );
  //   if (o) {
  //     o.value = prefs["allow-headers-value"];
  //   } else {
  //     responseHeaders.push({
  //       name: "Access-Control-Allow-Headers",
  //       value: prefs["allow-headers-value"],
  //     });
  //   }
  // }
  // if (prefs["allow-headers"] === true) {
  //   const o = responseHeaders.find(
  //     ({ name }) => name.toLowerCase() === "access-control-expose-headers"
  //   );
  //   if (!o) {
  //     responseHeaders.push({
  //       name: "Access-Control-Expose-Headers",
  //       value: prefs["expose-headers-value"],
  //     });
  //   }
  // }
  // if (prefs["remove-x-frame"] === true) {
  //   const i = responseHeaders.findIndex(
  //     ({ name }) => name.toLowerCase() === "x-frame-options"
  //   );
  //   if (i !== -1) {
  //     responseHeaders.splice(i, 1);
  //   }
  // }
  return { responseHeaders };
};

const install = () => {
  remove();
  const extra = ["blocking", "responseHeaders"];
  if (/Firefox/.test(navigator.userAgent) === false) {
    extra.push("extraHeaders");
  }
  chrome.webRequest.onHeadersReceived.addListener(
    onHeadersReceived,
    { urls: ["<all_urls>"] },
    extra
  );
  chrome.webRequest.onBeforeRedirect.addListener(onBeforeRedirect, {
    urls: ["<all_urls>"],
  });
};

const remove = () => {
  chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceived);
  chrome.webRequest.onBeforeRedirect.removeListener(onBeforeRedirect);
};

// onCommand = () => {
//   if (prefs.enabled) {
//     install();
//   } else {
//     remove();
//   }
// };

// chrome.storage.onChanged.addListener((ps) => {
//   Object.keys(ps).forEach((name) => (prefs[name] = ps[name].newValue));
//   onCommand();
// });
install();

chrome.tabs.onRemoved.addListener((tabId) => delete redirects[tabId]);
