import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, modDatetime, description } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "font-serif text-xl font-normal tracking-tight text-skin-accent sm:text-[1.35rem]",
  };

  return (
    <li className="my-8">
      <a
        href={href}
        className="inline-block underline-offset-4 transition-opacity hover:opacity-80 focus-visible:no-underline"
      >
        {secHeading ? (
          <h2 {...headerProps}>{title}</h2>
        ) : (
          <h3 {...headerProps}>{title}</h3>
        )}
      </a>
      <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime} />
      <p className="mt-1.5 text-[0.95rem] leading-relaxed text-skin-muted">
        {description}
      </p>
    </li>
  );
}
