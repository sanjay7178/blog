import { LOCALE, SITE } from "@config";
import type { CollectionEntry } from "astro:content";

interface DatetimesProps {
  pubDatetime: string | Date;
  modDatetime: string | Date | undefined | null;
}

interface EditPostProps {
  editPost?: CollectionEntry<"blog">["data"]["editPost"];
  postId?: CollectionEntry<"blog">["id"];
}

interface Props extends DatetimesProps, EditPostProps {
  size?: "sm" | "lg";
  className?: string;
}

export default function Datetime({
  pubDatetime,
  modDatetime,
  size = "sm",
  className = "",
  editPost,
  postId,
}: Props) {
  const isUpdated = Boolean(modDatetime && modDatetime > pubDatetime);

  return (
    <div className={`flex items-center gap-2 text-skin-muted ${className}`.trim()}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${
          size === "sm" ? "!h-4 !w-4" : "!h-5 !w-5"
        } fill-current opacity-70`}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"></path>
        <path d="M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z"></path>
      </svg>
      <span className="sr-only">{isUpdated ? "Updated" : "Published"}</span>
      <span
        className={`italic ${size === "sm" ? "text-xs" : "text-sm"} tracking-wide`}
      >
        {isUpdated && <span aria-hidden="true">Updated · </span>}
        <FormattedDatetime
          pubDatetime={pubDatetime}
          modDatetime={modDatetime}
        />
        {size === "lg" && <EditPost editPost={editPost} postId={postId} />}
      </span>
    </div>
  );
}

const FormattedDatetime = ({ pubDatetime, modDatetime }: DatetimesProps) => {
  const myDatetime = new Date(
    modDatetime && modDatetime > pubDatetime ? modDatetime : pubDatetime
  );

  const date = myDatetime.toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <time dateTime={myDatetime.toISOString()}>{date}</time>
  );
};

const EditPost = ({ editPost, postId }: EditPostProps) => {
  let editPostUrl = editPost?.url ?? SITE?.editPost?.url ?? "";
  const showEditPost = !editPost?.disabled && editPostUrl.length > 0;
  const appendFilePath =
    editPost?.appendFilePath ?? SITE?.editPost?.appendFilePath ?? false;
  if (appendFilePath && postId) {
    editPostUrl += `/${postId}`;
  }
  const editPostText = editPost?.text ?? SITE?.editPost?.text ?? "Edit";

  return (
    showEditPost && (
      <>
        <span aria-hidden="true"> · </span>
        <a
          className="hover:text-skin-accent"
          href={editPostUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {editPostText}
        </a>
      </>
    )
  );
};
