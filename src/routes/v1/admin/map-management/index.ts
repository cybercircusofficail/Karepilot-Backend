"use strict";

import { Router } from "express";
import buildingsRouter from "./buildings";
import floorPlansRouter from "./floorPlans";
import mapEditorPOIRouter from "./mapEditorPOI";
import mapEditorEntranceRouter from "./mapEditorEntrance";
import mapEditorElevatorRouter from "./mapEditorElevator";
import mapEditorPathRouter from "./mapEditorPath";
import mapEditorRestrictedZoneRouter from "./mapEditorRestrictedZone";
import settingsRouter from "./settings";

const mapManagementRouter = Router();

mapManagementRouter.use("/buildings", buildingsRouter);

mapManagementRouter.use("/floor-plans", floorPlansRouter);
mapManagementRouter.use("/map-editor/pois", mapEditorPOIRouter);
mapManagementRouter.use("/map-editor/entrances", mapEditorEntranceRouter);
mapManagementRouter.use("/map-editor/elevators", mapEditorElevatorRouter);
mapManagementRouter.use("/map-editor/paths", mapEditorPathRouter);
mapManagementRouter.use("/map-editor/restricted-zones", mapEditorRestrictedZoneRouter);

mapManagementRouter.use("/settings", settingsRouter);

export default mapManagementRouter;
