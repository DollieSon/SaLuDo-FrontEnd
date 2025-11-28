import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PersonalityTrait } from "../../types/profile";

interface PersonalityRadarChartProps {
  data: PersonalityTrait[];
}

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="tooltip-box">
        <strong>{data.trait}</strong>
        <ul>
          {data.breakdown.map((b: any, idx: number) => (
            <li key={idx}>
              <span className="trait-name">{b.sub}</span>
              <span className="trait-score">{b.score.toFixed(1)}</span>
            </li>
          ))}
        </ul>
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.5rem 0",
            borderTop: "1px solid rgba(226, 232, 240, 0.5)",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#64748b",
            fontWeight: "600",
          }}
        >
          Overall Score: {data.value.toFixed(1)}/10
        </div>
      </div>
    );
  }

  return null;
};

export const PersonalityRadarChart: React.FC<PersonalityRadarChartProps> = ({ data }) => {
  return (
    <div className="section radar-chart">
      <strong>Personality Traits Radar</strong>
      <div className="radar-chart-container">
        <div className="radar-chart-overlay"></div>
        <ResponsiveContainer width="100%" height={450}>
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="75%"
            data={data}
            margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
          >
            <PolarGrid
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="trait"
              tick={{
                fontSize: 11,
                fontWeight: 600,
                fill: "#475569",
                width: "100%",
              }}
              className="radar-axis-text"
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={{
                fontSize: 10,
                fill: "#64748b",
              }}
              tickFormatter={(tick) => tick.toFixed(1)}
              strokeOpacity={0.3}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#E30022"
              strokeWidth={3}
              fill="#E30022"
              fillOpacity={0.15}
              dot={{
                fill: "#E30022",
                strokeWidth: 2,
                stroke: "#ffffff",
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: "#E30022",
                stroke: "#ffffff",
                strokeWidth: 3,
                filter: "drop-shadow(0 2px 4px rgba(227, 0, 34, 0.4))",
              }}
            />
            <Tooltip
              content={<CustomRadarTooltip />}
              cursor={false}
              wrapperStyle={{
                outline: "none",
                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
