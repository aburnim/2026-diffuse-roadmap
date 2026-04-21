/* global React */
// Reference-style horizontal timeline.
// One axis. Milestones alternate above/below and hang from the axis on thin vertical stems.
// Year labels float on the axis between milestone clusters.
// Arms are selectable via tabs above the timeline (one arm visible at a time, or "All").

const { useState: useStateRM, useMemo: useMemoRM } = React;

const RM_ARMS = [
  { id: "all",    label: "All arms",       kind: "meta"  },
  { id: "algo",   label: "Algorithms",     kind: "hub"   },
  { id: "infra",  label: "Dynamic PDB",    kind: "hub"   },
  { id: "bio",    label: "Biology",        kind: "hub"   },
  { id: "spokes", label: "Method Spokes",  kind: "spoke" },
];

// Horizon windows mapped to years
const YEAR_START = 2026;
const YEAR_END   = 2036;
const HZ_YEARS = { h2: [2026, 2028], h5: [2028, 2031], h10: [2031, 2036] };

function RoadmapTimelineView({ nsFilter, horizonFilter, openDrawer }) {
  const R = window.ROADMAP;
  const [armFilter, setArmFilter] = useStateRM(() => localStorage.getItem("diffuse-arm") || "all");

  React.useEffect(() => { localStorage.setItem("diffuse-arm", armFilter); }, [armFilter]);

  // Build a flat list of events w/ assigned year and lane side.
  // For each horizon, distribute its milestones across its year range (inclusive of start, exclusive of end for next).
  const events = useMemoRM(() => {
    const chosenArms = armFilter === "all"
      ? R.arms
      : R.arms.filter(a => a.id === armFilter);

    const all = [];
    chosenArms.forEach(arm => {
      ["h2","h5","h10"].forEach(hzId => {
        if (horizonFilter !== "all" && horizonFilter !== hzId) return;
        const [ys, ye] = HZ_YEARS[hzId];
        const mls = arm.milestones[hzId] || [];
        mls.forEach((m, i) => {
          const span = ye - ys;
          // Distribute evenly across horizon span (floating years).
          const frac = mls.length === 1 ? 0.5 : (i + 0.5) / mls.length;
          const year = ys + span * frac;
          all.push({ arm, hzId, m, year });
        });
      });
    });
    // sort by year
    all.sort((a, b) => a.year - b.year);
    // assign above/below alternation, and stack tier if colliding
    // Compute x later in render once we know width. Side assignment is a simple alternation.
    let toggle = 0;
    all.forEach((e, i) => {
      e.side = toggle % 2 === 0 ? "up" : "down";
      toggle++;
    });
    return all;
  }, [armFilter, horizonFilter]);

  // ---- layout constants ----
  const W = 1600;
  const PAD_L = 60;
  const PAD_R = 60;
  const trackW = W - PAD_L - PAD_R;
  const yearsSpan = YEAR_END - YEAR_START;
  const xAt = (year) => PAD_L + ((year - YEAR_START) / yearsSpan) * trackW;

  // Decide card size and vertical layout.
  const CARD_W = 220;
  const CARD_H = 94;
  const STEM_MIN = 54;
  const STEM_STEP = 90; // extra stem length per collision tier
  const AXIS_Y = 360;

  // Collision avoidance: greedy per-side placement based on x proximity.
  const placed = { up: [], down: [] };
  events.forEach(ev => {
    const x = xAt(ev.year);
    const side = ev.side;
    // find tier where no prior placed card on same side overlaps horizontally
    let tier = 0;
    while (true) {
      const conflict = placed[side].some(p =>
        p.tier === tier && Math.abs(p.x - x) < CARD_W + 20
      );
      if (!conflict) break;
      tier++;
      if (tier > 3) break;
    }
    ev.tier = tier;
    ev.x = x;
    placed[side].push({ x, tier });
  });

  const maxUpTier = placed.up.reduce((m, p) => Math.max(m, p.tier), 0);
  const maxDownTier = placed.down.reduce((m, p) => Math.max(m, p.tier), 0);
  const topH  = STEM_MIN + CARD_H + maxUpTier * STEM_STEP + 60;
  const botH  = STEM_MIN + CARD_H + maxDownTier * STEM_STEP + 30;
  const axisY = topH;
  // +80 below for year labels + caption (horizon title is now at the top)
  const H = topH + botH + 80;

  // Year ticks (integer years)
  const yearTicks = [];
  for (let y = YEAR_START; y <= YEAR_END; y++) yearTicks.push(y);

  const [hover, setHover] = useStateRM(null);

  return (
    <div className="view">
      <div className="section-title">
        <h2>Roadmap · {YEAR_START} → {YEAR_END}</h2>
        <div className="caption">Hover or tap a milestone for detail</div>
      </div>

      {/* Arm filter tabs */}
      <div className="rm3-armbar">
        <div className="rm3-k mono">Arm</div>
        {RM_ARMS.map(a => (
          <button
            key={a.id}
            className="chip"
            aria-pressed={armFilter === a.id ? "true" : "false"}
            onClick={() => setArmFilter(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="rm3-scroll">
        <svg
          className="rm3-svg"
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          preserveAspectRatio="xMinYMid meet"
        >
          <defs>
            <marker id="rm3-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink)" />
            </marker>
          </defs>

          {/* Horizon band shading (chapter title sits above the axis, out of the card zone) */}
          {["h2","h5","h10"].map((hz, i) => {
            const [ys, ye] = HZ_YEARS[hz];
            const x1 = xAt(ys), x2 = xAt(ye);
            const dim = horizonFilter !== "all" && horizonFilter !== hz;
            return (
              <g key={hz} opacity={dim ? 0.3 : 1}>
                <rect
                  x={x1} y={0} width={x2 - x1} height={H}
                  fill={i % 2 === 0 ? "rgba(14,14,12,0.025)" : "transparent"}
                />
              </g>
            );
          })}

          {/* horizon dividers */}
          {[2028, 2031].map(y => (
            <line key={y} x1={xAt(y)} y1={34} x2={xAt(y)} y2={H - 30}
              stroke="var(--rule)" strokeDasharray="3 5" strokeWidth="1" />
          ))}

          {/* Axis line */}
          <line x1={PAD_L - 20} y1={axisY} x2={W - PAD_R + 20} y2={axisY}
            stroke="var(--ink)" strokeWidth="1.3" markerEnd="url(#rm3-arrow)" />

          {/* Year labels on axis (large, greyed where no milestone sits close) */}
          {yearTicks.map(y => {
            const isMilestoneYear = events.some(ev => Math.abs(ev.year - y) < 0.5);
            // big decade markers
            const isAnchor = [2026, 2028, 2031, 2036].includes(y);
            const fs = isAnchor ? 28 : 16;
            const color = isAnchor ? "var(--ink)" : "var(--mute-2)";
            const fw = isAnchor ? 600 : 400;
            // small tick mark
            return (
              <g key={y}>
                <line x1={xAt(y)} y1={axisY - 5} x2={xAt(y)} y2={axisY + 5}
                  stroke={isAnchor ? "var(--ink)" : "var(--rule)"}
                  strokeWidth={isAnchor ? 1.2 : 0.8} />
                {isAnchor && (
                  <text
                    x={xAt(y)}
                    y={axisY + 34}
                    textAnchor="middle"
                    fontSize={fs}
                    fontFamily="Inter Tight"
                    fontWeight={fw}
                    letterSpacing="-0.01em"
                    fill={color}
                  >
                    {y}
                  </text>
                )}
              </g>
            );
          })}

          {/* Program-level horizon chapter labels at the TOP of the section (above all milestone cards) */}
          {["h2","h5","h10"].map(hz => {
            const [ys, ye] = HZ_YEARS[hz];
            const x = (xAt(ys) + xAt(ye)) / 2;
            const kicker = hz === "h2" ? "2-YEAR"
              : hz === "h5" ? "5-YEAR"
              : "10-YEAR";
            const caption = hz === "h2" ? "Foundation & Proof-of-Concept"
              : hz === "h5" ? "Integration & Impact"
              : "Transformation & Paradigm Shift";
            return (
              <g key={hz}>
                <text x={x} y={18}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  letterSpacing="0.16em"
                  fill="var(--mute-2)">
                  {kicker} · HORIZON
                </text>
                <text x={x} y={36}
                  textAnchor="middle"
                  fontSize="12"
                  fontFamily="Inter Tight"
                  fontWeight="500"
                  fill="var(--mute)">
                  {caption}
                </text>
              </g>
            );
          })}

          {/* Milestones */}
          {events.map((ev, idx) => {
            const dim = nsFilter && !ev.m.ns.includes(nsFilter);
            const hovered = hover === idx;
            const side = ev.side;
            const stemLen = STEM_MIN + ev.tier * STEM_STEP;
            const dotY = side === "up" ? axisY - stemLen : axisY + stemLen;
            const cardY = side === "up"
              ? dotY - CARD_H - 12
              : dotY + 12;
            const x = ev.x;

            return (
              <g
                key={idx}
                opacity={dim ? 0.22 : 1}
                style={{cursor:"pointer"}}
                onMouseEnter={() => setHover(idx)}
                onMouseLeave={() => setHover(null)}
                onClick={() => openDrawer({
                  kind: "milestone",
                  arm: ev.arm,
                  horizon: R.horizons.find(h => h.id === ev.hzId),
                  m: ev.m,
                })}
              >
                {/* stem */}
                <line
                  x1={x} y1={axisY}
                  x2={x} y2={dotY}
                  stroke={hovered ? "var(--ink)" : "var(--mute)"}
                  strokeWidth={hovered ? 1.2 : 0.8}
                />
                {/* axis anchor dot */}
                <circle cx={x} cy={axisY} r="3.5"
                  fill="var(--ink)" />
                {/* milestone dot */}
                <circle cx={x} cy={dotY} r="8"
                  fill={hovered ? "var(--bg)" : "var(--ink)"}
                  stroke="var(--ink)" strokeWidth="1.5" />
                {/* arm tag above/below dot (always nearest to axis) */}
                <text
                  x={x + 14}
                  y={dotY + 4}
                  fontSize="9.5"
                  fontFamily="JetBrains Mono"
                  letterSpacing="0.12em"
                  fill="var(--mute)"
                >
                  {armShort(ev.arm)}
                </text>

                {/* card */}
                <foreignObject
                  x={x - CARD_W / 2}
                  y={cardY}
                  width={CARD_W}
                  height={CARD_H}
                >
                  <div xmlns="http://www.w3.org/1999/xhtml"
                    className={"rm3-card" + (hovered ? " hovered" : "")}
                  >
                    <div className="rm3-card-head">
                      <span className="mono">
                        {Math.round(ev.year)} · {ev.hzId.toUpperCase()}
                      </span>
                    </div>
                    <div className="rm3-card-text">{ev.m.t}</div>
                    <div className="rm3-card-ns">
                      {ev.m.ns.map(n => (
                        <span key={n} data-ns={n} className="ns-pill">{n}</span>
                      ))}
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rm3-legend">
        <div className="rm3-legend-item"><span className="rm2-dot"/> Milestone · hover or click for detail</div>
        <div className="rm3-legend-item"><span className="rm3-stem"/> Anchored to its year on the axis</div>
        <div className="rm3-legend-item mono" style={{color:"var(--mute)"}}>
          Showing {events.length} milestone{events.length === 1 ? "" : "s"}
          {armFilter !== "all" && <> · arm: {RM_ARMS.find(a => a.id === armFilter).label}</>}
          {horizonFilter !== "all" && <> · horizon: {horizonFilter}</>}
        </div>
      </div>
    </div>
  );
}

function armShort(arm) {
  if (arm.kind === "spoke") return "SPOKES";
  if (arm.id === "algo")    return "ALGO";
  if (arm.id === "infra")   return "INFRA";
  if (arm.id === "bio")     return "BIO";
  return "";
}

window.RoadmapTimelineView = RoadmapTimelineView;
