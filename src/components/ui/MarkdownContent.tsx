"use client";

import { useMemo } from "react";
import { marked } from "marked";
import styles from "./MarkdownContent.module.css";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  const html = useMemo(() => {
    if (!content) return "";
    try {
      return marked.parse(content, {
        async: false,
        breaks: true,
        gfm: true,
      }) as string;
    } catch {
      return content;
    }
  }, [content]);

  if (!content) return <span className="text-gray-400">-</span>;

  return (
    <div
      className={`${styles.markdownBody} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MarkdownContent;
