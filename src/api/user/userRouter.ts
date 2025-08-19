import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { userController } from "@/api/user/userController";
import { CreateUserSchema, DeleteUserSchema, GetUserSchema, UserSchema } from "@/api/user/userModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

userRegistry.registerPath({
	method: "get",
	path: "/users",
	tags: ["User"],
	responses: createApiResponse(z.array(UserSchema), "Success"),
});

userRouter.get("/", userController.getUsers);

userRegistry.registerPath({
	method: "post",
	path: "/users",
	tags: ["User"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateUserSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(UserSchema, "User created successfully", 201),
});

userRouter.post("/", validateRequest(CreateUserSchema), userController.createUser);

userRegistry.registerPath({
	method: "get",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);

userRegistry.registerPath({
	method: "delete",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: DeleteUserSchema.shape.params },
	responses: {
		204: { description: "User deleted successfully" },
		404: { description: "User not found" },
		400: { description: "Invalid user ID" },
		500: { description: "Internal server error" },
	},
});

userRouter.delete("/:id", validateRequest(DeleteUserSchema), userController.deleteUser);
