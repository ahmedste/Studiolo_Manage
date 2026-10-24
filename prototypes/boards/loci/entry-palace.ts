// Studiolo's own Palace (src/components/graph/palace/palace-engine.ts and src/features/palace/*, main @ 6f8d396),
// exposed to the Boards prototype. The prototype owns the data, the selection and the panels; the engine draws.
import { PalaceEngine } from "./src/components/graph/palace/palace-engine";
import { buildScene, mergeExtras } from "./src/features/palace/scene";
import { combineExtras, NO_EXTRAS, roomExtras } from "./src/features/palace/extras";
import { backTrail, neighboursOf, pushTrail } from "./src/features/palace/levels";
import { itemNodeId, latestMembers, lumenNodeId, parseExtraId, servedTopicIds, stackId } from "./src/features/palace/room";
(window as any).LociPalace = { PalaceEngine, buildScene, mergeExtras, combineExtras, NO_EXTRAS, roomExtras, backTrail, neighboursOf, pushTrail, itemNodeId, latestMembers, lumenNodeId, parseExtraId, servedTopicIds, stackId };
