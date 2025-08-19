import type { User } from "@/api/user/userModel";

export const users: User[] = [
	{
		id: 1,
		name: "Alice",
		email: "alice@example.com",
		age: 42,
		createdAt: new Date(),
		updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
	},
	{
		id: 2,
		name: "Robert",
		email: "Robert@example.com",
		age: 21,
		createdAt: new Date(),
		updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
	},
];

export class UserRepository {
	async findAllAsync(): Promise<User[]> {
		return users;
	}

	async findByIdAsync(id: number): Promise<User | null> {
		return users.find((user) => user.id === id) || null;
	}

	async createAsync(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
		// Check for email uniqueness (case-insensitive)
		const existingUser = users.find((user) => user.email.toLowerCase() === userData.email.toLowerCase());
		if (existingUser) {
			throw new Error("User with this email already exists");
		}

		// Generate new ID (find max ID and increment)
		const maxId = users.length > 0 ? Math.max(...users.map((user) => user.id)) : 0;
		const newId = maxId + 1;

		// Create new user with timestamps
		const now = new Date();
		const newUser: User = {
			id: newId,
			name: userData.name,
			email: userData.email,
			age: userData.age,
			createdAt: now,
			updatedAt: now,
		};

		// Add to users array
		users.push(newUser);

		return newUser;
	}

	async deleteByIdAsync(id: number): Promise<boolean> {
		const userIndex = users.findIndex((user) => user.id === id);
		if (userIndex === -1) {
			return false; // User not found
		}

		// Remove user from array
		users.splice(userIndex, 1);
		return true; // User successfully deleted
	}
}
