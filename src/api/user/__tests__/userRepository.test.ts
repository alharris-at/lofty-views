import type { User } from "@/api/user/userModel";
import { UserRepository, users } from "@/api/user/userRepository";

describe("UserRepository", () => {
	let userRepository: UserRepository;
	let originalUsers: User[];

	beforeEach(() => {
		userRepository = new UserRepository();
		// Save original users array and reset to known state
		originalUsers = [...users];
		users.length = 0;
		users.push(
			{
				id: 1,
				name: "Alice",
				email: "alice@example.com",
				age: 42,
				createdAt: new Date("2025-01-01T00:00:00.000Z"),
				updatedAt: new Date("2025-01-01T00:00:00.000Z"),
			},
			{
				id: 2,
				name: "Bob",
				email: "bob@example.com",
				age: 25,
				createdAt: new Date("2025-01-01T00:00:00.000Z"),
				updatedAt: new Date("2025-01-01T00:00:00.000Z"),
			},
		);
	});

	afterEach(() => {
		// Restore original users array
		users.length = 0;
		users.push(...originalUsers);
	});

	describe("createAsync", () => {
		describe("ID generation", () => {
			it("should generate sequential IDs starting from max existing ID + 1", async () => {
				// Arrange
				const userData = { name: "Charlie", email: "charlie@example.com", age: 30 };

				// Act
				const newUser = await userRepository.createAsync(userData);

				// Assert
				expect(newUser.id).toBe(3); // Max existing ID (2) + 1
			});

			it("should generate ID 1 when users array is empty", async () => {
				// Arrange
				users.length = 0; // Clear all users
				const userData = { name: "First User", email: "first@example.com", age: 25 };

				// Act
				const newUser = await userRepository.createAsync(userData);

				// Assert
				expect(newUser.id).toBe(1);
			});

			it("should generate correct ID when there are gaps in existing IDs", async () => {
				// Arrange
				users.length = 0;
				users.push({
					id: 5,
					name: "User Five",
					email: "five@example.com",
					age: 30,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
				const userData = { name: "New User", email: "new@example.com", age: 25 };

				// Act
				const newUser = await userRepository.createAsync(userData);

				// Assert
				expect(newUser.id).toBe(6); // Max existing ID (5) + 1
			});
		});

		describe("email uniqueness", () => {
			it("should throw error when creating user with duplicate email", async () => {
				// Arrange
				const userData = { name: "Alice Duplicate", email: "alice@example.com", age: 30 };

				// Act & Assert
				await expect(userRepository.createAsync(userData)).rejects.toThrow("User with this email already exists");
			});

			it("should throw error when creating user with duplicate email (case insensitive)", async () => {
				// Arrange
				const userData = { name: "Alice Duplicate", email: "ALICE@EXAMPLE.COM", age: 30 };

				// Act & Assert
				await expect(userRepository.createAsync(userData)).rejects.toThrow("User with this email already exists");
			});

			it("should allow creating user with unique email", async () => {
				// Arrange
				const userData = { name: "Charlie", email: "charlie@example.com", age: 30 };

				// Act
				const newUser = await userRepository.createAsync(userData);

				// Assert
				expect(newUser.email).toBe(userData.email);
			});
		});

		describe("data persistence", () => {
			it("should persist user data correctly", async () => {
				// Arrange
				const userData = { name: "David", email: "david@example.com", age: 35 };
				const initialUserCount = users.length;

				// Act
				const newUser = await userRepository.createAsync(userData);

				// Assert
				expect(users.length).toBe(initialUserCount + 1);
				expect(users).toContain(newUser);
			});

			it("should set correct user properties", async () => {
				// Arrange
				const userData = { name: "Emma", email: "emma@example.com", age: 28 };

				// Act
				const newUser = await userRepository.createAsync(userData);

				// Assert
				expect(newUser.name).toBe(userData.name);
				expect(newUser.email).toBe(userData.email);
				expect(newUser.age).toBe(userData.age);
				expect(newUser.id).toBeDefined();
				expect(newUser.createdAt).toBeInstanceOf(Date);
				expect(newUser.updatedAt).toBeInstanceOf(Date);
			});

			it("should set createdAt and updatedAt to same timestamp", async () => {
				// Arrange
				const userData = { name: "Frank", email: "frank@example.com", age: 40 };

				// Act
				const newUser = await userRepository.createAsync(userData);

				// Assert
				expect(newUser.createdAt.getTime()).toBe(newUser.updatedAt.getTime());
			});

			it("should set timestamps to current time", async () => {
				// Arrange
				const userData = { name: "Grace", email: "grace@example.com", age: 32 };
				const beforeCreate = new Date();

				// Act
				const newUser = await userRepository.createAsync(userData);
				const afterCreate = new Date();

				// Assert
				expect(newUser.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
				expect(newUser.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
				expect(newUser.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
				expect(newUser.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
			});

			it("should not modify original userData object", async () => {
				// Arrange
				const userData = { name: "Henry", email: "henry@example.com", age: 45 };
				const originalUserData = { ...userData };

				// Act
				await userRepository.createAsync(userData);

				// Assert
				expect(userData).toEqual(originalUserData);
			});
		});
	});

	describe("deleteByIdAsync", () => {
		describe("successful deletion", () => {
			it("should delete existing user and return true", async () => {
				// Arrange
				const initialUserCount = users.length;
				const userToDelete = users[0];

				// Act
				const result = await userRepository.deleteByIdAsync(userToDelete.id);

				// Assert
				expect(result).toBe(true);
				expect(users.length).toBe(initialUserCount - 1);
				expect(users.find((user) => user.id === userToDelete.id)).toBeUndefined();
			});

			it("should delete correct user when multiple users exist", async () => {
				// Arrange
				const userToDelete = users[1]; // Delete Bob
				const userToKeep = users[0]; // Keep Alice

				// Act
				const result = await userRepository.deleteByIdAsync(userToDelete.id);

				// Assert
				expect(result).toBe(true);
				expect(users.length).toBe(1);
				expect(users.find((user) => user.id === userToDelete.id)).toBeUndefined();
				expect(users.find((user) => user.id === userToKeep.id)).toBeDefined();
			});

			it("should delete user from middle of array", async () => {
				// Arrange - Add a third user
				users.push({
					id: 3,
					name: "Charlie",
					email: "charlie@example.com",
					age: 30,
					createdAt: new Date("2025-01-01T00:00:00.000Z"),
					updatedAt: new Date("2025-01-01T00:00:00.000Z"),
				});
				const userToDelete = users[1]; // Delete middle user (Bob)

				// Act
				const result = await userRepository.deleteByIdAsync(userToDelete.id);

				// Assert
				expect(result).toBe(true);
				expect(users.length).toBe(2);
				expect(users[0].name).toBe("Alice");
				expect(users[1].name).toBe("Charlie");
			});
		});

		describe("failed deletion", () => {
			it("should return false when user does not exist", async () => {
				// Arrange
				const nonExistentId = 999;
				const initialUserCount = users.length;

				// Act
				const result = await userRepository.deleteByIdAsync(nonExistentId);

				// Assert
				expect(result).toBe(false);
				expect(users.length).toBe(initialUserCount);
			});

			it("should return false when trying to delete from empty array", async () => {
				// Arrange
				users.length = 0; // Clear all users

				// Act
				const result = await userRepository.deleteByIdAsync(1);

				// Assert
				expect(result).toBe(false);
				expect(users.length).toBe(0);
			});

			it("should not modify array when user not found", async () => {
				// Arrange
				const originalUsers = [...users];

				// Act
				const result = await userRepository.deleteByIdAsync(999);

				// Assert
				expect(result).toBe(false);
				expect(users).toEqual(originalUsers);
			});
		});

		describe("edge cases", () => {
			it("should handle deletion of user with ID 0", async () => {
				// Arrange
				users.push({
					id: 0,
					name: "Zero User",
					email: "zero@example.com",
					age: 25,
					createdAt: new Date("2025-01-01T00:00:00.000Z"),
					updatedAt: new Date("2025-01-01T00:00:00.000Z"),
				});

				// Act
				const result = await userRepository.deleteByIdAsync(0);

				// Assert
				expect(result).toBe(true);
				expect(users.find((user) => user.id === 0)).toBeUndefined();
			});

			it("should handle negative ID gracefully", async () => {
				// Arrange
				const initialUserCount = users.length;

				// Act
				const result = await userRepository.deleteByIdAsync(-1);

				// Assert
				expect(result).toBe(false);
				expect(users.length).toBe(initialUserCount);
			});
		});
	});
});
