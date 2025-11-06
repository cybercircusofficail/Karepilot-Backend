import { Router } from "express";
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "../../../../controllers/admin/organization";
import { authenticateAdmin } from "../../../../middlewares/auth";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  organizationQuerySchema,
  organizationIdParamSchema,
} from "../../../../validations/admin/organization";
import { validate } from "../../../../utils";

const organizationRouter = Router();

organizationRouter.use(authenticateAdmin);

organizationRouter.get(
  "/",
  validate(organizationQuerySchema, "query"),
  getAllOrganizations
);

organizationRouter.get(
  "/:id",
  validate(organizationIdParamSchema, "params"),
  getOrganizationById
);

organizationRouter.post(
  "/",
  validate(createOrganizationSchema),
  createOrganization
);

organizationRouter.put(
  "/:id",
  validate(organizationIdParamSchema, "params"),
  validate(updateOrganizationSchema),
  updateOrganization
);

organizationRouter.delete(
  "/:id",
  validate(organizationIdParamSchema, "params"),
  deleteOrganization
);

export default organizationRouter;

