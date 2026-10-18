import { Shell } from "../shell";
import { StagesView } from "./view";

export default function StagesPage() {
  return (
    <Shell active="stages">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1>What Studiolo costs to run at each stage</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 900 }}>
          Narration is measured from 216 real explainer runs: about <strong>2,150 characters per explainer</strong>. ElevenLabs is billed pay as you go; Anthropic is shown after your
          $300/month credits. Prices are the vendors&apos; October 2026 list prices.
        </p>
      </div>
      <StagesView />
    </Shell>
  );
}
