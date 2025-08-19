import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { CreateLoftyViewRequest, LoftyView } from "./loftyViewModel";
import { loftyViewRepository } from "./loftyViewRepository";

export class LoftyViewService {
	// Retrieve all lofty views
	async findAll(): Promise<ServiceResponse<LoftyView[] | null>> {
		try {
			const loftyViews = await loftyViewRepository.findAllAsync();
			return ServiceResponse.success<LoftyView[]>("Lofty views found", loftyViews);
		} catch (ex) {
			const errorMessage = `Error finding all lofty views: ${(ex as Error).message}`;
			return ServiceResponse.failure(
				"An error occurred while retrieving lofty views.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Retrieve a single lofty view by ID
	async findById(id: number): Promise<ServiceResponse<LoftyView | null>> {
		try {
			const loftyView = await loftyViewRepository.findByIdAsync(id);
			if (!loftyView) {
				return ServiceResponse.failure("Lofty view not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<LoftyView>("Lofty view found", loftyView);
		} catch (ex) {
			const errorMessage = `Error finding lofty view with id ${id}: ${(ex as Error).message}`;
			return ServiceResponse.failure(
				"An error occurred while finding lofty view.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Create a new lofty view
	async create(viewData: CreateLoftyViewRequest["body"]): Promise<ServiceResponse<LoftyView | null>> {
		try {
			const newLoftyView = await loftyViewRepository.createAsync(viewData);
			return ServiceResponse.success<LoftyView>("Lofty view created successfully", newLoftyView, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating lofty view: ${(ex as Error).message}`;
			return ServiceResponse.failure(
				"An error occurred while creating the lofty view.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const loftyViewService = new LoftyViewService();
