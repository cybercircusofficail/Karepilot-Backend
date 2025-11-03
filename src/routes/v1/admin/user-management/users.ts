import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersStats,
} from "../../../../controllers/admin/user-management";
import {
  authenticateAdmin,
  requirePermission,
  requireAnyPermission,
} from "../../../../middlewares/auth";
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
  userIdParamSchema,
} from "../../../../validations/admin/user-management";
import { validate } from "../../../../utils";
const usersRouter = Router();

usersRouter.use(authenticateAdmin);

usersRouter.get(
  "/stats",
  getUsersStats
);

usersRouter.get(
  "/",
  validate(userQuerySchema, "query"),
  getAllUsers
);

usersRouter.get(
  "/:id",
  validate(userIdParamSchema, "params"),
  getUserById
);

usersRouter.post(
  "/",
  validate(createUserSchema),
  createUser
);

usersRouter.put(
  "/:id",
  validate(userIdParamSchema, "params"),
  validate(updateUserSchema),
  updateUser
);

usersRouter.delete(
  "/:id",
  validate(userIdParamSchema, "params"),
  deleteUser
);

export default usersRouter;

