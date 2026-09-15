"use client";
export default function GlobalError({ retry, reset }) {
  const action = retry || reset;
  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#f6f1ea",
          color: "#2b1b11",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
          }}
        >
          <section
            style={{
              maxWidth: 620,
              padding: "48px 32px",
              background: "white",
              border: "1px solid #dfd1c3",
              borderRadius: 32,
              textAlign: "center",
              boxShadow: "0 24px 80px rgba(66,42,25,.12)",
            }}
          >
            <p
              style={{
                letterSpacing: ".3em",
                textTransform: "uppercase",
                fontSize: 11,
                color: "#9a6944",
              }}
            >
              NESTRO
            </p>
            <h1 style={{ fontSize: "clamp(32px,7vw,52px)", margin: "16px 0" }}>
              We’ll have this polished shortly.
            </h1>
            <p style={{ lineHeight: 1.7, color: "#786454" }}>
              A temporary issue interrupted the experience. Please try once
              more.
            </p>
            <button
              onClick={() => action?.()}
              style={{
                marginTop: 24,
                border: 0,
                borderRadius: 999,
                padding: "13px 28px",
                background: "#2b1b11",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
