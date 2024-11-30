  import type { GiscusProps } from "@giscus/react";
import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://sanjay7178.github.io/blog", // replace this with your deployed domain
  author: "Immortal",
  profile: "https://sanjay7178.github.io/",
  desc: "",
  title: "Blog",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  editPost: {
    url: "https://github.com/satnaing/astro-paper/edit/main/src/content/blog",
    text: "Suggest Changes",
    appendFilePath: true,
  },
};


export const GISCUS: GiscusProps = {
  repo: "sanjay7178/blog",
  repoId: "R_kgDONCRpkw",
  category: "Announcements",
  categoryId: "DIC_kwDONCRpk84Cjemz",
  mapping: "pathname",
  reactionsEnabled: "0",
  emitMetadata: "0",
  inputPosition: "bottom",
  lang: "en",
  loading: "lazy",
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/sanjay7178/",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://x.com/sanjay7178",
    linkTitle: `${SITE.title} on Twitter`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:sanjay.obsidian@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },

];
