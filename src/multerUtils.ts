import {
  updateHonoreeInMongo,
  createHonoreeInMongo,
  uri,
  databaseName,
  IMAGES_BUCKET_NAME,
} from "./mongoUtils";
import { IHonoree } from "./types";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import multer from "multer";
const { GridFsStorage } = require("multer-gridfs-storage");

const storage = new GridFsStorage({
  url: uri + databaseName,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req: Request, file: { originalname: string }) => {
    return {
      bucketName: IMAGES_BUCKET_NAME,
      filename: file.originalname,
    };
  },
});

export const uploadFiles = multer({ storage }).array("imageFile");

export type ImageFile = {
  name: string;
  description: string;
};

export type Sport = {
  name: string;
  description: string;
};

export const parseSports = (
  sportName: string | string[],
  sportDescription: string | string[]
): Sport[] => {
  const sports = (
    Array.isArray(sportName)
      ? (sportName as Array<string>)
      : ([sportName] as Array<string>)
  )?.map((sportName, index) => ({
    name: sportName,
    description: !Array.isArray(sportDescription)
      ? sportDescription
      : sportDescription[index],
  }));
  return sports;
};

export const parseImageDescription = (
  imageDescription: string[] | string,
  index: number
): string => {
  return !Array.isArray(imageDescription)
    ? imageDescription
    : imageDescription[index];
};

export const parseImageFiles = (
  imageName: string[] | string,
  imageDescription: string[] | string,
  files?: undefined | Partial<Express.Multer.File>[]
): ImageFile[] => {
  // first parse any existing image files
  const imageFiles = imageName
    ? (Array.isArray(imageName)
        ? (imageName as Array<string>)
        : ([imageName] as Array<string>)
      )?.map((imageName, index) => ({
        name: imageName,
        description: parseImageDescription(imageDescription, index),
      }))
    : [];
  console.log("Existing image files", imageFiles);
  console.log("passed array of new files", files);
  // then add images from new image files
  imageFiles.push(
    ...(files || []).map((file, index) => {
      console.log("each new file", file);
      return {
        name: file?.filename || "",
        description: parseImageDescription(
          imageDescription,
          imageFiles.length + index // skip the descriptions from the existing image files
        ),
      };
    })
  );
  console.log("With new image files", imageFiles);
  return imageFiles;
};

export const parseForm = async (req: Request, res: Response) => {
  try {
    console.log("parsing form!");
    console.log(req.files, req.body);
    const files = req.files;
    const params = req.body;
    const isSpecialRecognition = params.specialRecognition === "on";
    let sports: Sport[] = [];
    if (!isSpecialRecognition) {
      sports = parseSports(req.body.sportName, req.body.sportDescription);
    }
    const imageFiles = parseImageFiles(
      req.body.imageName,
      req.body.imageDescription,
      files as Express.Multer.File[]
    );
    const honoreeId = req.params?.id;
    const newHonoree: IHonoree = {
      id: new ObjectId(),
      name: params.name.trim() as string,
      inductionYear: parseInt(params.inductionYear as string, 10),
      inMemoriam: params.inMemoriam === "on",
      specialRecognition: isSpecialRecognition,
      ...(isSpecialRecognition ? { achievements: params.achievements } : {}),
      imageFiles,
      ...(!isSpecialRecognition
        ? {
            sports,
            startYear: parseInt(params.startYear as string, 10),
            endYear: parseInt(params.endYear as string, 10),
          }
        : {}),
      defaultImageFile: params.defaultImageFile
    };

    try {
      if (honoreeId) {
        console.log("updating existing honoree", JSON.stringify(newHonoree));
        await updateHonoreeInMongo(honoreeId, newHonoree);
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
    res.sendStatus(500);
  }
};
