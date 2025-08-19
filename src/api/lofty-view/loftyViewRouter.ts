import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { loftyViewController } from "./loftyViewController";
import { CreateLoftyViewSchema, GetLoftyViewSchema, LoftyViewSchema } from "./loftyViewModel";

export const loftyViewRegistry = new OpenAPIRegistry();
export const loftyViewRouter: Router = express.Router();

// Register LoftyView schema with OpenAPI
loftyViewRegistry.register("LoftyView", LoftyViewSchema);

// GET /lofty-views - List all lofty views
loftyViewRegistry.registerPath({
	method: "get",
	path: "/lofty-views",
	tags: ["LoftyView"],
	responses: createApiResponse(z.array(LoftyViewSchema), "Success"),
});

loftyViewRouter.get("/", loftyViewController.getLoftyViews);

// GET /lofty-views/:id - Get a specific lofty view
loftyViewRegistry.registerPath({
	method: "get",
	path: "/lofty-views/{id}",
	tags: ["LoftyView"],
	request: {
		params: GetLoftyViewSchema.shape.params,
	},
	responses: createApiResponse(LoftyViewSchema, "Success"),
});

loftyViewRouter.get("/:id", validateRequest(GetLoftyViewSchema), loftyViewController.getLoftyView);

// POST /lofty-views - Create a new lofty view
loftyViewRegistry.registerPath({
	method: "post",
	path: "/lofty-views",
	tags: ["LoftyView"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateLoftyViewSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(LoftyViewSchema, "Lofty view created successfully", 201),
});

loftyViewRouter.post("/", validateRequest(CreateLoftyViewSchema), loftyViewController.createLoftyView);
