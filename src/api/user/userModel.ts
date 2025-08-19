import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
	id: z.number(),
	name: z.string(),
	email: z.string().email(),
	age: z.number(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Input Validation for 'POST users' endpoint
export const CreateUserSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Name is required"),
		email: z.string().email("Valid email is required"),
		age: z.number().int().min(0, "Age must be a non-negative integer"),
	}),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;

// Input Validation for 'DELETE users/:id' endpoint
export const DeleteUserSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});
