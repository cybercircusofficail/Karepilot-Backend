import { Router } from "express";
import {
  getEntrancesByFloorPlan,
  getEntranceById,
  createEntrance,
  updateEntrance,
  deleteEntrance,
} from "../../../../controllers/admin/map-management/mapEditorEntrance";

const router = Router();

router.get("/", getEntrancesByFloorPlan);
router.get("/:id", getEntranceById);
router.post("/", createEntrance);
router.put("/:id", updateEntrance);
router.delete("/:id", deleteEntrance);

export default router;

