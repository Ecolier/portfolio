import type { SerializedLexicalNode } from "@payloadcms/richtext-lexical/lexical";
import type { Project as ProjectDoc } from "@portfolio/types";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

export type DescriptionNode = Omit<SerializedLexicalNode, "$"> & {
  $?: Record<string, JsonValue>;
};

export type Project = Omit<
  ProjectDoc,
  "description" | "coverImage" | "keywords"
> & {
  description: {
    root: Omit<
      ProjectDoc["description"]["root"],
      "children | coverImage" | "keywords"
    > & {
      children: DescriptionNode[];
    };
  };
  coverImage?: { url: string; alt: string } | null;
  keywords: string[];
};
