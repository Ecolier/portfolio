import { forwardRef, type ReactNode, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useFluidTransition } from "@/hooks/useFluidTransition";

const FluidLink = forwardRef<
  HTMLAnchorElement,
  {
    to: string;
    children: ReactNode;
    className?: string;
  }
>(function FluidLink({ to, children, className }, ref) {
  const navigateWithTransition = useFluidTransition();

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    navigateWithTransition(to);
  }

  return (
    <Link ref={ref} to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
});

export default FluidLink;
