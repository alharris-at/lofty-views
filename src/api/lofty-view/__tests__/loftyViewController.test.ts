import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { loftyViewController } from "../loftyViewController";
import type { LoftyView } from "../loftyViewModel";

// Mock the service
vi.mock("../loftyViewService", () => ({
	loftyViewService: {
		findAll: vi.fn(),
		findById: vi.fn(),
		create: vi.fn(),
	},
}));

import { loftyViewService } from "../loftyViewService";

describe("LoftyViewController", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: Mock;
	let mockStatus: Mock;
	let mockSend: Mock;

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
		mockStatus = vi.fn().mockReturnThis();
		mockSend = vi.fn();
		mockRequest = {};
		mockResponse = {
			status: mockStatus,
			send: mockSend,
		};
		mockNext = vi.fn();

		// Reset all mocks
		vi.clearAllMocks();
	});

	describe("getLoftyViews", () => {
		it("should call loftyViewService.findAll and send response", async () => {
			const mockServiceResponse = ServiceResponse.success("Success", [mockLoftyView]);
			(loftyViewService.findAll as Mock).mockResolvedValue(mockServiceResponse);

			await loftyViewController.getLoftyViews(mockRequest as Request, mockResponse as Response, mockNext);

			expect(loftyViewService.findAll).toHaveBeenCalledOnce();
			expect(mockStatus).toHaveBeenCalledWith(mockServiceResponse.statusCode);
			expect(mockSend).toHaveBeenCalledWith(mockServiceResponse);
		});
	});

	describe("getLoftyView", () => {
		it("should call loftyViewService.findById with parsed ID and send response", async () => {
			mockRequest.params = { id: "1" };
			const mockServiceResponse = ServiceResponse.success("Success", mockLoftyView);
			(loftyViewService.findById as Mock).mockResolvedValue(mockServiceResponse);

			await loftyViewController.getLoftyView(mockRequest as Request, mockResponse as Response, mockNext);

			expect(loftyViewService.findById).toHaveBeenCalledWith(1);
			expect(mockStatus).toHaveBeenCalledWith(mockServiceResponse.statusCode);
			expect(mockSend).toHaveBeenCalledWith(mockServiceResponse);
		});

		it("should handle string ID parameter correctly", async () => {
			mockRequest.params = { id: "42" };
			const mockServiceResponse = ServiceResponse.success("Success", mockLoftyView);
			(loftyViewService.findById as Mock).mockResolvedValue(mockServiceResponse);

			await loftyViewController.getLoftyView(mockRequest as Request, mockResponse as Response, mockNext);

			expect(loftyViewService.findById).toHaveBeenCalledWith(42);
		});
	});

	describe("createLoftyView", () => {
		it("should call loftyViewService.create with request body and send response", async () => {
			const createData = {
				name: "New View",
				description: "A new view",
				location: "New Location",
			};
			mockRequest.body = createData;
			const mockServiceResponse = ServiceResponse.success("Created", mockLoftyView, StatusCodes.CREATED);
			(loftyViewService.create as Mock).mockResolvedValue(mockServiceResponse);

			await loftyViewController.createLoftyView(mockRequest as Request, mockResponse as Response, mockNext);

			expect(loftyViewService.create).toHaveBeenCalledWith(createData);
			expect(mockStatus).toHaveBeenCalledWith(mockServiceResponse.statusCode);
			expect(mockSend).toHaveBeenCalledWith(mockServiceResponse);
		});
	});
});
