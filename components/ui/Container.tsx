import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** "default" — 72rem max-width for most pages.
   *  "narrow"  — 48rem for reading-focused content (articles, legal pages).
   *  "wide"    — 90rem for dashboards or printable grids. */
  width?: "default" | "narrow" | "wide";
}

// "swc-read" marks reading-focused containers so the mobile text-centering rule
// in globals.css leaves their content left-aligned for legibility.
const widthClasses = {
  default: "max-w-5xl",
  narrow:  "max-w-3xl swc-read",
  wide:    "max-w-7xl",
};

export function Container({
  width = "default",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8",
        widthClasses[width],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
