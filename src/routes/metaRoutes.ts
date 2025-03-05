import { Router } from "express";

import {
  getAllMetas,
  createMeta,
  deleteMeta,
  getMetaById,
  updateMeta,
} from "../controllers/metaController";

const metaRouter = Router();

metaRouter.get("/", getAllMetas);
metaRouter.get("/:id", getMetaById);
metaRouter.post("/", createMeta);
metaRouter.put("/:id", updateMeta);
metaRouter.delete("/:id", deleteMeta);

export default metaRouter;
