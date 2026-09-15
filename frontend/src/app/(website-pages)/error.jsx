"use client";
import ErrorState from "@/components/website/ui/ErrorState";
export default function WebsiteError({ error, retry, reset }) {
  return (
    <ErrorState
      retry={retry}
      reset={reset}
      message={
        error?.digest
          ? `Something interrupted this page. Reference: ${error.digest}`
          : undefined
      }
    />
  );
}
