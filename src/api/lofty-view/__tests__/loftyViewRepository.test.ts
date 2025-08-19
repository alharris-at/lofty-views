import { beforeEach, describe, expect, it } from "vitest";
import type { LoftyView } from "../loftyViewModel";
import { LoftyViewRepository } from "../loftyViewRepository";

describe("LoftyViewRepository", () => {
	let repository: LoftyViewRepository;

	beforeEach(() => {
		repository = new LoftyViewRepository();
		repository.resetData(); // Reset data before each test
	});

	describe("findAllAsync", () => {
		it("should return all lofty views", async () => {
			const views = await repository.findAllAsync();

			expect(views).toHaveLength(3);
			expect(views[0]).toMatchObject({
				id: 1,
				name: "Golden Gate Bridge",
				description: "Iconic suspension bridge in San Francisco",
				location: "San Francisco, CA",
				hearts: 42,
			});
			expect(views[0].createdAt).toBeInstanceOf(Date);
			expect(views[0].updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("findByIdAsync", () => {
		it("should return a lofty view when found", async () => {
			const view = await repository.findByIdAsync(1);

			expect(view).not.toBeNull();
			expect(view?.id).toBe(1);
			expect(view?.name).toBe("Golden Gate Bridge");
		});

		it("should return null when lofty view not found", async () => {
			const view = await repository.findByIdAsync(999);

			expect(view).toBeNull();
		});
	});

	describe("createAsync", () => {
		it("should create a new lofty view with all fields", async () => {
			const viewData = {
				name: "Test View",
				description: "A test view",
				location: "Test Location",
			};

			const createdView = await repository.createAsync(viewData);

			expect(createdView).toMatchObject({
				id: 4, // Should be next available ID
				name: "Test View",
				description: "A test view",
				location: "Test Location",
				hearts: 0, // Should initialize to 0
			});
			expect(createdView.createdAt).toBeInstanceOf(Date);
			expect(createdView.updatedAt).toBeInstanceOf(Date);
			expect(createdView.createdAt).toEqual(createdView.updatedAt);
		});

		it("should create a new lofty view with only required fields", async () => {
			const viewData = {
				name: "Minimal View",
			};

			const createdView = await repository.createAsync(viewData);

			expect(createdView).toMatchObject({
				id: 4,
				name: "Minimal View",
				description: undefined,
				location: undefined,
				hearts: 0,
			});
		});

		it("should generate unique IDs for multiple views", async () => {
			const viewData1 = { name: "View 1" };
			const viewData2 = { name: "View 2" };

			const view1 = await repository.createAsync(viewData1);
			const view2 = await repository.createAsync(viewData2);

			expect(view1.id).toBe(4);
			expect(view2.id).toBe(5);
			expect(view1.id).not.toBe(view2.id);
		});

		it("should add created view to the collection", async () => {
			const viewData = { name: "New View" };

			const initialViews = await repository.findAllAsync();
			const initialCount = initialViews.length;

			await repository.createAsync(viewData);

			const updatedViews = await repository.findAllAsync();
			expect(updatedViews).toHaveLength(initialCount + 1);

			const newView = updatedViews.find((view) => view.name === "New View");
			expect(newView).toBeDefined();
		});
	});
});
