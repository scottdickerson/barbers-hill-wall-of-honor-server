import express, { Request, Response } from "express";
const router = express.Router();
import pug from "pug";
import path from "path";
import { findHonoreeMetadataInMongo, findHonorees } from "../mongoUtils";

export const pugPagesHome = path.join(__dirname, "..", "..", "src", "pages");

router.get(
  "/editHonoree.html/:honoreeId",
  async (req: Request, res: Response) => {
    const id = req.params.honoreeId;
    console.log("honoree id to load", id);

    try {
      const honoree = await findHonoreeMetadataInMongo(id);
      console.log("found honoree", honoree);
      if (honoree) {
        res.send(
          pug.renderFile(path.join(pugPagesHome, "editHonoree.pug"), {
            ...honoree,
            // heroku: process.env.ENVIRONMENT === "heroku",
          })
        );
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      console.error(error);
      console.log("error creating image");
    }
  }
);

router.get("/uploadHonoree.html", (req: Request, res: Response) => {
  res.send(pug.renderFile(path.join(pugPagesHome, "uploadHonoree.pug")));
});

router.get("/mainNavigation.html", (req: Request, res: Response) => {
  res.send(
    pug.renderFile(path.join(pugPagesHome, "mainNavigation.pug"), {
      // heroku: process.env.ENVIRONMENT === "heroku",
    })
  );
});

router.get("/listHonorees.html", async (req: Request, res: Response) => {
  try {
    const honorees = await findHonorees();
    console.log("honorees", honorees);
    res.send(
      pug.renderFile(path.join(pugPagesHome, "listHonorees.pug"), {
        honorees,
        // heroku: process.env.ENVIRONMENT === "heroku",
      })
    );
  } catch (error) {
    res.send(error).sendStatus(500);
  }
});

export default router;
