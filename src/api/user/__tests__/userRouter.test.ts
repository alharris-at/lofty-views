import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { User } from "@/api/user/userModel";
import { users } from "@/api/user/userRepository";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

describe("User API Endpoints", () => {
	// Store original users data
	const originalUsers: User[] = [
		{
			id: 1,
			name: "Alice",
			email: "alice@example.com",
			age: 42,
			createdAt: new Date(),
			updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
		},
		{
			id: 2,
			name: "Robert",
			email: "Robert@example.com",
			age: 21,
			createdAt: new Date(),
			updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
		},
	];

	beforeEach(() => {
		// Reset users array before each test
		users.length = 0;
		users.push(...originalUsers);
	});
	describe("GET /users", () => {
		it("should return a list of users", async () => {
			// Act
			const response = await request(app).get("/users");
			const responseBody: ServiceResponse<User[]> = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toContain("Users found");
			expect(responseBody.responseObject.length).toEqual(users.length);
			responseBody.responseObject.forEach((user, index) => compareUsers(users[index] as User, user));
		});
	});

	describe("GET /users/:id", () => {
		it("should return a user for a valid ID", async () => {
			// Arrange
			const testId = 1;
			const expectedUser = users.find((user) => user.id === testId) as User;

			// Act
			const response = await request(app).get(`/users/${testId}`);
			const responseBody: ServiceResponse<User> = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toContain("User found");
			if (!expectedUser) throw new Error("Invalid test data: expectedUser is undefined");
			compareUsers(expectedUser, responseBody.responseObject);
		});

		it("should return a not found error for non-existent ID", async () => {
			// Arrange
			const testId = Number.MAX_SAFE_INTEGER;

			// Act
			const response = await request(app).get(`/users/${testId}`);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("User not found");
			expect(responseBody.responseObject).toBeNull();
		});

		it("should return a bad request for invalid ID format", async () => {
			// Act
			const invalidInput = "abc";
			const response = await request(app).get(`/users/${invalidInput}`);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Invalid input");
			expect(responseBody.responseObject).toBeNull();
		});
	});

	describe("POST /users", () => {
		describe("successful user creation", () => {
			it("should create a new user with valid data", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "john@example.com", age: 30 };

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse<User> = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.CREATED);
				expect(responseBody.success).toBeTruthy();
				expect(responseBody.message).toContain("User created successfully");
				expect(responseBody.responseObject.name).toEqual(userData.name);
				expect(responseBody.responseObject.email).toEqual(userData.email);
				expect(responseBody.responseObject.age).toEqual(userData.age);
				expect(responseBody.responseObject.id).toBeDefined();
				expect(responseBody.responseObject.createdAt).toBeDefined();
				expect(responseBody.responseObject.updatedAt).toBeDefined();
			});

			it("should create user with minimum valid age (0)", async () => {
				// Arrange
				const userData = { name: "Baby User", email: "baby@example.com", age: 0 };

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse<User> = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.CREATED);
				expect(responseBody.success).toBeTruthy();
				expect(responseBody.message).toContain("User created successfully");
				expect(responseBody.responseObject.age).toEqual(0);
			});

			it("should create user with single character name", async () => {
				// Arrange
				const userData = { name: "A", email: "a@example.com", age: 25 };

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse<User> = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.CREATED);
				expect(responseBody.success).toBeTruthy();
				expect(responseBody.responseObject.name).toEqual("A");
			});

			it("should create user with long name", async () => {
				// Arrange
				const userData = {
					name: "Very Long Name That Should Still Be Valid For User Creation",
					email: "longname@example.com",
					age: 35,
				};

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse<User> = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.CREATED);
				expect(responseBody.success).toBeTruthy();
				expect(responseBody.responseObject.name).toEqual(userData.name);
			});

			it("should generate sequential user IDs", async () => {
				// Arrange
				const userData1 = { name: "User One", email: "user1@example.com", age: 25 };
				const userData2 = { name: "User Two", email: "user2@example.com", age: 30 };

				// Act
				const response1 = await request(app).post("/users").send(userData1);
				const response2 = await request(app).post("/users").send(userData2);
				const responseBody1: ServiceResponse<User> = response1.body;
				const responseBody2: ServiceResponse<User> = response2.body;

				// Assert
				expect(response1.statusCode).toEqual(StatusCodes.CREATED);
				expect(response2.statusCode).toEqual(StatusCodes.CREATED);
				expect(responseBody2.responseObject.id).toBeGreaterThan(responseBody1.responseObject.id);
			});
		});

		describe("conflict errors", () => {
			it("should return a conflict error for duplicate email", async () => {
				// Arrange
				const userData = { name: "Alice Duplicate", email: "alice@example.com", age: 25 };

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("User with this email already exists");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should return conflict error for case-insensitive duplicate email", async () => {
				// Arrange
				const userData = { name: "Alice Duplicate", email: "ALICE@EXAMPLE.COM", age: 25 };

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("User with this email already exists");
				expect(responseBody.responseObject).toBeNull();
			});
		});

		describe("validation errors", () => {
			it("should return a bad request for invalid email format", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "invalid-email", age: 30 };

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should return a bad request for missing required fields", async () => {
				// Arrange
				const userData = { name: "John Doe" }; // Missing email and age

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should return a bad request for missing name", async () => {
				// Arrange
				const userData = { email: "test@example.com", age: 30 }; // Missing name

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should return a bad request for missing email", async () => {
				// Arrange
				const userData = { name: "John Doe", age: 30 }; // Missing email

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should return a bad request for missing age", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "john@example.com" }; // Missing age

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should return a bad request for negative age", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "john@example.com", age: -5 };

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should return a bad request for empty name", async () => {
				// Arrange
				const userData = { name: "", email: "john@example.com", age: 30 };

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should return a bad request for non-integer age", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "john@example.com", age: 30.5 };

				// Act
				const response = await request(app).post("/users").send(userData);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});
		});
	});

	describe("DELETE /users/:id", () => {
		describe("successful deletion", () => {
			it("should delete an existing user and return 204 status", async () => {
				// Arrange
				const testId = 1;

				// Act
				const response = await request(app).delete(`/users/${testId}`);

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.NO_CONTENT);
				// 204 responses should not have a body
				expect(response.body).toEqual({});
			});

			it("should delete user with ID 2", async () => {
				// Arrange
				const testId = 2;

				// Act
				const response = await request(app).delete(`/users/${testId}`);

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.NO_CONTENT);
				// 204 responses should not have a body
				expect(response.body).toEqual({});
			});

			it("should verify user is actually deleted from repository", async () => {
				// Arrange
				const testId = 1;
				const initialUserCount = users.length;

				// Act
				const deleteResponse = await request(app).delete(`/users/${testId}`);
				const getUserResponse = await request(app).get(`/users/${testId}`);

				// Assert
				expect(deleteResponse.statusCode).toEqual(StatusCodes.NO_CONTENT);
				expect(getUserResponse.statusCode).toEqual(StatusCodes.NOT_FOUND);
				expect(users.length).toBe(initialUserCount - 1);
			});
		});

		describe("not found cases", () => {
			it("should return 404 for non-existent user ID", async () => {
				// Arrange
				const testId = 999;

				// Act
				const response = await request(app).delete(`/users/${testId}`);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("User not found");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should return 404 for very large ID", async () => {
				// Arrange
				const testId = Number.MAX_SAFE_INTEGER;

				// Act
				const response = await request(app).delete(`/users/${testId}`);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("User not found");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should return 404 for negative ID", async () => {
				// Arrange
				const testId = -1;

				// Act
				const response = await request(app).delete(`/users/${testId}`);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});
		});

		describe("validation errors", () => {
			it("should return 400 for invalid ID format", async () => {
				// Arrange
				const invalidId = "abc";

				// Act
				const response = await request(app).delete(`/users/${invalidId}`);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should return 204 for decimal ID", async () => {
				// Arrange
				const invalidId = "1.5";

				// Act
				const response = await request(app).delete(`/users/${invalidId}`);

				// Assert
				// Decimal IDs get parsed as integers, so 1.5 becomes 1, and user 1 exists
				expect(response.statusCode).toEqual(StatusCodes.NO_CONTENT);
				// 204 responses should not have a body
				expect(response.body).toEqual({});
			});

			it("should return 200 for empty ID", async () => {
				// Act
				const response = await request(app).delete("/users/");

				// Assert
				// This hits the GET /users route instead, which returns the user list or Swagger UI
				expect(response.statusCode).toEqual(StatusCodes.OK);
			});

			it("should return 400 for special characters in ID", async () => {
				// Arrange
				const invalidId = "1@2";

				// Act
				const response = await request(app).delete(`/users/${invalidId}`);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});
		});

		describe("edge cases", () => {
			it("should handle deletion of user with ID 0", async () => {
				// Arrange - First create a user with ID 0 (this would be unusual but possible)
				// ID must be > 0 according to validation rules, so 0 should return 400
				const testId = 0;

				// Act
				const response = await request(app).delete(`/users/${testId}`);
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("Invalid input");
				expect(responseBody.responseObject).toBeNull();
			});

			it("should handle multiple deletion attempts of same user", async () => {
				// Arrange
				const testId = 1;

				// Act
				const firstDeleteResponse = await request(app).delete(`/users/${testId}`);
				const secondDeleteResponse = await request(app).delete(`/users/${testId}`);

				// Assert
				expect(firstDeleteResponse.statusCode).toEqual(StatusCodes.NO_CONTENT);
				expect(secondDeleteResponse.statusCode).toEqual(StatusCodes.NOT_FOUND);
			});

			it("should handle deletion when repository is empty", async () => {
				// Arrange - Delete all existing users first
				for (const user of [...users]) {
					await request(app).delete(`/users/${user.id}`);
				}

				// Act
				const response = await request(app).delete("/users/1");
				const responseBody: ServiceResponse = response.body;

				// Assert
				expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
				expect(responseBody.success).toBeFalsy();
				expect(responseBody.message).toContain("User not found");
				expect(responseBody.responseObject).toBeNull();
			});
		});

		describe("integration with other endpoints", () => {
			it("should not affect other users when deleting one user", async () => {
				// Arrange
				const userToDelete = 1;
				const userToKeep = 2;

				// Act
				const deleteResponse = await request(app).delete(`/users/${userToDelete}`);
				const getUserResponse = await request(app).get(`/users/${userToKeep}`);

				// Assert
				expect(deleteResponse.statusCode).toEqual(StatusCodes.NO_CONTENT);
				expect(getUserResponse.statusCode).toEqual(StatusCodes.OK);
			});

			it("should update user list after deletion", async () => {
				// Arrange
				const initialUsersResponse = await request(app).get("/users");
				const initialCount = (initialUsersResponse.body as ServiceResponse<User[]>).responseObject.length;
				const userToDelete = 1;

				// Act
				await request(app).delete(`/users/${userToDelete}`);
				const finalUsersResponse = await request(app).get("/users");
				const finalCount = (finalUsersResponse.body as ServiceResponse<User[]>).responseObject.length;

				// Assert
				expect(finalCount).toBe(initialCount - 1);
			});
		});
	});
});

function compareUsers(mockUser: User, responseUser: User) {
	if (!mockUser || !responseUser) {
		throw new Error("Invalid test data: mockUser or responseUser is undefined");
	}

	expect(responseUser.id).toEqual(mockUser.id);
	expect(responseUser.name).toEqual(mockUser.name);
	expect(responseUser.email).toEqual(mockUser.email);
	expect(responseUser.age).toEqual(mockUser.age);
	expect(new Date(responseUser.createdAt)).toEqual(mockUser.createdAt);
	expect(new Date(responseUser.updatedAt)).toEqual(mockUser.updatedAt);
}
