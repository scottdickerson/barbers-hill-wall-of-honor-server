import { Document, ObjectId, WithId } from "mongodb";
export interface IHonoree extends Partial<WithId<Document>> {
  name: string;
  inductionYear: number;
  specialRecognition: boolean;
  inMemoriam: boolean;
  startYear?: number;
  endYear?: number;
  achievements?: string;
  sports?: Array<{ name: string; description: string }>;
  imageFiles: Array<{ name: string; description: string }>;
  id: ObjectId;
}
