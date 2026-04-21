/* global React */
// A richer Hub-and-Spoke diagram: labeled spokes with specific modalities,
// directional flows to/from hub with labels, and hub arms shown as internal segments.

const { useState: useStateH, useMemo: useMemoH } = React;

// Illustrative spoke set — based on the archetypes in the brief (methods that
// capture protein dynamics). These are placeholders for the actual spokes.
const SPOKES = [
  { id: "cryoem",  short: "Cryo-EM",   full: "Cryo-EM heterogeneity", note: "Conformational ensembles from cryo-EM particle distributions" },
  { id: "xray",    short: "X-ray",     full: "Multi-temperature X-ray", note: "Alt-conformers & B-factor ensembles from crystallography" },
  { id: "nmr",     short: "NMR",       full: "Solution & solid-state NMR", note: "Dynamics on ps–ms timescales in solution" },
  { id: "hdxms",   short: "HDX-MS",    full: "Hydrogen–deuterium exchange", note: "Solvent accessibility & local flexibility" },
  { id: "smfret",  short: "smFRET",    full: "Single-molecule FRET", note: "Distance distributions & kinetics per molecule" },
  { id: "saxs",    short: "SAXS/SANS", full: "Small-angle scattering", note: "Ensemble shape in solution" },
  { id: "md",      short: "MD",        full: "Physics-based simulation", note: "Atomistic trajectories cross-validated against experiment" },
  { id: "xlms",    short: "XL-MS",     full: "Cross-linking MS", note: "Distance restraints across conformers" },
];

