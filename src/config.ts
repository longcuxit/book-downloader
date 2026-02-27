export interface SelectorConfig {
  info: {
    title: string;
    author: string;
    description: string;
    cover: string;
    tags: string;
  };
  chapterList: string;
  chapterListScript: string;
  chapterDetail: string;
}

export interface ConfigMap {
  version: number;
  hosts: Record<string, SelectorConfig>;
}

export const defaultConfig: ConfigMap = {
  version: 1,
  hosts: {
    "dtruyen.com": {
      info: {
        title: "h1.title",
        author: ".infos .author a",
        description: ".description",
        cover: ".thumb img.cover",
        tags: ".infos .story_categories a",
      },
      chapterList: "#chapters .chapters a",
      chapterListScript: "",
      chapterDetail: "#chapter-content",
    },
    "m.truyen.tangthuvien.vn": {
      info: {
        title: ".detail > h4",
        author: ".book-author-vv .book-title",
        description: ".book-introduce",
        cover: ".book-detail>img",
        tags: ".tag-list > a",
      },
      chapterList: ".body-container .chapters:last-child a",
      chapterListScript: "",
      chapterDetail: ".chap-c",
    },
    "metruyenchu.com.vn": {
      info: {
        title: ".mRightCol h1",
        author: ".book-info-text a[href*=tac-gia]",
        description: ".intro",
        cover: ".book-3d img",
        tags: ".book-info-text a[href*=the-loai]",
      },
      chapterList: ".clearfix a",
      chapterListScript: `
const baseUrl = window.location.origin;
const bookId = rid
const numChapters = +_.query('.book-info-text li:nth-child(3)').childNodes[1].textContent
const maxPage = Math.ceil(numChapters / 100)
const chapters = [];
let page = 1;
while (page <= maxPage) {
  const url = \`\${baseUrl}/get/listchap/\${bookId}?page=\${page}\`;
  const response = await fetch(url);
  if (!response.ok) break;

  const json = await response.json();
  if (!json.data || json.data.trim() === "" || !json.data.includes('<li')) break;

  const div = _.stringToDom(json.data);
  Array.from(div.querySelectorAll("li a")).forEach((aTag) => {
    const href = aTag.getAttribute("href");
    if (href && !href.includes("javascript")) {
      chapters.push({
        title: aTag.innerText.trim(),
        url: href.startsWith("http") ? href : baseUrl + href,
      });
    }
  });

  page++;
}
return chapters;
      `,
      chapterDetail: ".truyen",
    },
    "nettruyen.mobi": {
      info: {
        title: "#manga-detail > h1",
        author: ".list-info .info-item:nth-child(2) a",
        description: ".detail-content > p",
        cover: ".info-image img",
        tags: ".list-info .info-item:nth-child(3) .info-content, .list-info .info-item:nth-child(4) a",
      },
      chapterList: ".list-chapters .chapter a",
      chapterListScript: "",
      chapterDetail: ".reading-content",
    },
    "truyen.tangthuvien.vn": {
      info: {
        title: ".book-info > h1",
        author: ".tag > a[href*=tac-gia]",
        description: ".book-intro > p",
        cover: "#bookImg>img",
        tags: ".book-info > .tag > *, .book-state li.tags .tag-wrap > *",
      },
      chapterList: "ul a",
      chapterListScript: "",
      chapterDetail: ".box-chap",
    },
    "truyenfull.vn": {
      info: {
        title: ".title",
        author: ".info a[href*=tac-gia]",
        description: ".desc-text",
        cover: ".book>img",
        tags: "",
      },
      chapterList: ".list-chapter a",
      chapterListScript: "",
      chapterDetail: "#chapter-c",
    },
    "wattpad.vn": {
      info: {
        title: "h1.title",
        author: ".info p:nth-child(1) > a",
        description: ".content1 > p",
        cover: "img.scover",
        tags: ".info p:nth-child(2) > a",
      },
      chapterList: ".list-chap a",
      chapterListScript: "",
      chapterDetail: ".container1 > p",
    },
    default: {
      info: {
        title: "h1",
        author: ".author",
        description: ".desc",
        cover: ".cover img",
        tags: ".tags a",
      },
      chapterList: ".chapter-list a",
      chapterListScript: "",
      chapterDetail: "#chapter-content",
    },
  },
};

export const getCustomConfig = (): Record<string, SelectorConfig> => {
  try {
    const raw = localStorage.getItem("BookDownloaderConfig");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
};

export const saveCustomConfig = (config: Record<string, SelectorConfig>) => {
  localStorage.setItem("BookDownloaderConfig", JSON.stringify(config));
};

export const emptyConfig: SelectorConfig = {
  info: {
    title: "",
    author: "",
    description: "",
    cover: "",
    tags: "",
  },
  chapterList: "",
  chapterListScript: "",
  chapterDetail: "",
};

export const getActiveConfig = (domain: string): SelectorConfig => {
  const customHosts = getCustomConfig();
  const config =
    customHosts[domain] ||
    defaultConfig.hosts[domain] ||
    defaultConfig.hosts["default"] ||
    emptyConfig;
  return config;
};
