"use strict";

import { Router } from "express";
import { authenticateAdmin } from "../../../../middlewares/auth";
import buildingsRouter from "./buildings";
import floorPlansRouter from "./floorPlans";
import mapEditorPOIRouter from "./mapEditorPOI";
import mapEditorEntranceRouter from "./mapEditorEntrance";
import mapEditorElevatorRouter from "./mapEditorElevator";
import mapEditorPathRouter from "./mapEditorPath";
import mapEditorRestrictedZoneRouter from "./mapEditorRestrictedZone";
import mapEditorLabelRouter from "./mapEditorLabel";
import mapEditorMeasurementRouter from "./mapEditorMeasurement";
import mapEditorAnnotationRouter from "./mapEditorAnnotation";
import mapEditorPreferencesRouter from "./mapEditorPreferences";
import settingsRouter from "./settings";

const mapManagementRouter = Router();

mapManagementRouter.use(authenticateAdmin);

mapManagementRouter.use("/buildings", buildingsRouter);

mapManagementRouter.use("/floor-plans", floorPlansRouter);
mapManagementRouter.use("/map-editor/pois", mapEditorPOIRouter);
mapManagementRouter.use("/map-editor/entrances", mapEditorEntranceRouter);
mapManagementRouter.use("/map-editor/elevators", mapEditorElevatorRouter);
mapManagementRouter.use("/map-editor/paths", mapEditorPathRouter);
mapManagementRouter.use("/map-editor/restricted-zones", mapEditorRestrictedZoneRouter);
mapManagementRouter.use("/map-editor/labels", mapEditorLabelRouter);
mapManagementRouter.use("/map-editor/measurements", mapEditorMeasurementRouter);
mapManagementRouter.use("/map-editor/annotations", mapEditorAnnotationRouter);
mapManagementRouter.use("/map-editor/preferences", mapEditorPreferencesRouter);

mapManagementRouter.use("/settings", settingsRouter);

export default mapManagementRouter;
