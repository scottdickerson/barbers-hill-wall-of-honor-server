import {
  updateHonoreeInMongo,
  createHonoreeInMongo,
  uri,
  databaseName,
  IMAGES_BUCKET_NAME,
} from "./mongoUtils";
import { IHonoree } from "./types";
import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import multer from "multer";
const { GridFsStorage } = require("multer-gridfs-storage");

var storage = new GridFsStorage({
  url: uri + databaseName,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req: Request, file: { originalname: string }) => {
    return {
      bucketName: IMAGES_BUCKET_NAME,
      filename: file.originalname,
    };
  },
});

export const uploadFiles = multer({ storage: storage }).array("imageFile");

export const parseForm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("parsing form!");
    console.log(req.files, req.body);
    const files = req.files;
    const params = req.body;
    const imageFiles = Object.values(files || {})?.map((file, index) => ({
      name: file?.filename,
      caption: req.body.caption[index],
    }));
    const sports = (req.body.sportName as Array<string>)?.map(
      (sportName, index) => ({
        name: sportName,
        description: req.body.sportDescription[index],
      })
    );
    const honoreeId = req.params?.id;
    const isUpdate = Boolean(honoreeId);
    const newHonoree: IHonoree = {
      id: new ObjectId(),
      name: params.name as string,
      inductionYear: parseInt(params.inductionYear as string, 10),
      inMemoriam: params.inMemoriam === "on",
      specialRecognition: params.specialRecognition === "on",
      startYear: parseInt(params.startYear as string, 10),
      endYear: parseInt(params.endYear as string, 10),
      imageFiles,
      sports,
    };

    try {
      if (isUpdate) {
        console.log("updating existing honoree", JSON.stringify(newHonoree));
        await updateHonoreeInMongo(honoreeId, newHonoree, ""); // TODO: fix update case
      } else {
        console.log("uploading new honoree", JSON.stringify(newHonoree));
        await createHonoreeInMongo(newHonoree);
      }
    } catch (error) {
      console.error(error);
      console.log("error creating/updating honoree");
      res.sendStatus(500);
    }
    res.setHeader(
      "location",
      "/ui/mainNavigation.html" // TODO: just testing pug
      // isUpdate ? "/ui/listVideos.html" : "/ui/mainNavigation.html"
    );
    res.sendStatus(301);
  } catch (error) {
    console.log("error parsing the form or uploading the image file");
    console.error(error);
  }
};
