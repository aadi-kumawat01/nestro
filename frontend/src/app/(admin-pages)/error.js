"use client";

import ErrorState from "@/components/website/ui/ErrorState";

export default function AdminError({ error, retry, reset }) {
  return (
    <ErrorState
      retry={retry}
      reset={reset}
      homeHref="/admin"
      eyebrow="Administration interrupted"
      title="The workspace needs a moment"
      message={
        error?.digest
          ? `The requested admin view couldn’t load. Reference: ${error.digest}`
          : "The requested admin view couldn’t load. Please try again."
      }
    />
  );
}
