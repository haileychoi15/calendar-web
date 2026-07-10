"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

function SuccessToastIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="size-4 shrink-0"
    >
      <circle cx="8" cy="8" r="8" fill="var(--green500)" />
      <path
        d="M4.75 8.25L7 10.5L11.25 5.75"
        stroke="var(--white)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const toastSurfaceStyle = {
  "--normal-bg": "var(--grey900)",
  "--normal-text": "var(--white)",
  "--normal-border": "transparent",
  "--success-bg": "var(--grey900)",
  "--success-text": "var(--white)",
  "--success-border": "transparent",
  "--info-bg": "var(--grey900)",
  "--info-text": "var(--white)",
  "--info-border": "transparent",
  "--warning-bg": "var(--grey900)",
  "--warning-text": "var(--white)",
  "--warning-border": "transparent",
  "--error-bg": "var(--grey900)",
  "--error-text": "var(--white)",
  "--error-border": "transparent",
  "--border-radius": "var(--radius-lg)",
} as React.CSSProperties

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      className="toaster group"
      icons={{
        success: <SuccessToastIcon />,
        info: <InfoIcon className="size-4 text-white" />,
        warning: <TriangleAlertIcon className="size-4 text-white" />,
        error: <OctagonXIcon className="size-4 text-white" />,
        loading: <Loader2Icon className="size-4 animate-spin text-white" />,
      }}
      style={toastSurfaceStyle}
      toastOptions={{
        classNames: {
          toast: "cn-toast border-transparent shadow-lg",
          title: "text-sm font-medium text-white",
          description: "text-sm font-medium text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
