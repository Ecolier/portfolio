import type { SerializedLexicalNode } from "@payloadcms/richtext-lexical/lexical";
import type { Media, Project as ProjectDoc } from "@portfolio/types";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

type DescriptionNode = Omit<SerializedLexicalNode, "$"> & {
  $?: Record<string, JsonValue>;
};

type MediaSize = {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  filesize?: number | null;
  filename?: string | null;
};

export type NormalizedMedia = Media & {
  sizes?: Record<string, MediaSize | null | undefined> | null;
};

export type Project = Omit<
  ProjectDoc,
  "description" | "iconImage" | "detailImage" | "keywords"
> & {
  description: {
    root: Omit<
      ProjectDoc["description"]["root"],
      "children" | "iconImage" | "detailImage" | "keywords"
    > & {
      children: DescriptionNode[];
    };
  };
  iconImage?: NormalizedMedia | null;
  detailImage?: NormalizedMedia | null;
  keywords: string[];
};
