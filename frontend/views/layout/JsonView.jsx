import { T } from "../theme/tokens";
import { JsonPreview } from "../components/JsonPreview";

/**
 * JsonView
 * Renders the JSON tab.
 * Shows an empty-state prompt when the pipeline is empty,
 * otherwise renders the full JsonPreview panel.
 *
 * @prop {Array}  pipeline — current ordered pipeline
 * @prop {string} jobTitle — job title entered by user
 */
export function JsonView({ pipeline, jobTitle }) {
  if (pipeline.length === 0) {
    return (
      <div
        className="fade-up"
        style={{
          maxWidth: 740,
          marginTop: 28,
        }}
      >
        <div
          style={{
            border:    `2px dashed ${T.border}`,
            padding:   "56px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily:    T.fontDisplay,
              fontWeight:    900,
              fontSize:      22,
              color:         T.border,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Build a pipeline first
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fade-up"
      style={{ maxWidth: 740, marginTop: 28 }}
    >
      <JsonPreview pipeline={pipeline} jobTitle={jobTitle} />
    </div>
  );
}
