import type { LoftyView } from "./loftyViewModel";

// In-memory storage for lofty views
const loftyViews: LoftyView[] = [
	{
		id: 1,
		name: "Golden Gate Bridge",
		description: "Iconic suspension bridge in San Francisco",
		location: "San Francisco, CA",
		hearts: 42,
		createdAt: new Date("2024-01-15T10:30:00Z"),
		updatedAt: new Date("2024-01-15T10:30:00Z"),
	},
	{
		id: 2,
		name: "Grand Canyon Sunrise",
		description: "Breathtaking sunrise view from the South Rim",
		location: "Grand Canyon National Park, AZ",
		hearts: 87,
		createdAt: new Date("2024-02-20T06:15:00Z"),
		updatedAt: new Date("2024-02-20T06:15:00Z"),
	},
	{
		id: 3,
		name: "Mount Fuji",
		location: "Honshu, Japan",
		hearts: 156,
		createdAt: new Date("2024-03-10T14:45:00Z"),
		updatedAt: new Date("2024-03-10T14:45:00Z"),
	},
];

export class LoftyViewRepository {
	// Method to reset data for testing
	resetData(): void {
		loftyViews.length = 0;
		loftyViews.push(
			{
				id: 1,
				name: "Golden Gate Bridge",
				description: "Iconic suspension bridge in San Francisco",
				location: "San Francisco, CA",
				hearts: 42,
				createdAt: new Date("2024-01-15T10:30:00Z"),
				updatedAt: new Date("2024-01-15T10:30:00Z"),
			},
			{
				id: 2,
				name: "Grand Canyon Sunrise",
				description: "Breathtaking sunrise view from the South Rim",
				location: "Grand Canyon National Park, AZ",
				hearts: 87,
				createdAt: new Date("2024-02-20T06:15:00Z"),
				updatedAt: new Date("2024-02-20T06:15:00Z"),
			},
			{
				id: 3,
				name: "Mount Fuji",
				location: "Honshu, Japan",
				hearts: 156,
				createdAt: new Date("2024-03-10T14:45:00Z"),
				updatedAt: new Date("2024-03-10T14:45:00Z"),
			},
		);
	}

	async findAllAsync(): Promise<LoftyView[]> {
		return loftyViews;
	}

	async findByIdAsync(id: number): Promise<LoftyView | null> {
		const loftyView = loftyViews.find((view) => view.id === id);
		return loftyView || null;
	}

	async createAsync(viewData: Omit<LoftyView, "id" | "hearts" | "createdAt" | "updatedAt">): Promise<LoftyView> {
		// Generate new ID by finding max existing ID and incrementing
		const maxId = loftyViews.length > 0 ? Math.max(...loftyViews.map((view) => view.id)) : 0;
		const newId = maxId + 1;

		const now = new Date();
		const newLoftyView: LoftyView = {
			id: newId,
			name: viewData.name,
			description: viewData.description,
			location: viewData.location,
			hearts: 0, // Initialize hearts to 0 as per requirements
			createdAt: now,
			updatedAt: now,
		};

		loftyViews.push(newLoftyView);
		return newLoftyView;
	}
}

export const loftyViewRepository = new LoftyViewRepository();
