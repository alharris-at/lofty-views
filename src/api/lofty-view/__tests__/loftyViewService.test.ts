import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { LoftyView } from "../loftyViewModel";
import { LoftyViewService } from "../loftyViewService";

// Mock the repository
vi.mock("../loftyViewRepository", () => ({
	loftyViewRepository: {
		findAllAsync: vi.fn(),
		findByIdAsync: vi.fn(),
		createAsync: vi.fn(),
	},
}));

// Import the mocked repository
import { loftyViewRepository } from "../loftyViewRepository";

describe("LoftyViewService", () => {
	let service: LoftyViewService;
	let mockFindAllAsync: Mock;
	let mockFindByIdAsync: Mock;
	let mockCreateAsync: Mock;

	const mockLoftyView: LoftyView = {
		id: 1,
		name: "Test View",
		description: "A test view",
		location: "Test Location",
		hearts: 5,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-01T00:00:00Z"),
	};

	beforeEach(() => {
		service = new LoftyViewService();
		mockFindAllAsync = loftyViewRepository.findAllAsync as Mock;
		mockFindByIdAsync = loftyViewRepository.findByIdAsync as Mock;
		mockCreateAsync = loftyViewRepository.createAsync as Mock;

		// Reset all mocks
		vi.clearAllMocks();
	});

	describe("findAll", () => {
		it("should return all lofty views successfully", async () => {
			const mockViews = [mockLoftyView];
			mockFindAllAsync.mockResolvedValue(mockViews);

			const result = await service.findAll();

			expect(result.success).toBe(true);
			expect(result.message).toBe("Lofty views found");
			expect(result.responseObject).toEqual(mockViews);
			expect(result.statusCode).toBe(StatusCodes.OK);
		});

		it("should return empty array when no views exist", async () => {
			mockFindAllAsync.mockResolvedValue([]);

			const result = await service.findAll();

			expect(result.success).toBe(true);
			expect(result.message).toBe("Lofty views found");
			expect(result.responseObject).toEqual([]);
			expect(result.statusCode).toBe(StatusCodes.OK);
		});

		it("should handle repository errors", async () => {
			mockFindAllAsync.mockRejectedValue(new Error("Database error"));

			const result = await service.findAll();

			expect(result.success).toBe(false);
			expect(result.message).toBe("An error occurred while retrieving lofty views.");
			expect(result.responseObject).toBeNull();
			expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		});
	});

	describe("findById", () => {
		it("should return a lofty view when found", async () => {
			mockFindByIdAsync.mockResolvedValue(mockLoftyView);

			const result = await service.findById(1);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Lofty view found");
			expect(result.responseObject).toEqual(mockLoftyView);
			expect(result.statusCode).toBe(StatusCodes.OK);
			expect(mockFindByIdAsync).toHaveBeenCalledWith(1);
		});

		it("should return not found when lofty view does not exist", async () => {
			mockFindByIdAsync.mockResolvedValue(null);

			const result = await service.findById(999);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Lofty view not found");
			expect(result.responseObject).toBeNull();
			expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
		});

		it("should handle repository errors", async () => {
			mockFindByIdAsync.mockRejectedValue(new Error("Database error"));

			const result = await service.findById(1);

			expect(result.success).toBe(false);
			expect(result.message).toBe("An error occurred while finding lofty view.");
			expect(result.responseObject).toBeNull();
			expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		});
	});

	describe("create", () => {
		const createData = {
			name: "New View",
			description: "A new view",
			location: "New Location",
		};

		it("should create a lofty view successfully", async () => {
			mockCreateAsync.mockResolvedValue(mockLoftyView);

			const result = await service.create(createData);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Lofty view created successfully");
			expect(result.responseObject).toEqual(mockLoftyView);
			expect(result.statusCode).toBe(StatusCodes.CREATED);
			expect(mockCreateAsync).toHaveBeenCalledWith(createData);
		});

		it("should handle repository errors during creation", async () => {
			mockCreateAsync.mockRejectedValue(new Error("Creation failed"));

			const result = await service.create(createData);

			expect(result.success).toBe(false);
			expect(result.message).toBe("An error occurred while creating the lofty view.");
			expect(result.responseObject).toBeNull();
			expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		});
	});
});
