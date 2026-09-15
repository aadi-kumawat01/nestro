"use client";
import ErrorState from "@/components/website/ui/ErrorState";
export default function StoreError({ retry, reset }) {
  return (
    <ErrorState
      retry={retry}
      reset={reset}
      eyebrow="Collection unavailable"
      title="The showroom is taking a moment"
      message="We couldn’t bring in the furniture collection right now. Try again in a moment or return home."
    />
  );
}
