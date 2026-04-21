/* global React */
const { useState, useEffect, useMemo, useRef } = React;

// ---------- North Star header ----------
function NorthStar() {
  const R = window.ROADMAP;
  return (
    <header className="top-wrap">
      <div className="top">
        <div>
          <div className="brand">
            <div className="brand-mark">diffUSE</div>
            <div className="brand-kicker">Program Roadmap · v1 · 2026 → 2036</div>
          </div>
          <p className="mission">
            Make dynamic structural biology as routine and more impactful than static structural biology.
            From <em>snapshots</em> to <em>ensembles</em>. From <em>what molecules look like</em> to <em>how they move</em>.
          </p>
        </div>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--mute)", textAlign: "right", lineHeight: 1.7 }}>
          Hub × 4 Arms<br />
          Spokes × N Moonshots<br />
          Horizons · 2 / 5 / 10 yr
        </div>
      </div>
      <div className="meta-row">
        {R.northStars.map((n, i) =>
        <div className="meta-cell" key={n.id}>
            <div className="k">{String(i + 1).padStart(2, "0")} · North Star</div>
            <div className="v"><strong>{n.label}.</strong> {n.desc}</div>
          </div>
        )}
      </div>
    </header>);

}

// ---------- Nav ----------
function Nav({ view, setView, horizonFilter, setHorizonFilter }) {
  const tabs = [
  { id: "timeline", label: "Timeline" },
  { id: "objectives", label: "By Objective" },
  { id: "topology", label: "Hub & Spokes" },
  { id: "risks", label: "Risks & Pitfalls" }];

  const horizons = [
  { id: "all", label: "All" },
  { id: "h2", label: "2-yr" },
  { id: "h5", label: "5-yr" },
  { id: "h10", label: "10-yr" }];

  return (
    <nav className="nav" role="tablist">
      {tabs.map((t, i) =>
      <button
        key={t.id}
        className="tab"
        role="tab"
        aria-current={view === t.id ? "true" : "false"}
        onClick={() => setView(t.id)}>
        
          <span className="num">{String(i + 1).padStart(2, "0")}</span>{t.label}
        </button>
      )}
      <div className="spacer" />
      {view === "timeline" &&
      <div className="filter">
          <div className="filter-label mono">Horizon</div>
          {horizons.map((h) =>
        <button
          key={h.id}
          className="chip"
          aria-pressed={horizonFilter === h.id ? "true" : "false"}
          onClick={() => setHorizonFilter(h.id)}>
          {h.label}</button>
        )}
        </div>
      }
    </nav>);

}

// ---------- Milestone ----------
function Milestone({ m, nsFilter, onClick }) {
  const dim = nsFilter && !m.ns.includes(nsFilter);
  return (
    <div className={"milestone" + (dim ? " dim" : "")} onClick={onClick}>
      <span className="dot" />
      <div>
        <div>{m.t}</div>
        <div className="ns-row">
          {m.ns.map((n) => <span data-ns={n} key={n} className="ns-pill">{n}</span>)}
        </div>
      </div>
    </div>);

}

