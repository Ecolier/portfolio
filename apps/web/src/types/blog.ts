import type { SerializedLexicalNode } from "@payloadcms/richtext-lexical/lexical";
import type { BlogPost as BlogPostDoc } from "@portfolio/types";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

export type BlogNode = Omit<SerializedLexicalNode, "$"> & {
  $?: Record<string, JsonValue>;
};

export type BlogPost = Omit<BlogPostDoc, "body" | "coverImage" | "tags"> & {
  body: {
    root: Omit<BlogPostDoc["body"]["root"], "children"> & {
      children: BlogNode[];
    };
  };
  coverImage?: { url: string; alt: string } | null;
  tags: string[];
};
