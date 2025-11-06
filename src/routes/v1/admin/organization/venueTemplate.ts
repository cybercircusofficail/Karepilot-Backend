import { Router } from "express";
import {
  getAllVenueTemplates,
  getVenueTemplateById,
  createVenueTemplate,
  updateVenueTemplate,
  deleteVenueTemplate,
} from "../../../../controllers/admin/organization";
import { authenticateAdmin } from "../../../../middlewares/auth";
import {
  createVenueTemplateSchema,
  updateVenueTemplateSchema,
  venueTemplateQuerySchema,
  venueTemplateIdParamSchema,
} from "../../../../validations/admin/organization";
import { validate } from "../../../../utils";

const venueTemplateRouter = Router();

venueTemplateRouter.use(authenticateAdmin);

venueTemplateRouter.get(
  "/",
  validate(venueTemplateQuerySchema, "query"),
  getAllVenueTemplates
);

venueTemplateRouter.get(
  "/:id",
  validate(venueTemplateIdParamSchema, "params"),
  getVenueTemplateById
);

venueTemplateRouter.post(
  "/",
  validate(createVenueTemplateSchema),
  createVenueTemplate
);

venueTemplateRouter.put(
  "/:id",
  validate(venueTemplateIdParamSchema, "params"),
  validate(updateVenueTemplateSchema),
  updateVenueTemplate
);

venueTemplateRouter.delete(
  "/:id",
  validate(venueTemplateIdParamSchema, "params"),
  deleteVenueTemplate
);

export default venueTemplateRouter;

