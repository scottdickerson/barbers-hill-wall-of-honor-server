import { Request, Response } from "express";
import { parseForm, parseImageFiles, parseSports } from "../multerUtils";

import * as mongoUtils from "../mongoUtils";
jest.mock("../mongoUtils", () => ({
  createHonoreeInMongo: jest.fn(),
  updateHonoreeInMongo: jest.fn(),
  uri: "fakeuri",
  databaseName: "fakeDBName",
  IMAGES_BUCKET_NAME: "fakeimages",
}));

describe("multerUtils", () => {
  it("parseSports array", () => {
    expect(
      parseSports(["sport1", "sport2"], ["description1", "description2"])
    ).toEqual([
      { name: "sport1", description: "description1" },
      { name: "sport2", description: "description2" },
    ]);
  });
  it("parseSports string", () => {
    expect(parseSports("sport1", "description1")).toEqual([
      { name: "sport1", description: "description1" },
    ]);
  });
  it("parseImageFiles array of files", () => {
    expect(
      parseImageFiles(
        ["imageName1"],
        ["imageDescription1", "imageDescription2"],
        [{ filename: "imageName2" }]
      )
    ).toEqual([
      { name: "imageName1", description: "imageDescription1" },
      { name: "imageName2", description: "imageDescription2" },
    ]);
  });
  it("parseImageFiles strings", () => {
    expect(parseImageFiles("imageName1", "imageDescription1")).toEqual([
      { name: "imageName1", description: "imageDescription1" },
    ]);
  });
  it("parseForm with existing image and new image", () => {
    const mockSendStatus = jest.fn();
    const mockSetHeader = jest.fn();
    const mockRequest = {
      files: [
        {
          filename: "imageName2",
        },
      ] as Express.Multer.File[],
      body: {
        name: "honoreeName",
        inductionYear: "1",
        inMemoriam: "off",
        specialRecognition: "on",
        startYear: "2",
        endYear: "3",
        sportName: "sportName1",
        sportDescription: "sportDescription1",
        imageName: "imageName1",
        imageDescription: ["imageDescription1", "imageDescription2"],
      },
    };
    const mockResponse = {
      sendStatus: mockSendStatus,
      setHeader: mockSetHeader,
    };
    parseForm(mockRequest as Request, mockResponse as unknown as Response);
    expect(mongoUtils.createHonoreeInMongo).toHaveBeenCalledWith({
      id: expect.anything(),
      name: "honoreeName",
      inductionYear: 1,
      inMemoriam: false,
      specialRecognition: true,
      startYear: 2,
      endYear: 3,
      sports: [{ name: "sportName1", description: "sportDescription1" }],
      imageFiles: [
        { name: "imageName1", description: "imageDescription1" },
        { name: "imageName2", description: "imageDescription2" },
      ],
    });
  });
  it("parseForm with multiple sports and existing images", () => {
    const mockSendStatus = jest.fn();
    const mockSetHeader = jest.fn();
    const mockRequest = {
      files: [] as Express.Multer.File[],
      body: {
        name: "honoreeName",
        inductionYear: "1",
        inMemoriam: "off",
        specialRecognition: "on",
        startYear: "2",
        endYear: "3",
        sportName: ["sportName1", "sportName2"],
        sportDescription: ["sportDescription1", "sportDescription2"],
        imageName: ["imageName1", "imageName2"],
        imageDescription: ["imageDescription1", "imageDescription2"],
      },
    };
    const mockResponse = {
      sendStatus: mockSendStatus,
      setHeader: mockSetHeader,
    };
    parseForm(mockRequest as Request, mockResponse as unknown as Response);
    expect(mongoUtils.createHonoreeInMongo).toHaveBeenCalledWith({
      id: expect.anything(),
      name: "honoreeName",
      inductionYear: 1,
      inMemoriam: false,
      specialRecognition: true,
      startYear: 2,
      endYear: 3,
      sports: [
        { name: "sportName1", description: "sportDescription1" },
        { name: "sportName2", description: "sportDescription2" },
      ],
      imageFiles: [
        { name: "imageName1", description: "imageDescription1" },
        { name: "imageName2", description: "imageDescription2" },
      ],
    });
  });
  it("parseForm for existing honoree with multiple sports and existing images", () => {
    const mockSendStatus = jest.fn();
    const mockSetHeader = jest.fn();
    const mockHonoreeId = "honoreeId";
    const mockRequest = {
      files: [] as Express.Multer.File[],
      params: { id: mockHonoreeId } as unknown,
      body: {
        name: "honoreeName",
        inductionYear: "1",
        inMemoriam: "off",
        specialRecognition: "on",
        startYear: "2",
        endYear: "3",
        sportName: ["sportName1", "sportName2"],
        sportDescription: ["sportDescription1", "sportDescription2"],
        imageName: ["imageName1", "imageName2"],
        imageDescription: ["imageDescription1", "imageDescription2"],
      },
    };
    const mockResponse = {
      sendStatus: mockSendStatus,
      setHeader: mockSetHeader,
    };
    parseForm(mockRequest as Request, mockResponse as unknown as Response);
    expect(mongoUtils.updateHonoreeInMongo).toHaveBeenCalledWith(
      mockHonoreeId,
      {
        id: expect.anything(),
        name: "honoreeName",
        inductionYear: 1,
        inMemoriam: false,
        specialRecognition: true,
        startYear: 2,
        endYear: 3,
        sports: [
          { name: "sportName1", description: "sportDescription1" },
          { name: "sportName2", description: "sportDescription2" },
        ],
        imageFiles: [
          { name: "imageName1", description: "imageDescription1" },
          { name: "imageName2", description: "imageDescription2" },
        ],
      }
    );
  });
  it("parseForm for existing honoree with multiple sports,existing images and new images", () => {
    const mockSendStatus = jest.fn();
    const mockSetHeader = jest.fn();
    const mockHonoreeId = "honoreeId";
    const mockRequest = {
      files: [
        {
          filename: "imageName3",
        },
      ] as Express.Multer.File[],
      params: { id: mockHonoreeId } as unknown,
      body: {
        name: "honoreeName",
        inductionYear: "1",
        inMemoriam: "off",
        specialRecognition: "on",
        startYear: "2",
        endYear: "3",
        sportName: ["sportName1", "sportName2"],
        sportDescription: ["sportDescription1", "sportDescription2"],
        imageName: ["imageName1", "imageName2"],
        imageDescription: [
          "imageDescription1",
          "imageDescription2",
          "imageDescription3",
        ],
      },
    };
    const mockResponse = {
      sendStatus: mockSendStatus,
      setHeader: mockSetHeader,
    };
    parseForm(mockRequest as Request, mockResponse as unknown as Response);
    expect(mongoUtils.updateHonoreeInMongo).toHaveBeenCalledWith(
      mockHonoreeId,
      {
        id: expect.anything(),
        name: "honoreeName",
        inductionYear: 1,
        inMemoriam: false,
        specialRecognition: true,
        startYear: 2,
        endYear: 3,
        sports: [
          { name: "sportName1", description: "sportDescription1" },
          { name: "sportName2", description: "sportDescription2" },
        ],
        imageFiles: [
          { name: "imageName1", description: "imageDescription1" },
          { name: "imageName2", description: "imageDescription2" },
          { name: "imageName3", description: "imageDescription3" },
        ],
      }
    );
  });
});
