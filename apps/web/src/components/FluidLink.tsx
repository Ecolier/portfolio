import type { ReactNode, MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useFluidTransition } from "#/hooks/useFluidTransition";

export default function FluidLink({
  to,
  children,
  className,
  phase,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  phase?: number;
}) {
  const navigateWithTransition = useFluidTransition();

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    navigateWithTransition(to, phase);
  }

  return (
    <Link to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
