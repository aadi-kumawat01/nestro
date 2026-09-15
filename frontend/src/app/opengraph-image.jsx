import { ImageResponse } from "next/og";

export const alt = "Nestro Furniture — modern furniture for every room";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#1b1109",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          color: "#d49b67",
          fontSize: 24,
          letterSpacing: 10,
          textTransform: "uppercase",
        }}
      >
        Furniture for thoughtful homes
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 34,
          fontSize: 88,
          fontWeight: 700,
          letterSpacing: 12,
        }}
      >
        NESTRO<span style={{ color: "#c58b5c" }}>.</span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 26,
          maxWidth: 850,
          color: "#d8ccc2",
          fontSize: 36,
          lineHeight: 1.35,
        }}
      >
        Modern furniture for living, dining, bedroom and work spaces.
      </div>
    </div>,
    size,
  );
}
