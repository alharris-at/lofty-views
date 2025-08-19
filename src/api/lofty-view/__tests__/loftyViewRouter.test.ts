import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

describe("LoftyView API Endpoints", () => {
	describe("GET /lofty-views", () => {
		it("should return all lofty views", async () => {
			const response = await request(app).get("/lofty-views");

			expect(response.status).toBe(StatusCodes.OK);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Lofty views found");
			expect(Array.isArray(response.body.responseObject)).toBe(true);
			expect(response.body.responseObject).toHaveLength(3);

			// Verify structure of first lofty view
			const firstView = response.body.responseObject[0];
			expect(firstView).toHaveProperty("id");
			expect(firstView).toHaveProperty("name");
			expect(firstView).toHaveProperty("hearts");
			expect(firstView).toHaveProperty("createdAt");
			expect(firstView).toHaveProperty("updatedAt");
		});

		it("should return lofty views with correct data types", async () => {
			const response = await request(app).get("/lofty-views");

			expect(response.status).toBe(StatusCodes.OK);
			const views = response.body.responseObject;

			views.forEach((view: any) => {
				expect(typeof view.id).toBe("number");
				expect(typeof view.name).toBe("string");
				expect(typeof view.hearts).toBe("number");
				expect(view.hearts).toBeGreaterThanOrEqual(0);
				expect(new Date(view.createdAt)).toBeInstanceOf(Date);
				expect(new Date(view.updatedAt)).toBeInstanceOf(Date);
			});
		});
	});

	describe("GET /lofty-views/:id", () => {
		it("should return a specific lofty view when found", async () => {
			const response = await request(app).get("/lofty-views/1");

			expect(response.status).toBe(StatusCodes.OK);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Lofty view found");
			expect(response.body.responseObject).toHaveProperty("id", 1);
			expect(response.body.responseObject).toHaveProperty("name", "Golden Gate Bridge");
		});

		it("should return 404 when lofty view not found", async () => {
			const response = await request(app).get("/lofty-views/999");

			expect(response.status).toBe(StatusCodes.NOT_FOUND);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Lofty view not found");
			expect(response.body.responseObject).toBeNull();
		});

		it("should return 400 for invalid ID format", async () => {
			const response = await request(app).get("/lofty-views/abc");

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
			expect(response.body.success).toBe(false);
		});

		it("should return 400 for negative ID", async () => {
			const response = await request(app).get("/lofty-views/-1");

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
			expect(response.body.success).toBe(false);
		});

		it("should return 400 for zero ID", async () => {
			const response = await request(app).get("/lofty-views/0");

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
			expect(response.body.success).toBe(false);
		});
	});

	describe("POST /lofty-views", () => {
		it("should create a new lofty view with all fields", async () => {
			const newView = {
				name: "Test View",
				description: "A test view for integration testing",
				location: "Test Location",
			};

			const response = await request(app).post("/lofty-views").send(newView);

			expect(response.status).toBe(StatusCodes.CREATED);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Lofty view created successfully");
			expect(response.body.responseObject).toMatchObject({
				name: newView.name,
				description: newView.description,
				location: newView.location,
				hearts: 0, // Should initialize to 0
			});
			expect(response.body.responseObject).toHaveProperty("id");
			expect(response.body.responseObject).toHaveProperty("createdAt");
			expect(response.body.responseObject).toHaveProperty("updatedAt");
		});

		it("should create a new lofty view with only required fields", async () => {
			const newView = {
				name: "Minimal View",
			};

			const response = await request(app).post("/lofty-views").send(newView);

			expect(response.status).toBe(StatusCodes.CREATED);
			expect(response.body.success).toBe(true);
			expect(response.body.responseObject).toMatchObject({
				name: newView.name,
				hearts: 0,
			});
			expect(response.body.responseObject.description).toBeUndefined();
			expect(response.body.responseObject.location).toBeUndefined();
		});

		it("should return 400 when name is missing", async () => {
			const invalidView = {
				description: "Missing name field",
			};

			const response = await request(app).post("/lofty-views").send(invalidView);

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
			expect(response.body.success).toBe(false);
		});

		it("should return 400 when name is empty string", async () => {
			const invalidView = {
				name: "",
				description: "Empty name field",
			};

			const response = await request(app).post("/lofty-views").send(invalidView);

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
			expect(response.body.success).toBe(false);
		});

		it("should return 400 when request body is empty", async () => {
			const response = await request(app).post("/lofty-views").send({});

			expect(response.status).toBe(StatusCodes.BAD_REQUEST);
			expect(response.body.success).toBe(false);
		});
	});

	describe("API Response Format", () => {
		it("should follow ServiceResponse format for successful requests", async () => {
			const response = await request(app).get("/lofty-views");

			expect(response.body).toHaveProperty("success");
			expect(response.body).toHaveProperty("message");
			expect(response.body).toHaveProperty("responseObject");
			expect(response.body).toHaveProperty("statusCode");
			expect(response.body.success).toBe(true);
		});

		it("should follow ServiceResponse format for error requests", async () => {
			const response = await request(app).get("/lofty-views/999");

			expect(response.body).toHaveProperty("success");
			expect(response.body).toHaveProperty("message");
			expect(response.body).toHaveProperty("responseObject");
			expect(response.body).toHaveProperty("statusCode");
			expect(response.body.success).toBe(false);
			expect(response.body.responseObject).toBeNull();
		});
	});
});