function TopologyView({ openDrawer }) {
  const R = window.ROADMAP;
  const [hover, setHover] = useStateH(null);
  const hubArms = R.arms.filter(a => a.kind === "hub");
  const spokeArm = R.arms.find(a => a.kind === "spoke");

  // Layout: 900x620 SVG. Hub is a rounded rectangle in the middle split into 3 arms.
  // 8 spokes ring around it with curved connectors.
  const W = 900, H = 620;
  const cx = W / 2, cy = H / 2;
  const hubW = 260, hubH = 170;
  const hubX = cx - hubW / 2, hubY = cy - hubH / 2;

  // spoke positions around hub
  const R_ = 260;
  const spokeNodes = SPOKES.map((s, i) => {
    const angle = (Math.PI * 2) * (i / SPOKES.length) - Math.PI / 2;
    const x = cx + Math.cos(angle) * R_;
    // squash vertical so it fits better
    const y = cy + Math.sin(angle) * (R_ * 0.68);
    return { ...s, x, y, angle };
  });

  // Hub arm segments (3 stacked bands inside hub rectangle)
  const armBands = [
    { id: "algo",  label: "Algorithms",     sub: "Ensemble modeling · prediction" },
    { id: "infra", label: "Dynamic PDB",    sub: "Standards · validation · search" },
    { id: "bio",   label: "Biology",        sub: "Binding · catalysis · allostery" },
  ];
  const bandH = (hubH - 30) / 3;

  // Compute nearest attachment point on hub rect for a spoke point
  function attach(sx, sy) {
    // Pick the hub edge midpoint closest horizontally
    let px = Math.max(hubX, Math.min(sx, hubX + hubW));
    let py = Math.max(hubY, Math.min(sy, hubY + hubH));
    // If inside, pick nearest side — shouldn't happen given R
    if (px > hubX && px < hubX + hubW && py > hubY && py < hubY + hubH) {
      // fallback
      px = sx < cx ? hubX : hubX + hubW;
    }
    return { px, py };
  }

  const isActive = (id) => hover === id;

  return (
    <div className="view">
      <div className="section-title">
        <h2>Hub-and-spoke topology · how the program integrates</h2>
        <div className="caption">Spokes send experimental data &amp; methods → Hub returns shared models, standards, and biology</div>
      </div>

      <div className="topo2-wrap">
        <div className="topo2-canvas">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{width:"100%", height:"auto", display:"block"}}>
            <defs>
              <marker id="arrow-in" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink)" />
              </marker>
              <marker id="arrow-out" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--mute)" />
              </marker>
              <pattern id="gridT" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(14,14,12,0.04)" strokeWidth="1"/>
              </pattern>
            </defs>

            <rect x="0" y="0" width={W} height={H} fill="url(#gridT)" />

            {/* Connectors: two parallel lines per spoke — data IN (solid) and tools OUT (dashed) */}
            {spokeNodes.map((s, i) => {
              const { px, py } = attach(s.x, s.y);
              const active = isActive(s.id) || hover === "spokes";
              // control points for smooth curves
              const mx1 = (s.x + px) / 2;
              const my1 = (s.y + py) / 2 - 18;
              const mx2 = (s.x + px) / 2;
              const my2 = (s.y + py) / 2 + 18;
              return (
                <g key={"c"+s.id} style={{opacity: active ? 1 : 0.55}}>
                  {/* data IN */}
                  <path
                    d={`M ${s.x} ${s.y} Q ${mx1} ${my1} ${px} ${py}`}
                    stroke="var(--ink)" strokeWidth={active ? 1.6 : 1} fill="none"
                    markerEnd="url(#arrow-in)"
                  />
                  {/* tools OUT */}
                  <path
                    d={`M ${px} ${py} Q ${mx2} ${my2} ${s.x} ${s.y}`}
                    stroke="var(--mute)" strokeWidth={active ? 1.2 : 0.8} fill="none"
                    strokeDasharray="4 3"
                    markerEnd="url(#arrow-out)"
                  />
                </g>
              );
            })}

            {/* Hub rectangle with 3 stacked arm bands */}
            <g onMouseEnter={() => setHover("hub")} onMouseLeave={() => setHover(null)}>
              <rect x={hubX} y={hubY} width={hubW} height={hubH}
                fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.5" rx="2"/>
              <text x={cx} y={hubY + 20} textAnchor="middle"
                fontSize="13" fontFamily="Inter Tight" fontWeight="600"
                letterSpacing="0.18em" fill="var(--ink)">HUB</text>
              <line x1={hubX+14} y1={hubY+26} x2={hubX+hubW-14} y2={hubY+26}
                stroke="var(--ink)" strokeWidth="0.5"/>

              {armBands.map((b, i) => {
                const by = hubY + 30 + i * bandH;
                const arm = hubArms.find(a => a.id === b.id);
                const active = isActive(b.id);
                return (
                  <g key={b.id}
                     onMouseEnter={(e) => { e.stopPropagation(); setHover(b.id); }}
                     onMouseLeave={() => setHover("hub")}
                     onClick={() => openDrawer({ kind: "arm", arm })}
                     style={{cursor:"pointer"}}
                  >
                    <rect x={hubX+6} y={by+4} width={hubW-12} height={bandH-6}
                      fill={active ? "var(--ink)" : "transparent"}
                      stroke="var(--rule)" strokeWidth="0.5"/>
                    <text x={cx} y={by + bandH/2 - 2} textAnchor="middle"
                      fontSize="14" fontFamily="Inter Tight" fontWeight="600"
                      fill={active ? "var(--bg)" : "var(--ink)"}>
                      {b.label}
                    </text>
                    <text x={cx} y={by + bandH/2 + 14} textAnchor="middle"
                      fontSize="10.5" fontFamily="Inter Tight"
                      fill={active ? "rgba(244,242,236,0.7)" : "var(--mute)"}>
                      {b.sub}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Spoke nodes */}
            {spokeNodes.map((s, i) => {
              const active = isActive(s.id) || hover === "spokes";
              // orient text based on position
              const labelY = s.angle < 0 ? s.y - 52 : s.y + 52;
              return (
                <g key={s.id}
                   onMouseEnter={() => setHover(s.id)}
                   onMouseLeave={() => setHover(null)}
                   onClick={() => openDrawer({ kind: "arm", arm: spokeArm, spokeHighlight: s })}
                   style={{cursor:"pointer"}}
                >
                  {/* spoke "moonshot" hex */}
                  <circle cx={s.x} cy={s.y} r="30"
                    fill={active ? "var(--ink)" : "var(--bg)"}
                    stroke="var(--ink)" strokeWidth="1.2"/>
                  <text x={s.x} y={s.y - 2} textAnchor="middle"
                    fontSize="12" fontFamily="Inter Tight" fontWeight="600"
                    fill={active ? "var(--bg)" : "var(--ink)"}>
                    {s.short}
                  </text>
                  <text x={s.x} y={s.y + 11} textAnchor="middle"
                    fontSize="8.5" fontFamily="JetBrains Mono"
                    letterSpacing="0.1em"
                    fill={active ? "rgba(244,242,236,0.7)" : "var(--mute)"}>
                    SPOKE · {String(i+1).padStart(2,"0")}
                  </text>
                  {/* subtitle floats near */}
                  <text x={s.x} y={labelY} textAnchor="middle"
                    fontSize="10" fontFamily="Inter Tight"
                    fill="var(--mute)">
                    {s.full}
                  </text>
                </g>
              );
            })}

            {/* Flow legend inside canvas */}
            <g transform={`translate(20, ${H - 80})`}>
              <text x="0" y="0" fontSize="10" fontFamily="JetBrains Mono"
                letterSpacing="0.14em" fill="var(--mute)">FLOWS</text>
              <line x1="0" y1="16" x2="50" y2="16" stroke="var(--ink)" strokeWidth="1.2"
                markerEnd="url(#arrow-in)"/>
              <text x="60" y="19" fontSize="10.5" fontFamily="Inter Tight" fill="var(--ink)">
                Spoke → Hub · experimental data, heterogeneity, new modalities
              </text>
              <line x1="0" y1="36" x2="50" y2="36" stroke="var(--mute)" strokeWidth="0.9"
                strokeDasharray="4 3" markerEnd="url(#arrow-out)"/>
              <text x="60" y="39" fontSize="10.5" fontFamily="Inter Tight" fill="var(--ink)">
                Hub → Spoke · shared algorithms, standards, validation, biology
              </text>
            </g>
          </svg>
        </div>

        <aside className="topo2-side">
          <div className="topo2-panel">
            <div className="topo2-k mono">Organizing principle</div>
            <p>
              The <strong>hub</strong> algorithmically integrates all spokes, coordinating representations, data standards, and
              models across techniques. Each <strong>spoke</strong> pursues one technical moonshot — a defined breakthrough in
              how a single method collects, processes, or extracts dynamic information.
            </p>
          </div>

          <div className="topo2-panel">
            <div className="topo2-k mono">Hub · 3 arms</div>
            {hubArms.map(arm => (
              <div
                key={arm.id}
                className={"topo2-arm" + (hover === arm.id ? " active" : "")}
                onMouseEnter={() => setHover(arm.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => openDrawer({ kind: "arm", arm })}
              >
                <div className="topo2-arm-name">{arm.name.replace("for Protein Dynamics","").replace("for Dynamic PDB","· Dynamic PDB")}</div>
                <div className="topo2-arm-role">{arm.role}</div>
              </div>
            ))}
          </div>

          <div className="topo2-panel">
            <div className="topo2-k mono">Spokes · illustrative</div>
            <div className="topo2-spokes">
              {SPOKES.map((s, i) => (
                <div
                  key={s.id}
                  className={"topo2-spoke" + (hover === s.id ? " active" : "")}
                  onMouseEnter={() => setHover(s.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => openDrawer({ kind: "arm", arm: spokeArm, spokeHighlight: s })}
                >
                  <div className="topo2-spoke-head">
                    <span className="mono">{String(i+1).padStart(2,"0")}</span>
                    <strong>{s.short}</strong>
                  </div>
                  <div className="topo2-spoke-note">{s.note}</div>
                </div>
              ))}
            </div>
            <div className="topo2-foot mono">Specific spoke selection is defined jointly by hub &amp; spoke leads.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

window.TopologyView2 = TopologyView;
