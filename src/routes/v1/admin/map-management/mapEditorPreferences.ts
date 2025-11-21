import express from "express";
import mapEditorPreferencesController from "../../../../controllers/admin/map-management/mapEditorPreferences";

const router = express.Router();

router.get("/",  mapEditorPreferencesController.getPreferences);

router.put("/",  mapEditorPreferencesController.updatePreferences);

router.post("/reset",  mapEditorPreferencesController.resetPreferences);

export default router;

