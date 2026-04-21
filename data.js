// diffUSE roadmap data model
// Four core objectives (north stars) map milestones across arms & horizons.

window.ROADMAP = {
  mission: "Make dynamic structural biology as routine — and more impactful — than static structural biology.",
  northStars: [
    { id: "methods",  label: "Methods",        desc: "Democratize dynamic structural biology methods" },
    { id: "models",   label: "Models",         desc: "Interpretable ensemble models that reveal hidden structural states, encode dynamics, enable prediction" },
    { id: "infra",    label: "Infrastructure", desc: "Make dynamic data as accessible and usable as static structures, for users outside structural biology" },
    { id: "impact",   label: "Impact",         desc: "Use biological questions to understand where dynamics drive breakthroughs" },
  ],
  horizons: [
    { id: "h2",  label: "2-Year",  caption: "Foundation & Proof-of-Concept" },
    { id: "h5",  label: "5-Year",  caption: "Integration & Impact" },
    { id: "h10", label: "10-Year", caption: "Transformation & Paradigm Shift" },
  ],
  // Program-level goals per horizon (executive read)
  programGoals: {
    h2: [
      "Multiple experimental techniques integrated algorithmically",
      "Initial infrastructure operational with community standards",
      "Biological proof of principle: dynamics provide insight over static",
      "Early adopters using methods and contributing data",
    ],
    h5: [
      "Mature infrastructure with substantial data at scale",
      "Methods routine in multiple labs; community self-organizing",
      "Demonstrated impact on real biological problems and therapeutic programs",
      "Adoption beyond core team; partnerships and commercial interest emerging",
    ],
    h10: [
      "Industry and pharma routinely rely on ensemble approaches",
      "Failing to consider dynamics is viewed as scientifically incomplete",
      "Infrastructure self-sustaining; global community driving innovation",
      "New therapeutic modalities and biological frontiers enabled",
      "Field has fundamentally transformed how we understand proteins",
    ],
  },
  // Arms: hub (3) + spoke archetype
  arms: [
    {
      id: "algo",
      kind: "hub",
      name: "Algorithmic Development for Protein Dynamics",
      role: "Uncovers hidden information in experimental data, builds ensemble models, leverages information across experimental sources.",
      goals: [
        "Joint ensemble modeling of protein, ligand, and solvent",
        "Integrate ensemble prediction frameworks with experimental ground truth",
        "Prediction algorithms that learn ensembles directly from experimental data",
        "Algorithms robust to partial or conflicting multi-modal data",
        "Validation metrics grounded in experimental agreement, not model–model",
      ],
      milestones: {
        h2: [
          { t: "Guidance framework adopted by 2+ model-building labs", ns: ["models"] },
          { t: "Established algorithms & datasets for next-gen ensemble ML training", ns: ["models"] },
          { t: "Guidance using 3+ experimental data types", ns: ["models","methods"] },
          { t: "Representation learning framework: shared dynamic features across modalities", ns: ["models"] },
          { t: "Proof-of-concept agentic model with ensemble modeling + experimental validation", ns: ["models","impact"] },
        ],
        h5: [
          { t: "Guidance framework integrating multiple experimental datatypes simultaneously", ns: ["models","methods"] },
          { t: "Representation learning across modalities → improved ensemble modeling & prediction", ns: ["models"] },
          { t: "Real-time automated ensemble modeling via agentic coding + experimental data", ns: ["models","infra"] },
        ],
        h10: [
          { t: "Algorithms handle all modalities with automatic reliability weighting", ns: ["models"] },
          { t: "Experimental ensemble-trained models outperform MD + AI static approaches", ns: ["models","impact"] },
          { t: "Real-time ensemble refinement: new data updates deposited models within hours", ns: ["models","infra"] },
        ],
      },
      pitfalls: [
        "No ground-truth ensembles for validation → iterative training-prediction loops with prediction labs",
        "Sparse data limits applicability → expand coverage and fund collection inside diffUSE",
        "Field shifts to fully predictive AI without experimental constraints, obsoleting data-driven approaches",
      ],
    },
    {
      id: "infra",
      kind: "hub",
      name: "Infrastructure for Dynamic PDB",
      role: "Transforms a PDB-like database into an ensemble-aware, living database with standards and validation.",
      goals: [
        "Continuous model improvement with provenance, trust, reproducibility",
        "Community standards for conformational & compositional heterogeneity",
        "Ensemble-aware validation: fit-to-data, physical realism, uncertainty",
        "Data-out & query tools for searching and interpreting heterogeneity",
        "Task forces & workshops to define standards",
        "Iterative integration with existing PDB efforts",
      ],
      milestones: {
        h2: [
          { t: "Initial data-lake infrastructure connected to wwPDB, EMDB, BMRB", ns: ["infra"] },
          { t: "Task force on infrastructure, validation, and ensemble representation", ns: ["infra","methods"] },
          { t: "20+ groups depositing ensemble models, stress-testing the infrastructure", ns: ["infra","impact"] },
        ],
        h5: [
          { t: "Multiple models per experimental dataset; multiple datasets per model", ns: ["infra"] },
          { t: "Database used as training data in ML studies", ns: ["models","infra"] },
          { t: "Integration with other biological databases", ns: ["infra"] },
        ],
        h10: [
          { t: "Integrated within wwPDB and/or long-term funding & maintenance strategy", ns: ["infra"] },
          { t: "Database is a staple for data governance; ensemble models are default deposition", ns: ["infra","methods"] },
          { t: "Living database: deposited ensembles improve as algorithms advance, with provenance", ns: ["infra","models"] },
        ],
      },
      pitfalls: [
        "Growth stalls; capacity can't scale to database-level volumes",
        "Competing infrastructure emerges, fragmenting the community",
        "Standards prove inflexible to new methods without major overhaul",
        "Maintenance burden overwhelms capacity; trust is lost",
        "Compute for storing/querying ensembles exceeds budgets",
      ],
    },
    {
      id: "bio",
      kind: "hub",
      name: "Biological Impact",
      role: "Grounds algorithms and infrastructure in biology; primary interface for funders and pharma partners.",
      goals: [
        "Ensemble-aware protein representations: PLM/LLM embeddings × experimental heterogeneity",
        "Quantitative metrics of dynamics (protein + solvent entropy, long-range coupling)",
        "How local perturbations propagate through ensembles (binding, mutation)",
        "Dynamics as a mechanistic design principle: allostery & catalysis",
      ],
      milestones: {
        h2: [
          { t: "Quantitative benchmarks for conformational & solvent entropy in binding", ns: ["impact","models"] },
          { t: "Predict & design enzyme variants where dynamics drive catalytic efficiency", ns: ["impact"] },
          { t: "Validated solvent–protein dynamics metrics linking hydration to function", ns: ["impact","models"] },
          { t: "Improved functional prediction: ensemble-aware vs. static representations", ns: ["models","impact"] },
          { t: "Release ensemble-aware metrics: flexibility, dynamic coupling, allostery", ns: ["models","methods"] },
        ],
        h5: [
          { t: "Improved binding/catalysis/allostery/mutational-effect prediction across 50+ systems", ns: ["impact","models"] },
          { t: "Ensemble-based design principles → successful engineering / drug-discovery campaigns", ns: ["impact"] },
          { t: "Solvent-coupled designs where hydration enhances binding or catalysis", ns: ["impact"] },
        ],
        h10: [
          { t: "Therapeutic proteins / drug candidates where dynamics are essential to function", ns: ["impact"] },
          { t: "Sequence → ensemble → function framework rivaling sequence/structure → function", ns: ["impact","models"] },
          { t: "Universal quantitative links between dynamics, solvent, and function", ns: ["impact","models"] },
        ],
      },
      pitfalls: [
        "Pure AI/ML without explicit ensemble modeling achieves superior prediction",
        "Biological validation is slow and expensive; feedback loop too slow to iterate",
        "Framework works only on specific proteins; doesn't generalize",
      ],
    },
    {
      id: "spokes",
      kind: "spoke",
      name: "Method Spokes (moonshots)",
      role: "Each spoke pursues a defined technical breakthrough to unlock dynamic data that is currently inaccessible or discarded.",
      goals: [
        "Define the specific technical barrier limiting dynamic data collection",
        "Develop methods, algorithms, and/or instrumentation for step-change",
        "Validation frameworks & benchmarks that quantify whether moonshot achieved",
        "Produce tools, protocols, and infrastructure reproducible beyond originating lab",
        "Clear integration points with hub for cross-modal algorithms & shared infra",
      ],
      milestones: {
        h2: [
          { t: "Step-change in ≥1 core capability (throughput, sensitivity, resolution, information)", ns: ["methods"] },
          { t: "Proof-of-concept datasets extracting dynamics inaccessible to current standard", ns: ["methods","models"] },
          { t: "Release the method innovation — reproducible by an independent lab", ns: ["methods"] },
          { t: "Quantitative validation framework defined with hub", ns: ["methods","models"] },
        ],
        h5: [
          { t: "Moonshot achieved across all target performance axes (faster, sharper, richer)", ns: ["methods"] },
          { t: "10× data-generation scale; 50–100+ datasets with standardized quality", ns: ["methods","infra"] },
          { t: "Multi-lab reproducibility via round-robin validation", ns: ["methods"] },
          { t: "Automate the critical bottleneck; rate-limit shifts downstream", ns: ["methods"] },
          { t: "Cross-modal discovery via hub integration; ≥3 biological discoveries", ns: ["methods","impact"] },
          { t: "Adoption by 10+ external labs with training & QC", ns: ["methods"] },
        ],
        h10: [
          { t: "Moonshot normalized: standard practice, adopted by CROs & industry", ns: ["methods","impact"] },
          { t: "Database-scale data-generation auto-fed into the Dynamic PDB", ns: ["methods","infra"] },
          { t: "Throughput no longer limits impact; bottleneck is interpretation (hub)", ns: ["methods","models"] },
          { t: "Next-gen moonshots underway (kinetic resolution, proteome-scale)", ns: ["methods"] },
          { t: "Self-sustaining ecosystem; infra independent of diffUSE funding", ns: ["methods","infra"] },
          { t: "Direct therapeutic / design impact where dynamics were essential", ns: ["impact"] },
        ],
      },
      pitfalls: [
        "Technique remains a specialized tool rather than a mainstream approach",
        "Limited experimental capacity or costs constrain growth",
        "Integration becomes routine but not transformative; marginal value",
        "Field moves toward alternative approaches",
        "Not enough skilled practitioners to support broad adoption",
      ],
    },
  ],
  // Program-wide pitfalls
  programPitfalls: [
    { risk: "Successes concentrated in well-funded, high-expertise labs", mitigation: "Shared instrument facilities and networks democratize access beyond initial institutions" },
    { risk: "Dynamic data does not translate to improved functional prediction", mitigation: "Expand project into biologically meaningful targets; surface gaps from methods to biology" },
    { risk: "Different groups get conflicting results, eroding confidence", mitigation: "Mandatory reporting standards, multi-lab round-robin validation, quality-control metrics" },
    { risk: "Over-specialized and disconnected from mainstream biology", mitigation: "Interact with disease-focused labs and companies to maintain relevance" },
    { risk: "Information content overlaps extensively with existing methods", mitigation: "Focus on problem classes where static methods demonstrably fail; release head-to-head comparisons" },
  ],
  // Guiding questions
  questions: [
    "What structural data are we missing, and how do we accelerate the technologies to capture it?",
    "Where will dynamic structural data have the greatest impact in revealing biological function?",
    "How do we build enabling tools that empower everyone — not just experts — to leverage dynamic structural information?",
    "How do we disseminate our tools and data to maximize scientific impact?",
  ],
};
