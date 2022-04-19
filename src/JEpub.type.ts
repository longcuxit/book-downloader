declare global {
  interface jEpubInitProps {
    i18n: string;
    title: string;
    author: string;
    publisher: string;
    description?: string;
    tags?: string[];
  }
  interface BookDownloaderProps {
    fetchData(): Promise<
      jEpubInitProps & {
        cover: string;
        chapters: { title: string; url: string }[];
      }
    >;

    formatContent(content: string): string;
  }
  interface Window {
    bookDownloaderRegister(
      element: HTMLElement,
      props: BookDownloaderProps
    ): void;
  }

  class jEpub {
    init(props: jEpubInitProps): jEpub;
    add(title: string, content: string): jEpub;
    cover(data: any): jEpub;
    generate(): Promise<any>;
  }
}

export {};
