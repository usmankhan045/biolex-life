"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "outline" | "ghost" | "accent";
export type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white border-2 border-primary " +
    "hover:opacity-90 active:opacity-80 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",

  outline:
    "bg-transparent text-primary border-2 border-primary " +
    "hover:bg-primary hover:text-white " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",

  ghost:
    "bg-transparent text-primary border-2 border-transparent " +
    "hover:bg-primary/10 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",

  // Lime accent carries INK text — white is invisible on the bright lime.
  accent:
    "bg-accent text-text border-2 border-text " +
    "hover:opacity-90 active:opacity-80 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text",
};

// Pill buttons — the "bold daylight" nav/CTA shape from the brand mockup.
const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm rounded-full",
  md: "px-6 py-2.5 text-base rounded-full",
  lg: "px-8 py-3.5 text-lg rounded-full",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "font-body font-semibold",
        "transition duration-150 cursor-pointer",
        "disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
