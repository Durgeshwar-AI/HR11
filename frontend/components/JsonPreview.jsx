import { useState } from "react";
import { T } from "../theme/tokens";

/**
 * buildPayload
 * Converts the current pipeline + jobTitle into the backend JSON shape.
 *
 * @param {Array}  pipeline — ordered array of round objects
 * @param {string} jobTitle — job title entered by the user
 * @returns {object} payload ready to POST to /api/pipeline/create
 */
function buildPayload(pipeline, jobTitle) {
  return {
    job_title:        jobTitle || "Untitled Position",
    pipeline_version: "1.0",
    created_at:       new Date().toISOString(),
    total_rounds:     pipeline.length,
    rounds:           pipeline.map((r, i) => ({
      round_number:       i + 1,
      round_id:           r.id,
      label:              r.label,
      type:               r.tag,
      estimated_duration: r.duration,
      agents_involved:    r.agents,
    })),
  };
}

/**
 * highlightJson
 * Minimal regex-based syntax highlighting for JSON strings.
 * Returns an HTML string safe to use with dangerouslySetInnerHTML.
 */
function highlightJson(text) {
  return text
    .replace(
      /("([^"]+)"\s*:)/g,
      `<span style="color:${T.primary};font-weight:600">$1</span>`
    )
    .replace(
      /:\s*"([^"]*)"/g,
      `: <span style="color:${T.inkLight}">"$1"</span>`
    )
    .replace(
      /:\s*(\d+)/g,
      `: <span style="color:${T.secondary};font-weight:600">$1</span>`
    )
    .replace(
      /[{}\[\],]/g,
      `<span style="color:${T.inkFaint}">$&</span>`
    );
}

/**
 * JsonPreview
 * Shows the backend payload as syntax-highlighted JSON.
 * Includes a copy-to-clipboard button.
 *
 * @prop {Array}  pipeline — current ordered pipeline
 * @prop {string} jobTitle — job title entered by user
 */
export function JsonPreview({ pipeline, jobTitle }) {
  const [copied, setCopied] = useState(false);

  const payload = buildPayload(pipeline, jobTitle);
  const json    = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background:   T.surface,
        border:       `2px solid ${T.secondary}`,
        borderRadius: 0,
        overflow:     "hidden",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "10px 16px",
          borderBottom:   `2px solid ${T.secondary}`,
          background:     T.secondary,
        }}
      >
        <span
          style={{
            fontFamily:    T.fontDisplay,
            fontWeight:    800,
            fontSize:      13,
            color:         "#fff",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Backend Payload — pipeline.json
        </span>

        <button
          onClick={handleCopy}
          style={{
            background:    copied ? T.primary : "transparent",
            border:        `1px solid ${copied ? T.primary : "#fff5"}`,
            color:         "#fff",
            padding:       "4px 12px",
            fontSize:      11,
            fontFamily:    T.fontBody,
            fontWeight:    600,
            cursor:        "pointer",
            transition:    T.transColor,
            letterSpacing: "0.05em",
          }}
        >
          {copied ? "✓ COPIED!" : "COPY"}
        </button>
      </div>

      {/* Highlighted JSON body */}
      <pre
        dangerouslySetInnerHTML={{ __html: highlightJson(json) }}
        style={{
          padding:    "16px",
          fontFamily: T.fontMono,
          fontSize:   11,
          lineHeight: 1.75,
          overflow:   "auto",
          maxHeight:  340,
          color:      T.inkLight,
          background: T.surfaceAlt,
        }}
      />
    </div>
  );
}
