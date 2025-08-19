import { StatusCodes } from "http-status-codes";
import type { Mock } from "vitest";

import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { UserService } from "@/api/user/userService";

vi.mock("@/api/user/userRepository");

describe("userService", () => {
	let userServiceInstance: UserService;
	let userRepositoryInstance: UserRepository;

	const mockUsers: User[] = [
		{
			id: 1,
			name: "Alice",
			email: "alice@example.com",
			age: 42,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: 2,
			name: "Bob",
			email: "bob@example.com",
			age: 21,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	beforeEach(() => {
		userRepositoryInstance = new UserRepository();
		userServiceInstance = new UserService(userRepositoryInstance);
	});

	describe("findAll", () => {
		it("return all users", async () => {
			// Arrange
			(userRepositoryInstance.findAllAsync as Mock).mockReturnValue(mockUsers);

			// Act
			const result = await userServiceInstance.findAll();

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.OK);
			expect(result.success).toBeTruthy();
			expect(result.message).equals("Users found");
			expect(result.responseObject).toEqual(mockUsers);
		});

		it("returns a not found error for no users found", async () => {
			// Arrange
			(userRepositoryInstance.findAllAsync as Mock).mockReturnValue(null);

			// Act
			const result = await userServiceInstance.findAll();

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(result.success).toBeFalsy();
			expect(result.message).equals("No Users found");
			expect(result.responseObject).toBeNull();
		});

		it("handles errors for findAllAsync", async () => {
			// Arrange
			(userRepositoryInstance.findAllAsync as Mock).mockRejectedValue(new Error("Database error"));

			// Act
			const result = await userServiceInstance.findAll();

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(result.success).toBeFalsy();
			expect(result.message).equals("An error occurred while retrieving users.");
			expect(result.responseObject).toBeNull();
		});
	});

	describe("findById", () => {
		it("returns a user for a valid ID", async () => {
			// Arrange
			const testId = 1;
			const mockUser = mockUsers.find((user) => user.id === testId);
			(userRepositoryInstance.findByIdAsync as Mock).mockReturnValue(mockUser);

			// Act
			const result = await userServiceInstance.findById(testId);

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.OK);
			expect(result.success).toBeTruthy();
			expect(result.message).equals("User found");
			expect(result.responseObject).toEqual(mockUser);
		});

		it("handles errors for findByIdAsync", async () => {
			// Arrange
			const testId = 1;
			(userRepositoryInstance.findByIdAsync as Mock).mockRejectedValue(new Error("Database error"));

			// Act
			const result = await userServiceInstance.findById(testId);

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(result.success).toBeFalsy();
			expect(result.message).equals("An error occurred while finding user.");
			expect(result.responseObject).toBeNull();
		});

		it("returns a not found error for non-existent ID", async () => {
			// Arrange
			const testId = 1;
			(userRepositoryInstance.findByIdAsync as Mock).mockReturnValue(null);

			// Act
			const result = await userServiceInstance.findById(testId);

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(result.success).toBeFalsy();
			expect(result.message).equals("User not found");
			expect(result.responseObject).toBeNull();
		});
	});

	describe("create", () => {
		describe("success cases", () => {
			it("creates a new user successfully with valid data", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "john@example.com", age: 30 };
				const mockCreatedUser: User = {
					id: 3,
					...userData,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				(userRepositoryInstance.createAsync as Mock).mockReturnValue(mockCreatedUser);

				// Act
				const result = await userServiceInstance.create(userData);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.CREATED);
				expect(result.success).toBeTruthy();
				expect(result.message).equals("User created successfully");
				expect(result.responseObject).toEqual(mockCreatedUser);
				expect(userRepositoryInstance.createAsync).toHaveBeenCalledWith(userData);
			});

			it("creates user with minimum valid age (0)", async () => {
				// Arrange
				const userData = { name: "Baby User", email: "baby@example.com", age: 0 };
				const mockCreatedUser: User = {
					id: 4,
					...userData,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				(userRepositoryInstance.createAsync as Mock).mockReturnValue(mockCreatedUser);

				// Act
				const result = await userServiceInstance.create(userData);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.CREATED);
				expect(result.success).toBeTruthy();
				expect(result.message).equals("User created successfully");
				expect(result.responseObject).toEqual(mockCreatedUser);
			});

			it("creates user with long name", async () => {
				// Arrange
				const userData = {
					name: "Very Long Name That Should Still Be Valid",
					email: "longname@example.com",
					age: 25,
				};
				const mockCreatedUser: User = {
					id: 5,
					...userData,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				(userRepositoryInstance.createAsync as Mock).mockReturnValue(mockCreatedUser);

				// Act
				const result = await userServiceInstance.create(userData);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.CREATED);
				expect(result.success).toBeTruthy();
				expect(result.message).equals("User created successfully");
				expect(result.responseObject).toEqual(mockCreatedUser);
			});
		});

		describe("validation errors", () => {
			it("handles repository validation errors gracefully", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "john@example.com", age: 30 };
				(userRepositoryInstance.createAsync as Mock).mockRejectedValue(new Error("Validation failed"));

				// Act
				const result = await userServiceInstance.create(userData);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("An error occurred while creating user.");
				expect(result.responseObject).toBeNull();
			});
		});

		describe("conflict errors", () => {
			it("returns a conflict error for duplicate email", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "john@example.com", age: 30 };
				(userRepositoryInstance.createAsync as Mock).mockRejectedValue(
					new Error("User with this email already exists"),
				);

				// Act
				const result = await userServiceInstance.create(userData);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.CONFLICT);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("User with this email already exists");
				expect(result.responseObject).toBeNull();
			});

			it("returns conflict error for email already exists message variation", async () => {
				// Arrange
				const userData = { name: "Jane Doe", email: "jane@example.com", age: 25 };
				(userRepositoryInstance.createAsync as Mock).mockRejectedValue(new Error("email already exists in system"));

				// Act
				const result = await userServiceInstance.create(userData);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.CONFLICT);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("User with this email already exists");
				expect(result.responseObject).toBeNull();
			});
		});

		describe("system errors", () => {
			it("handles general errors during user creation", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "john@example.com", age: 30 };
				(userRepositoryInstance.createAsync as Mock).mockRejectedValue(new Error("Database connection failed"));

				// Act
				const result = await userServiceInstance.create(userData);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("An error occurred while creating user.");
				expect(result.responseObject).toBeNull();
			});

			it("handles network timeout errors", async () => {
				// Arrange
				const userData = { name: "Network User", email: "network@example.com", age: 35 };
				(userRepositoryInstance.createAsync as Mock).mockRejectedValue(new Error("Network timeout"));

				// Act
				const result = await userServiceInstance.create(userData);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("An error occurred while creating user.");
				expect(result.responseObject).toBeNull();
			});

			it("handles unexpected null/undefined errors", async () => {
				// Arrange
				const userData = { name: "Null User", email: "null@example.com", age: 40 };
				(userRepositoryInstance.createAsync as Mock).mockRejectedValue(new Error("Unexpected null reference"));

				// Act
				const result = await userServiceInstance.create(userData);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("An error occurred while creating user.");
				expect(result.responseObject).toBeNull();
			});
		});
	});

	describe("deleteById", () => {
		describe("success cases", () => {
			it("deletes an existing user successfully", async () => {
				// Arrange
				const testId = 1;
				(userRepositoryInstance.deleteByIdAsync as Mock).mockReturnValue(true);

				// Act
				const result = await userServiceInstance.deleteById(testId);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.NO_CONTENT);
				expect(result.success).toBeTruthy();
				expect(result.message).equals("User deleted successfully");
				expect(result.responseObject).toBeNull();
				expect(userRepositoryInstance.deleteByIdAsync).toHaveBeenCalledWith(testId);
			});

			it("deletes user with ID 0", async () => {
				// Arrange
				const testId = 0;
				(userRepositoryInstance.deleteByIdAsync as Mock).mockReturnValue(true);

				// Act
				const result = await userServiceInstance.deleteById(testId);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.NO_CONTENT);
				expect(result.success).toBeTruthy();
				expect(result.message).equals("User deleted successfully");
				expect(result.responseObject).toBeNull();
			});

			it("deletes user with large ID", async () => {
				// Arrange
				const testId = 999999;
				(userRepositoryInstance.deleteByIdAsync as Mock).mockReturnValue(true);

				// Act
				const result = await userServiceInstance.deleteById(testId);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.NO_CONTENT);
				expect(result.success).toBeTruthy();
				expect(result.message).equals("User deleted successfully");
				expect(result.responseObject).toBeNull();
			});
		});

		describe("not found cases", () => {
			it("returns not found error when user does not exist", async () => {
				// Arrange
				const testId = 999;
				(userRepositoryInstance.deleteByIdAsync as Mock).mockReturnValue(false);

				// Act
				const result = await userServiceInstance.deleteById(testId);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("User not found");
				expect(result.responseObject).toBeNull();
				expect(userRepositoryInstance.deleteByIdAsync).toHaveBeenCalledWith(testId);
			});

			it("returns not found error for negative ID", async () => {
				// Arrange
				const testId = -1;
				(userRepositoryInstance.deleteByIdAsync as Mock).mockReturnValue(false);

				// Act
				const result = await userServiceInstance.deleteById(testId);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("User not found");
				expect(result.responseObject).toBeNull();
			});
		});

		describe("system errors", () => {
			it("handles database errors during deletion", async () => {
				// Arrange
				const testId = 1;
				(userRepositoryInstance.deleteByIdAsync as Mock).mockRejectedValue(new Error("Database connection failed"));

				// Act
				const result = await userServiceInstance.deleteById(testId);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("An error occurred while deleting user.");
				expect(result.responseObject).toBeNull();
			});

			it("handles network timeout errors", async () => {
				// Arrange
				const testId = 2;
				(userRepositoryInstance.deleteByIdAsync as Mock).mockRejectedValue(new Error("Network timeout"));

				// Act
				const result = await userServiceInstance.deleteById(testId);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("An error occurred while deleting user.");
				expect(result.responseObject).toBeNull();
			});

			it("handles unexpected errors", async () => {
				// Arrange
				const testId = 3;
				(userRepositoryInstance.deleteByIdAsync as Mock).mockRejectedValue(new Error("Unexpected error occurred"));

				// Act
				const result = await userServiceInstance.deleteById(testId);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("An error occurred while deleting user.");
				expect(result.responseObject).toBeNull();
			});

			it("handles null/undefined errors", async () => {
				// Arrange
				const testId = 4;
				(userRepositoryInstance.deleteByIdAsync as Mock).mockRejectedValue(new Error("Cannot read property of null"));

				// Act
				const result = await userServiceInstance.deleteById(testId);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("An error occurred while deleting user.");
				expect(result.responseObject).toBeNull();
			});
		});

		describe("edge cases", () => {
			it("handles repository returning undefined instead of boolean", async () => {
				// Arrange
				const testId = 1;
				(userRepositoryInstance.deleteByIdAsync as Mock).mockReturnValue(undefined);

				// Act
				const result = await userServiceInstance.deleteById(testId);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("User not found");
				expect(result.responseObject).toBeNull();
			});

			it("handles repository returning null instead of boolean", async () => {
				// Arrange
				const testId = 1;
				(userRepositoryInstance.deleteByIdAsync as Mock).mockReturnValue(null);

				// Act
				const result = await userServiceInstance.deleteById(testId);

				// Assert
				expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
				expect(result.success).toBeFalsy();
				expect(result.message).equals("User not found");
				expect(result.responseObject).toBeNull();
			});
		});
	});
});
