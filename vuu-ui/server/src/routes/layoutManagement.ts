import { Router, Request, Response } from "express";
import { Layout } from "@finos/vuu-shell";
import { defaultLayout } from "./data";

const router = Router();
let layouts: Layout[] = [];

layouts.push(defaultLayout);

router.get("/", (_, res: Response<Layout[]>) => {
  res.json(layouts);
});

router.get("/:user/latest", (req: Request, res: Response<Layout | string>) => {
  const layout = layouts.find((layout) => layout.metadata.user === req.params.user);
  if (!layout) {
    res.status(404).send("Layout not found");
  } else {
    res.send(layout);
  }
});

export default router;
