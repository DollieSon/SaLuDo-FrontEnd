import {
  QualityBand,
  QUALITY_BAND_COLORS,
  QUALITY_BAND_DESCRIPTIONS,
} from "../../types/aiTrends";
import type { QualityScore } from "../../types/aiTrends";

interface QualityScoreCardProps {
  qualityScore: QualityScore;
  title?: string;
}

export const QualityScoreCard = ({
  qualityScore,
  title = "Overall Quality",
}: QualityScoreCardProps) => {
  const { score, band, avgEditPercentage, feedbackCount } = qualityScore;
  const color = QUALITY_BAND_COLORS[band];
  const description = QUALITY_BAND_DESCRIPTIONS[band];

  return (
    <div
      className="metric-card quality-score-card"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <p className="label">{title}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
        <h3 className="value" style={{ margin: 0, color }}>
          {score.toFixed(0)}
        </h3>
        <span
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color,
            padding: "0.25rem 0.75rem",
            backgroundColor: `${color}15`,
            borderRadius: "12px",
          }}
        >
          {band}
        </span>
      </div>
      <div className="subtext" style={{ marginTop: "0.75rem" }}>
        <div>{description}</div>
        <div style={{ marginTop: "0.5rem" }}>
          <span>Avg Edit: {avgEditPercentage.toFixed(1)}%</span>
          <span style={{ marginLeft: "1rem" }}>
            Feedback: {feedbackCount}
          </span>
        </div>
      </div>
    </div>
  );
};
