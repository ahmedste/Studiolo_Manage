/* The prototype's sample: the app's own specimen map (src/dev/graph-sample.ts, 18 areas and 104 topics, captured in
   ../live-lumens/capture/graph.json) with the Palace specimen's statuses and My Focus (src/dev/palace-specimens.tsx),
   plus a few Commonplace items and Lumens so the Palace has rooms to open. build.mjs inlines GRAPH and IMG. */
"use strict";
window.SAMPLE = (() => {
  const G = /*GRAPH*/ { topics: [], relations: [] };
  const LEARNING = new Set(["Geometry & ornament", "Regional schools", "Postmodern & Contemporary", "Vernacular & regional", "Theory & criticism", "Culture and architecture", "Site and place", "Space, sequence & threshold", "Proportion, scale & rhythm", "Civic & cultural", "Rainscreen", "Masonry", "Facade performance", "Steel", "Tall buildings", "Embodied carbon", "Passive design", "Daylight & shading", "MEP fundamentals", "Certification", "Urban design principles", "Masterplanning", "Parametric design", "Scripting & automation", "Writing & presenting", "Acoustics & sound", "Moisture & air tightness", "FF&E specification", "Feasibility & pro forma", "Development economics", "Dispute resolution", "Planning codes", "Biodiversity & soil", "Hardscaping details", "Generative optimization", "Performance simulation"]);
  const LEARNED = new Set(["Islamic architecture", "Plan types & ritual", "The contemporary mosque", "Modernism", "Climate-responsive design", "Ordering principles", "Massing & hierarchy", "Typologies", "Residential", "Religious", "Retail & mixed use", "Facade systems", "Curtain wall", "Unitised", "Precast", "Detailing & interfaces", "Facade procurement", "Structural principles", "Concrete & precast", "Material selection", "Methods & sequencing", "Detailing", "Site coordination", "Stages & deliverables", "Contracts & procurement", "Coordination & BIM", "Client & stakeholders", "Leadership & teams", "Codes & authorities", "BIM", "AI in practice", "Drawing & sketching", "Rendering & visualization", "Thermal envelope", "Spatial ergonomics", "Architectural lighting", "Standard contracts", "Stormwater management", "Fire engineering", "Universal access", "Egress & evacuation", "Algorithmic modeling"]);
  const FOCUS = new Set(["Daylight & shading", "Facade systems", "Typologies"]);

  const topics = G.topics.map((t, i) => ({
    id: t.id, parentId: t.parentId, name: t.name, description: "",
    status: LEARNED.has(t.name) ? "learned" : LEARNING.has(t.name) ? "learning" : "not_started",
    wantToLearn: FOCUS.has(t.name), sortOrder: i, version: 1,
  }));
  const relations = G.relations.map((r, i) => ({ id: `rel-${i}`, topicAId: r.a, topicBId: r.b, explanation: "", version: 1 }));
  const byName = (n) => topics.find((t) => t.name === n).id;

  // Commonplace items (the wall's kinds), each tagged on topics.
  const items = [
    { id: "i1", title: "Brise-soleil on the south front", kind: "Photo", img: "screen-shadow", topics: ["Daylight & shading"] },
    { id: "i2", title: "Daylight factor: 2 % is the floor, 5 % is bright", kind: "Note", topics: ["Daylight & shading"] },
    { id: "i3", title: "Glare in deep-plan offices", kind: "Link", topics: ["Daylight & shading", "Architectural lighting"] },
    { id: "i4", title: "The Passivhaus primer", kind: "Book", topics: ["Passive design"] },
    { id: "i5", title: "Courtyard at noon", kind: "Photo", img: "courtyard-noon", topics: ["Climate-responsive design"] },
    { id: "i6", title: "Wind tower in section", kind: "Photo", img: "section-windtower", topics: ["Climate-responsive design", "Passive design"] },
    { id: "i7", title: "Jali screen, Fatehpur Sikri", kind: "Photo", img: "mat-jali", topics: ["Geometry & ornament", "Daylight & shading"] },
    { id: "i8", title: "Hypostyle hall, Córdoba", kind: "Photo", img: "hypostyle", topics: ["Islamic architecture"] },
    { id: "i9", title: "Stepwell, Abhaneri", kind: "Photo", img: "stepwell", topics: ["Vernacular & regional"] },
    { id: "i10", title: "Brick bonds and their shadows", kind: "Photo", img: "mat-brick", topics: ["Masonry"] },
    { id: "i11", title: "“The building is a filter, not a wall.”", kind: "Quote", topics: ["Facade performance"] },
    { id: "i12", title: "Vaults in the bazaar", kind: "Photo", img: "vaults", topics: ["Structural principles"] },
  ].map((x) => ({ ...x, topics: x.topics.map(byName) }));

  // Lumens: one idea, explained for you (Watch, Listen or Read).
  const lumens = [
    { id: "l1", title: "Cooling without machines", format: "listen", min: 18, topic: "Passive design", progress: 0.42 },
    { id: "l2", title: "How a malqaf moves air", format: "watch", min: 6, topic: "Climate-responsive design", progress: 0.65 },
    { id: "l3", title: "Geometry in Islamic ornament", format: "read", min: 12, topic: "Geometry & ornament", progress: 0 },
    { id: "l4", title: "Rainscreen, in one picture", format: "watch", min: 5, topic: "Rainscreen", progress: 1 },
  ].map((l) => ({ ...l, topic: byName(l.topic), state: "ready" }));

  // What Loci would suggest under a topic (simulated: the app asks the model).
  const SUGGEST = {
    "Daylight & shading": ["Daylight factor", "Glare control", "Light shelves", "External shading devices", "Solar geometry"],
    "Passive design": ["Thermal mass", "Night purge ventilation", "Stack effect"],
    "Climate-responsive design": ["Courtyards", "Wind towers", "Evaporative cooling"],
    "Facade systems": ["Double-skin facades", "Brise-soleil", "Kinetic facades"],
    "Environment & Services": ["Water & drainage", "Vertical transport"],
    "Islamic architecture": ["Muqarnas", "Mashrabiya", "Iwan"],
  };

  return { topics, relations, items, lumens, SUGGEST, IMG: /*IMG*/ {} };
})();
