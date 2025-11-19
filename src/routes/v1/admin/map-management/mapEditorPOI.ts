"use strict";

import { Router } from "express";
import {
  createPOI,
  deletePOI,
  getPOIById,
  getPOIsByFloorPlan,
  updatePOI,
} from "../../../../controllers/admin/map-management/mapEditorPOI";

const router = Router();

router.get("/", getPOIsByFloorPlan);

router.get("/:id", getPOIById);

router.post("/", createPOI);

router.put("/:id", updatePOI);

router.delete("/:id", deletePOI);

export default router;

