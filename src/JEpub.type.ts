declare global {
  interface jEpubInitProps {
    i18n: string;
    title: string;
    author: string;
    publisher: string;
    description?: string;
    tags?: string[];
  }
  interface DownloadDataProps {
    info: jEpubInitProps & { cover: string };
    chapters: { title: string; url: string }[];
  }

  class jEpub {
    init(props: jEpubInitProps): jEpub;
    add(title: string, content: string): jEpub;
    cover(data: any): jEpub;
    image(data: Blob | ArrayBuffer, name: string): jEpub;
    generate(): Promise<any>;
    static html2text(html: string, noBr?: boolean): string;
  }
}

export {};
