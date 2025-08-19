import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { Mock } from "vitest";
import { userController } from "@/api/user/userController";
import type { User } from "@/api/user/userModel";
import { userService } from "@/api/user/userService";
import { ServiceResponse } from "@/common/models/serviceResponse";

// Mock the userService module
vi.mock("@/api/user/userService", () => ({
	userService: {
		create: vi.fn(),
		deleteById: vi.fn(),
		findAll: vi.fn(),
		findById: vi.fn(),
	},
}));

describe("UserController", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: Mock;
	let mockJson: Mock;
	let mockStatus: Mock;
	let mockSend: Mock;

	beforeEach(() => {
		mockJson = vi.fn();
		mockStatus = vi.fn().mockReturnThis();
		mockSend = vi.fn();
		mockNext = vi.fn();

		mockResponse = {
			status: mockStatus,
			json: mockJson,
			send: mockSend,
		};

		mockRequest = {};

		// Reset all mocks
		vi.clearAllMocks();
	});

	describe("createUser", () => {
		describe("success cases", () => {
			it("should create user and return 201 status", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "john@example.com", age: 30 };
				const mockCreatedUser: User = {
					id: 1,
					...userData,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				const successResponse = ServiceResponse.success<User>(
					"User created successfully",
					mockCreatedUser,
					StatusCodes.CREATED,
				);

				mockRequest.body = userData;
				(userService.create as Mock).mockResolvedValue(successResponse);

				// Act
				await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.create).toHaveBeenCalledWith(userData);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.CREATED);
				expect(mockSend).toHaveBeenCalledWith(successResponse);
			});

			it("should handle user creation with minimal valid data", async () => {
				// Arrange
				const userData = { name: "A", email: "a@b.co", age: 0 };
				const mockCreatedUser: User = {
					id: 2,
					...userData,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				const successResponse = ServiceResponse.success<User>(
					"User created successfully",
					mockCreatedUser,
					StatusCodes.CREATED,
				);

				mockRequest.body = userData;
				(userService.create as Mock).mockResolvedValue(successResponse);

				// Act
				await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.create).toHaveBeenCalledWith(userData);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.CREATED);
				expect(mockSend).toHaveBeenCalledWith(successResponse);
			});
		});

		describe("validation error cases", () => {
			it("should handle validation errors from service", async () => {
				// Arrange
				const userData = { name: "", email: "invalid-email", age: -1 };
				const errorResponse = ServiceResponse.failure("Invalid input", null, StatusCodes.BAD_REQUEST);

				mockRequest.body = userData;
				(userService.create as Mock).mockResolvedValue(errorResponse);

				// Act
				await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.create).toHaveBeenCalledWith(userData);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
				expect(mockSend).toHaveBeenCalledWith(errorResponse);
			});
		});

		describe("conflict error cases", () => {
			it("should handle duplicate email conflicts", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "existing@example.com", age: 30 };
				const conflictResponse = ServiceResponse.failure(
					"User with this email already exists",
					null,
					StatusCodes.CONFLICT,
				);

				mockRequest.body = userData;
				(userService.create as Mock).mockResolvedValue(conflictResponse);

				// Act
				await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.create).toHaveBeenCalledWith(userData);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.CONFLICT);
				expect(mockSend).toHaveBeenCalledWith(conflictResponse);
			});
		});

		describe("system error cases", () => {
			it("should handle internal server errors", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "john@example.com", age: 30 };
				const errorResponse = ServiceResponse.failure(
					"An error occurred while creating user.",
					null,
					StatusCodes.INTERNAL_SERVER_ERROR,
				);

				mockRequest.body = userData;
				(userService.create as Mock).mockResolvedValue(errorResponse);

				// Act
				await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.create).toHaveBeenCalledWith(userData);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
				expect(mockSend).toHaveBeenCalledWith(errorResponse);
			});

			it("should handle service throwing unexpected errors", async () => {
				// Arrange
				const userData = { name: "John Doe", email: "john@example.com", age: 30 };
				mockRequest.body = userData;
				(userService.create as Mock).mockRejectedValue(new Error("Unexpected error"));

				// Act & Assert
				await expect(
					userController.createUser(mockRequest as Request, mockResponse as Response, mockNext),
				).rejects.toThrow("Unexpected error");
			});
		});

		describe("request handling", () => {
			it("should pass request body to service correctly", async () => {
				// Arrange
				const userData = { name: "Test User", email: "test@example.com", age: 25 };
				const mockCreatedUser: User = {
					id: 3,
					...userData,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				const successResponse = ServiceResponse.success<User>(
					"User created successfully",
					mockCreatedUser,
					StatusCodes.CREATED,
				);

				mockRequest.body = userData;
				(userService.create as Mock).mockResolvedValue(successResponse);

				// Act
				await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.create).toHaveBeenCalledTimes(1);
				expect(userService.create).toHaveBeenCalledWith(userData);
			});

			it("should handle empty request body", async () => {
				// Arrange
				const userData = {};
				const errorResponse = ServiceResponse.failure("Invalid input", null, StatusCodes.BAD_REQUEST);

				mockRequest.body = userData;
				(userService.create as Mock).mockResolvedValue(errorResponse);

				// Act
				await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.create).toHaveBeenCalledWith(userData);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
				expect(mockSend).toHaveBeenCalledWith(errorResponse);
			});
		});
	});

	describe("deleteUser", () => {
		describe("success cases", () => {
			it("should delete user and return 204 status", async () => {
				// Arrange
				const userId = "1";
				const successResponse = ServiceResponse.success<null>(
					"User deleted successfully",
					null,
					StatusCodes.NO_CONTENT,
				);

				mockRequest.params = { id: userId };
				(userService.deleteById as Mock).mockResolvedValue(successResponse);

				// Act
				await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.deleteById).toHaveBeenCalledWith(1);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
				expect(mockSend).toHaveBeenCalledWith(successResponse);
			});

			it("should handle deletion of user with ID 0", async () => {
				// Arrange
				const userId = "0";
				const successResponse = ServiceResponse.success<null>(
					"User deleted successfully",
					null,
					StatusCodes.NO_CONTENT,
				);

				mockRequest.params = { id: userId };
				(userService.deleteById as Mock).mockResolvedValue(successResponse);

				// Act
				await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.deleteById).toHaveBeenCalledWith(0);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
				expect(mockSend).toHaveBeenCalledWith(successResponse);
			});

			it("should handle deletion of user with large ID", async () => {
				// Arrange
				const userId = "999999";
				const successResponse = ServiceResponse.success<null>(
					"User deleted successfully",
					null,
					StatusCodes.NO_CONTENT,
				);

				mockRequest.params = { id: userId };
				(userService.deleteById as Mock).mockResolvedValue(successResponse);

				// Act
				await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.deleteById).toHaveBeenCalledWith(999999);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
				expect(mockSend).toHaveBeenCalledWith(successResponse);
			});
		});

		describe("not found cases", () => {
			it("should handle user not found and return 404 status", async () => {
				// Arrange
				const userId = "999";
				const notFoundResponse = ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);

				mockRequest.params = { id: userId };
				(userService.deleteById as Mock).mockResolvedValue(notFoundResponse);

				// Act
				await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.deleteById).toHaveBeenCalledWith(999);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
				expect(mockSend).toHaveBeenCalledWith(notFoundResponse);
			});

			it("should handle negative ID gracefully", async () => {
				// Arrange
				const userId = "-1";
				const notFoundResponse = ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);

				mockRequest.params = { id: userId };
				(userService.deleteById as Mock).mockResolvedValue(notFoundResponse);

				// Act
				await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.deleteById).toHaveBeenCalledWith(-1);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
				expect(mockSend).toHaveBeenCalledWith(notFoundResponse);
			});
		});

		describe("system error cases", () => {
			it("should handle internal server errors", async () => {
				// Arrange
				const userId = "1";
				const errorResponse = ServiceResponse.failure(
					"An error occurred while deleting user.",
					null,
					StatusCodes.INTERNAL_SERVER_ERROR,
				);

				mockRequest.params = { id: userId };
				(userService.deleteById as Mock).mockResolvedValue(errorResponse);

				// Act
				await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.deleteById).toHaveBeenCalledWith(1);
				expect(mockStatus).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
				expect(mockSend).toHaveBeenCalledWith(errorResponse);
			});

			it("should handle service throwing unexpected errors", async () => {
				// Arrange
				const userId = "1";
				mockRequest.params = { id: userId };
				(userService.deleteById as Mock).mockRejectedValue(new Error("Unexpected error"));

				// Act & Assert
				await expect(
					userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext),
				).rejects.toThrow("Unexpected error");
			});
		});

		describe("request handling", () => {
			it("should parse ID parameter correctly", async () => {
				// Arrange
				const userId = "42";
				const successResponse = ServiceResponse.success<null>(
					"User deleted successfully",
					null,
					StatusCodes.NO_CONTENT,
				);

				mockRequest.params = { id: userId };
				(userService.deleteById as Mock).mockResolvedValue(successResponse);

				// Act
				await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.deleteById).toHaveBeenCalledTimes(1);
				expect(userService.deleteById).toHaveBeenCalledWith(42);
			});

			it("should handle string ID conversion to number", async () => {
				// Arrange
				const userId = "123";
				const successResponse = ServiceResponse.success<null>(
					"User deleted successfully",
					null,
					StatusCodes.NO_CONTENT,
				);

				mockRequest.params = { id: userId };
				(userService.deleteById as Mock).mockResolvedValue(successResponse);

				// Act
				await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(userService.deleteById).toHaveBeenCalledWith(123);
				expect(typeof (userService.deleteById as Mock).mock.calls[0][0]).toBe("number");
			});

			it("should handle missing params object", async () => {
				// Arrange
				mockRequest.params = undefined;

				// Act & Assert
				await expect(
					userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext),
				).rejects.toThrow("Cannot read properties of undefined (reading 'id')");
			});
		});
	});
});
