import themeScript from "@/scripts/theme.js?raw";
import { ScriptOnce } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";

export default function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <>
      <ScriptOnce children={themeScript} />
      {children}
    </>
  );
}