// ---------- Timeline view ----------
function TimelineView({ horizonFilter, nsFilter, openDrawer }) {
  const R = window.ROADMAP;
  const horizons = horizonFilter === "all" ?
  R.horizons :
  R.horizons.filter((h) => h.id === horizonFilter);
  return (
    <div className="view">
      <div className="section-title">
        <h2>Program timeline by workstream</h2>
        <div className="caption">Rows = arms · Columns = horizons · Tags = north-star contribution</div>
      </div>

      {/* Program-level goals band */}
      <div className="tl-grid" style={{ marginBottom: 24 }}>
        <div className="tl-head">
          <div>&nbsp;</div>
          {horizons.map((h) =>
          <div className="hz" key={h.id}><strong>{h.label}</strong><span>{h.caption}</span></div>
          )}
        </div>
        <div className="tl-row">
          <div className="lane-label">
            <div className="tag mono">Program</div>
            <div className="name">North-star outcomes</div>
            <div className="role">The executive read: what "done" looks like at each horizon, across the whole program.</div>
          </div>
          {horizons.map((h) =>
          <div className="cell" key={h.id}>
              <div className="prog"><span>Program goals</span><span className="n">{R.programGoals[h.id].length}</span></div>
              {R.programGoals[h.id].map((g, i) =>
            <div className="milestone" key={i} style={{ cursor: "default" }}>
                  <span className="dot" />
                  <div>{g}</div>
                </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Arms */}
      <div className="tl-grid">
        <div className="tl-head">
          <div>&nbsp;</div>
          {horizons.map((h) =>
          <div className="hz" key={h.id}><strong>{h.label}</strong><span>{h.caption}</span></div>
          )}
        </div>
        {R.arms.map((arm) =>
        <div className="tl-row" key={arm.id}>
            <div className="lane-label">
              <div className="tag mono">{arm.kind === "hub" ? "Hub · Arm" : "Spokes"}</div>
              <div className="name">{arm.name}</div>
              <div className="role">{arm.role}</div>
            </div>
            {horizons.map((h) => {
            const mls = arm.milestones[h.id] || [];
            return (
              <div className="cell" key={h.id}>
                  <div className="prog">
                    <span>Milestones</span>
                    <span className="n">{mls.length.toString().padStart(2, "0")}</span>
                  </div>
                  {mls.map((m, i) =>
                <Milestone
                  key={i}
                  m={m}
                  nsFilter={nsFilter}
                  onClick={() => openDrawer({ kind: "milestone", arm, horizon: h, m })} />

                )}
                </div>);

          })}
          </div>
        )}
      </div>
    </div>);

}

// ---------- Objectives view ----------
function ObjectivesView({ openDrawer }) {
  const R = window.ROADMAP;
  // For each north-star, collect milestones across arms/horizons whose ns tags include it.
  const byNs = useMemo(() => {
    const map = {};
    R.northStars.forEach((n) => map[n.id] = { h2: [], h5: [], h10: [] });
    R.arms.forEach((arm) => {
      R.horizons.forEach((h) => {
        (arm.milestones[h.id] || []).forEach((m) => {
          m.ns.forEach((tag) => {
            if (map[tag]) map[tag][h.id].push({ m, arm });
          });
        });
      });
    });
    return map;
  }, []);

  return (
    <div className="view">
      <div className="section-title">
        <h2>Milestones mapped to the four core objectives</h2>
        <div className="caption">Each column is a north star · Rows cluster by horizon</div>
      </div>
      <div className="obj-wrap">
        {R.northStars.map((n, i) =>
        <div className="obj-col" key={n.id}>
            <div className="obj-head">
              <div className="n">{String(i + 1).padStart(2, "0")} / 04</div>
              <h3>{n.label}.</h3>
              <p>{n.desc}</p>
            </div>
            {R.horizons.map((h) =>
          <div className="obj-horizon" key={h.id}>
                <div className="h"><strong>{h.label}</strong><span>{byNs[n.id][h.id].length} items</span></div>
                {byNs[n.id][h.id].length === 0 &&
            <div className="obj-item" style={{ color: "var(--mute-2)" }}>—</div>
            }
                {byNs[n.id][h.id].map((x, idx) =>
            <div className="obj-item" key={idx} onClick={() => openDrawer({ kind: "milestone", arm: x.arm, horizon: h, m: x.m })} style={{ cursor: "pointer" }}>
                    {x.m.t}
                    <span className="src">{x.arm.kind === "hub" ? "Hub" : "Spoke"} · {shortArm(x.arm.name)}</span>
                  </div>
            )}
              </div>
          )}
          </div>
        )}
      </div>
    </div>);

}

function shortArm(n) {
  if (n.includes("Algorithmic")) return "Algorithms";
  if (n.includes("Infrastructure")) return "Dynamic PDB";
  if (n.includes("Biological")) return "Biology";
  if (n.includes("Moonshot") || n.includes("Spoke")) return "Method spokes";
  return n;
}

// ---------- Topology view ----------
function TopologyView({ openDrawer }) {
  const R = window.ROADMAP;
  const [hover, setHover] = useState(null);
  const hubArms = R.arms.filter((a) => a.kind === "hub");
  const spokes = R.arms.find((a) => a.kind === "spoke");

  // node positions on the SVG (0..100)
  const cx = 50,cy = 50;
  const hubPositions = {
    algo: { x: 26, y: 28, label: "Algorithms" },
    infra: { x: 74, y: 28, label: "Dynamic PDB" },
    bio: { x: 50, y: 78, label: "Biology" }
  };
  const spokePositions = [
  { x: 10, y: 10 }, { x: 50, y: 6 }, { x: 90, y: 10 },
  { x: 6, y: 50 }, { x: 94, y: 50 },
  { x: 10, y: 90 }, { x: 50, y: 94 }, { x: 90, y: 90 }];


  return (
    <div className="view">
      <div className="section-title">
        <h2>Hub-and-spoke topology</h2>
        <div className="caption">Hub integrates · Spokes moonshot · Biology anchors</div>
      </div>
      <div className="topo-wrap">
        <div className="topo-canvas">
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(14,14,12,0.04)" strokeWidth="0.2" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#grid)" />

            {/* connections spoke -> hub center */}
            {spokePositions.map((s, i) =>
            <line key={"s" + i}
            x1={s.x} y1={s.y} x2={cx} y2={cy}
            stroke="rgba(14,14,12,0.35)" strokeWidth="0.25"
            strokeDasharray="0.8 0.6" />

            )}

            {/* connections hub-arm -> center */}
            {Object.values(hubPositions).map((h, i) =>
            <line key={"h" + i} x1={h.x} y1={h.y} x2={cx} y2={cy}
            stroke="var(--ink)" strokeWidth="0.35" />
            )}

            {/* hub core circle */}
            <circle cx={cx} cy={cy} r="7" fill="var(--bg)" stroke="var(--ink)" strokeWidth="0.5" />
            <text x={cx} y={cy - 1} textAnchor="middle" fontSize="2.4" fontFamily="Inter Tight" fontWeight="600" fill="var(--ink)">HUB</text>
            <text x={cx} y={cy + 2.3} textAnchor="middle" fontSize="1.6" fontFamily="JetBrains Mono" fill="var(--mute)">integration</text>

            {/* hub-arm nodes */}
            {hubArms.map((arm) => {
              const p = hubPositions[arm.id];
              const active = hover === arm.id;
              return (
                <g key={arm.id}
                onMouseEnter={() => setHover(arm.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => openDrawer({ kind: "arm", arm })}
                style={{ cursor: "pointer" }}>
                  
                  <rect x={p.x - 10} y={p.y - 3} width="20" height="6"
                  fill={active ? "var(--ink)" : "var(--bg)"}
                  stroke="var(--ink)" strokeWidth="0.4" />
                  <text x={p.x} y={p.y + 0.7} textAnchor="middle"
                  fontSize="2.2" fontFamily="Inter Tight" fontWeight="600"
                  fill={active ? "var(--bg)" : "var(--ink)"}>
                    {p.label}
                  </text>
                </g>);

            })}

            {/* spoke nodes */}
            {spokePositions.map((s, i) =>
            <g key={"sp" + i}
            onMouseEnter={() => setHover("spokes")}
            onMouseLeave={() => setHover(null)}
            onClick={() => openDrawer({ kind: "arm", arm: spokes })}
            style={{ cursor: "pointer" }}>
              
                <circle cx={s.x} cy={s.y} r="2.2"
              fill={hover === "spokes" ? "var(--ink)" : "var(--bg)"}
              stroke="var(--ink)" strokeWidth="0.4" />
                <text x={s.x} y={s.y + 0.7} textAnchor="middle"
              fontSize="1.6" fontFamily="JetBrains Mono"
              fill={hover === "spokes" ? "var(--bg)" : "var(--ink)"}>
                  S{String(i + 1).padStart(2, "0")}
                </text>
              </g>
            )}

            {/* corner legend */}
            <text x="2" y="98" fontSize="1.6" fontFamily="JetBrains Mono" fill="var(--mute)" letterSpacing="0.1">
              HUB · ARMS ─── CENTER   SPOKES ···· HUB
            </text>
          </svg>
        </div>

        <div className="topo-legend">
          <h3>Structure</h3>
          <p className="lead">
            A central <strong>hub</strong> of three coordinated arms keeps the program grounded in biology and integrates the spokes algorithmically.
            Each <strong>spoke</strong> is a technical moonshot: a step-change in how a method collects, processes, or extracts dynamic information.
          </p>

          {R.arms.map((arm) =>
          <div key={arm.id}
          className={"topo-arm" + (hover === arm.id || hover === "spokes" && arm.kind === "spoke" ? " active" : "")}
          onMouseEnter={() => setHover(arm.kind === "spoke" ? "spokes" : arm.id)}
          onMouseLeave={() => setHover(null)}
          onClick={() => openDrawer({ kind: "arm", arm })}>
            
              <div className="row">
                <div className="tag">{arm.kind === "hub" ? "Hub · Arm" : "Spokes · Moonshots"}</div>
                <div className="count mono" style={{ fontSize: 10, color: "var(--mute)" }}>{arm.milestones.h2.length + arm.milestones.h5.length + arm.milestones.h10.length} milestones</div>
              </div>
              <div className="nm">{arm.name}</div>
              <div className="rl">{arm.role}</div>
            </div>
          )}

          <div style={{ marginTop: 20, fontSize: 11, color: "var(--mute)", lineHeight: 1.55 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--mute)", marginBottom: 6 }}>Four guiding questions</div>
            <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.55 }}>
              {R.questions.map((q, i) => <li key={i} style={{ marginBottom: 4 }}>{q}</li>)}
            </ol>
          </div>
        </div>
      </div>
    </div>);

}

// ---------- Risks view ----------
function RisksView() {
  const R = window.ROADMAP;
  return (
    <div className="view">
      <div className="section-title">
        <h2>Risks, pitfalls, and mitigations</h2>
        <div className="caption">Program-wide + per-arm</div>
      </div>
      <div className="risk-wrap">
        <div className="risk-section">
          <h3>Program-wide</h3>
          <div className="risk-table">
            <div className="th">#</div>
            <div className="th">Risk</div>
            <div className="th">Mitigation</div>
            {R.programPitfalls.map((p, i) =>
            <React.Fragment key={i}>
                <div className="td n">{String(i + 1).padStart(2, "0")}</div>
                <div className="td r">{p.risk}</div>
                <div className="td m">{p.mitigation}</div>
              </React.Fragment>
            )}
          </div>
        </div>

        {R.arms.map((arm) =>
        <div className="risk-section" key={arm.id}>
            <h3>{arm.name}</h3>
            <div className="risk-table">
              <div className="th">#</div>
              <div className="th">Risk</div>
              <div className="th">Mitigation / note</div>
              {arm.pitfalls.map((p, i) => {
              const parts = p.split("→").map((s) => s.trim());
              return (
                <React.Fragment key={i}>
                    <div className="td n">{String(i + 1).padStart(2, "0")}</div>
                    <div className="td r">{parts[0]}</div>
                    <div className="td m">{parts[1] || "—"}</div>
                  </React.Fragment>);

            })}
            </div>
          </div>
        )}
      </div>
    </div>);

}

// ---------- Drawer ----------
function Drawer({ payload, onClose }) {
  const open = !!payload;
  return (
    <>
      <div className={"drawer-bg" + (open ? " open" : "")} onClick={onClose}></div>
      <aside className={"drawer" + (open ? " open" : "")} aria-hidden={!open}>
        {payload &&
        <>
            <button className="drawer-close" onClick={onClose}>← Close</button>
            {payload.kind === "milestone" &&
          <>
                <div className="d-sub">{payload.horizon.label} · {payload.arm.kind === "hub" ? "Hub · " : "Spoke · "}{shortArm(payload.arm.name)}</div>
                <h3>{payload.m.t}</h3>
                <div className="d-block">
                  <h4>North-star contribution</h4>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {payload.m.ns.map((n) =>
                <span key={n} data-ns={n} className="ns-pill">{n}</span>
                )}
                  </div>
                </div>
                <div className="d-block">
                  <h4>Arm context</h4>
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--mute)", lineHeight: 1.5 }}>{payload.arm.role}</p>
                </div>
                <div className="d-block">
                  <h4>Arm goals</h4>
                  <ul className="d-list">
                    {payload.arm.goals.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              </>
          }
            {payload.kind === "arm" &&
          <>
                <div className="d-sub">{payload.arm.kind === "hub" ? "Hub · Arm" : "Spokes · Method moonshots"}</div>
                <h3>{payload.arm.name}</h3>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{payload.arm.role}</p>
                <div className="d-block">
                  <h4>Goals</h4>
                  <ul className="d-list">
                    {payload.arm.goals.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
                {["h2", "h5", "h10"].map((hid) => {
              const h = window.ROADMAP.horizons.find((x) => x.id === hid);
              const mls = payload.arm.milestones[hid] || [];
              return (
                <div className="d-block" key={hid}>
                      <h4>{h.label} · {h.caption}</h4>
                      <ul className="d-list">
                        {mls.map((m, i) =>
                    <li key={i}>
                            {m.t}
                            <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {m.ns.map((n) => <span key={n} data-ns={n} className="ns-pill">{n}</span>)}
                            </div>
                          </li>
                    )}
                      </ul>
                    </div>);

            })}
                <div className="d-block">
                  <h4>Pitfalls</h4>
                  <ul className="d-list">
                    {payload.arm.pitfalls.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              </>
          }
          </>
        }
      </aside>
    </>);

}

// ---------- App ----------
function App() {
  const [view, setView] = useState(() => localStorage.getItem("diffuse-view") || "timeline");
  const [horizonFilter, setHorizonFilter] = useState(() => localStorage.getItem("diffuse-hz") || "all");
  const [nsFilter, setNsFilter] = useState(() => localStorage.getItem("diffuse-ns") || null);
  const [drawer, setDrawer] = useState(null);
  // tweaks
  const [tweaksOn, setTweaksOn] = useState(false);
  const [density, setDensity] = useState(() => localStorage.getItem("diffuse-density") || "comfortable");

  useEffect(() => {localStorage.setItem("diffuse-view", view);}, [view]);
  useEffect(() => {localStorage.setItem("diffuse-hz", horizonFilter);}, [horizonFilter]);
  useEffect(() => {localStorage.setItem("diffuse-ns", nsFilter || "");}, [nsFilter]);
  useEffect(() => {localStorage.setItem("diffuse-density", density);}, [density]);

  // Tweak mode wiring
  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setTweaksOn(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOn(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--row-pad", density === "compact" ? "8px" : "14px"
    );
    document.body.style.fontSize = density === "compact" ? "13px" : "14px";
  }, [density]);

  // Esc closes drawer
  useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") setDrawer(null);};
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const R = window.ROADMAP;

  return (
    <div className="app" data-screen-label="01 Roadmap">
      <NorthStar />
      <Nav view={view} setView={setView} horizonFilter={horizonFilter} setHorizonFilter={setHorizonFilter} />

      {/* North-star filter available on timeline & objectives */}
      {view === "timeline" &&
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 11, color: "var(--mute)", letterSpacing: "0.08em", textTransform: "uppercase", flexWrap: "wrap" }}>
          <div className="mono" style={{ marginRight: 6 }}>Highlight north star</div>
          {R.northStars.map((n) =>
        <button
          key={n.id}
          data-ns={n.id}
          className="chip ns-chip"
          aria-pressed={nsFilter === n.id ? "true" : "false"}
          onClick={() => setNsFilter(nsFilter === n.id ? null : n.id)}>
          {n.label}</button>
        )}
          {nsFilter &&
        <button className="chip" onClick={() => setNsFilter(null)} aria-pressed="false">Clear</button>
        }
        </div>
      }

      {view === "timeline" && React.createElement(window.RoadmapTimelineView, { horizonFilter, nsFilter, openDrawer: setDrawer })}
      {view === "objectives" && <ObjectivesView openDrawer={setDrawer} />}
      {view === "topology" && React.createElement(window.TopologyView2, { openDrawer: setDrawer })}
      {view === "risks" && <RisksView />}

      <footer className="foot">
        <div>diffUSE · Dynamic Structural Biology</div>
        <div>From snapshots to ensembles</div>
        <div className="mono">v1 · {new Date().toISOString().slice(0, 10)}</div>
      </footer>

      <Drawer payload={drawer} onClose={() => setDrawer(null)} />

      {tweaksOn &&
      <div style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 60,
        background: "var(--bg)", border: "1px solid var(--ink)",
        padding: "14px 16px", width: 260, fontSize: 12
      }}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--mute)", marginBottom: 10 }}>Tweaks</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 4, color: "var(--mute)" }}>Density</div>
            <div style={{ display: "flex" }}>
              {["compact", "comfortable"].map((d) =>
            <button key={d} className="chip"
            aria-pressed={density === d ? "true" : "false"}
            onClick={() => setDensity(d)}>
              {d}</button>
            )}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 4, color: "var(--mute)" }}>Default view</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {["timeline", "objectives", "topology", "risks"].map((v) =>
            <button key={v} className="chip"
            aria-pressed={view === v ? "true" : "false"}
            onClick={() => setView(v)}>
              {v}</button>
            )}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--mute)", lineHeight: 1.4 }}>
            Esc · close drawer<br />
            Tab 1-4 · switch view
          </div>
        </div>
      }
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);