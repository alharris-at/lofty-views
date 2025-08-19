import type { Request, RequestHandler, Response } from "express";

import { loftyViewService } from "./loftyViewService";

class LoftyViewController {
	public getLoftyViews: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await loftyViewService.findAll();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getLoftyView: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await loftyViewService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createLoftyView: RequestHandler = async (req: Request, res: Response) => {
		const serviceResponse = await loftyViewService.create(req.body);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const loftyViewController = new LoftyViewController();
