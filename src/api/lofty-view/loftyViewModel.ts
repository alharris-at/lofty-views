import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Core LoftyView entity schema
export const LoftyViewSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().optional(),
	location: z.string().optional(),
	hearts: z.number().int().min(0),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type LoftyView = z.infer<typeof LoftyViewSchema>;

// Input validation schemas for API requests
export const CreateLoftyViewSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Name is required"),
		description: z.string().optional(),
		location: z.string().optional(),
	}),
});

export const GetLoftyViewSchema = z.object({
	params: z.object({
		id: commonValidations.id,
	}),
});

export type CreateLoftyViewRequest = z.infer<typeof CreateLoftyViewSchema>;
export type GetLoftyViewRequest = z.infer<typeof GetLoftyViewSchema>;
