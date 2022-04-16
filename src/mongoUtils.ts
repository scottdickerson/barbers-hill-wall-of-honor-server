import mongoDB, { MongoClient, ObjectId, GridFSBucket } from "mongodb";
import { IHonoree } from "./types";
import { omit } from "lodash";

export const databaseName = process.env.TEST_DB || "barbers-hill";

export async function connectToDB() {
  await client.connect();
  const database = client.db(databaseName);
  honoreesDatabaseCollection = database.collection("wall-of-honor");
  console.log(
    `connected to the barbers hill mongo database ${databaseName} here: ${
      process.env.MONGO_HOSTNAME || "mongodb://127.0.0.1:27017"
    }`
  );
  imagesBucket = new GridFSBucket(database, { bucketName: IMAGES_BUCKET_NAME });
  imagesDatabaseCollection = database.collection(`${IMAGES_BUCKET_NAME}.files`);
}

// Replace the uri string with your MongoDB deployment's connection string.
export const uri = process.env.MONGO_HOSTNAME
  ? `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOSTNAME}/`
  : `mongodb://127.0.0.1:${
      process.env.MONGO_PORT ? process.env.MONGO_PORT : "27017"
    }/`;

const client = new MongoClient(uri);
let honoreesDatabaseCollection: mongoDB.Collection;
let imagesBucket: mongoDB.GridFSBucket;
let imagesDatabaseCollection: mongoDB.Collection;

export const IMAGES_BUCKET_NAME = "wall-of-honor-images";

export const disconnectFromDB = async () => {
  await client.close();
};

export const findHonoreeMetadataInMongo = (id: string) => {
  return honoreesDatabaseCollection.findOne({
    _id: new ObjectId(id),
  }) as Promise<IHonoree>;
};

export const findHonoreesMetadataInMongo = async () => {
  return (
    ((await honoreesDatabaseCollection?.find({})?.toArray())?.sort(
      ({ year: year1 }, { year: year2 }) => year1 - year2 // sort it by year
    ) as IHonoree[]) || []
  );
};

export const updateHonoreeInMongo = async (
  honoreeId: string,
  honoree: IHonoree
) => {
  const existingHonoree = (await honoreesDatabaseCollection.findOne({
    _id: new ObjectId(honoreeId),
  })) as IHonoree;
  await honoreesDatabaseCollection.replaceOne(
    { _id: new ObjectId(honoreeId) },
    {
      ...omit(honoree, "_id", "oldImageFileName"),
    }
  );
  const existingHonoreeImageFileNames = existingHonoree.imageFiles.map(
    (imageFile) => imageFile.name
  );
  const newHonoreeImageFileNames = honoree.imageFiles.map(
    (imageFile) => imageFile.name
  );
  await Promise.all(
    existingHonoreeImageFileNames.map(async (oldImageFileName) => {
      // if an image has been removed from the newHonoree then delete it
      if (!newHonoreeImageFileNames.includes(oldImageFileName)) {
        console.log("deleting original image", oldImageFileName);
        return deleteImageByFileName(oldImageFileName);
      }
    })
  );
};

export const deleteImageByFileName = async (oldImageFileName: string) => {
  const originalImageToDelete = await findImageFileInGridFS(oldImageFileName);
  if (originalImageToDelete) {
    await imagesBucket.delete(originalImageToDelete._id);
  }
};

export const createHonoreeInMongo = (honoree: IHonoree) => {
  return honoreesDatabaseCollection.insertOne(honoree);
};

const findImageFileInGridFS = (fileName: string) => {
  // find the id of the image to delete from GridFS
  return imagesDatabaseCollection.findOne({
    filename: fileName,
  });
};

export const deleteHonoreeInMongo = async (id: string): Promise<boolean> => {
  console.log("deleting honoree from db", id);
  let honoreeDeleted = false;
  const uniqueHonoreeObjectId = {
    _id: new ObjectId(id),
  };
  const honoreeToDelete = (await honoreesDatabaseCollection.findOne(
    uniqueHonoreeObjectId
  )) as IHonoree;

  const deletedInfo = await honoreesDatabaseCollection.deleteOne(
    uniqueHonoreeObjectId
  );
  if (deletedInfo.deletedCount > 0) {
    honoreeDeleted = true;
    console.log("honoree images to delete", honoreeToDelete.imageFiles);
    await Promise.all(
      honoreeToDelete.imageFiles.map(({ name }) => {
        try {
          console.log("deleting file", name);
          return deleteImageByFileName(name);
        } catch (error) {
          console.log("error deleting image", name, error);
          return Promise.resolve();
        }
      })
    );
  }
  return honoreeDeleted;
};

export const getImageStreamFromMongo = async (imageFileName: string) => {
  const imageToDelete = await findImageFileInGridFS(imageFileName);
  if (!imageToDelete) {
    throw new Error(`Image file doesn't exist in mongo ${imageFileName}`);
  }
  const readableImage = imagesBucket.openDownloadStreamByName(imageFileName);
  // console.log("opened download stream for ", imageFileName);
  return readableImage;
};

export const findHonorees = async (): Promise<IHonoree[]> => {
  try {
    const honorees = await findHonoreesMetadataInMongo();
    // console.log("listing honorees", honorees);
    return honorees;
  } catch (error) {
    console.error("couldn't find honorees");
  }
  throw new Error("couldn't query database honorees");
};
