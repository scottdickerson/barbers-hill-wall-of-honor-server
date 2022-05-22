import { test, expect, Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://127.0.0.1:3000");
});

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

const HONOREE = {
  name: "testSport",
  inductionYear: "1234",
  specialRecognition: true,
  inMemoriam: true,
  startYear: "234",
  endYear: "1234",
  sports: [{ name: "sport1", description: "sport1description" }],
  imageFiles: [{ name: "imageFile1", description: "imageFile1description" }],
};

const addHonoree = async (page) => {
  // Create 1st honoree.
  await page.locator("#add").click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/ui/uploadHonoree.html");

  await page.fill("#name", HONOREE.name);
  await page.fill("#inductionYear", HONOREE.inductionYear);
  if (HONOREE.specialRecognition) {
    await page.check("#specialRecognition");
  }
  if (HONOREE.inMemoriam) {
    await page.check("#inMemoriam");
  }
  await page.fill("#startYear", HONOREE.startYear);
  await page.fill("#endYear", HONOREE.endYear);

  await Promise.all(
    HONOREE.sports.map(async (sport, index) => {
      await page.locator("#addSport").click();
      await page.fill(`#sportName${index + 1}`, sport.name);
      await page.fill(`#sportDescription${index + 1}`, sport.description);
    })
  );
  // await page.setInputFiles(
  //   "#fileUploader",
  //   "./tests/images/WoC Images/08 1958 Football/1958 Football Team Photo.jpg"
  // );

  await page.locator("#submitButton").press("Enter");
  await expect(page).toHaveURL("http://127.0.0.1:3000/ui/mainNavigation.html");
};

const deleteHonoree = async (page) => {
  await page.goto("http://127.0.0.1:3000/ui/listHonorees.html");
  // Locate elements, this locator points to a list.
  const images = await page.locator("text=Delete honoree").nth(1);
  await images.click();
};

const validateHonoree = async (page, honoree) => {
  await page.goto("http://127.0.0.1:3000/ui/listHonorees.html");
  // validate text fields
  await Promise.all(
    Object.values(honoree)
      .filter((value) => typeof value === "string")
      .map(async (value) => {
        expect(
          await page.locator(`div#${honoree.name} :text("${value}")`)
        ).toBeDefined();
      })
  );
  // validate booleans
  expect(
    await page.locator(`div#${honoree.name} #specialRecognition`)
  ).toHaveText(
    `Special Recognition: ${honoree.specialRecognition ? true : false}`
  );
  expect(await page.locator(`div#${honoree.name} #inMemoriam`)).toHaveText(
    `In memoriam: ${honoree.inMemoriam ? true : false}`
  );
};

const deleteAllHonorees = async (page) => {
  await page.goto("http://127.0.0.1:3000/ui/listHonorees.html");
  const deleteButtons = await page.locator("#deleteButton");
  const count = await deleteButtons.count();
  for (let i = 0; i < count; i++) {
    await deleteButtons.nth(i).click();
  }
};

test.describe("CRUD honorees", () => {
  test("add bulk honorees", async ({ page }) => {
    await addHonoree(page);
    await validateHonoree(page, HONOREE);
    // await deleteHonoree(page);
  });
});

test.afterEach(async ({ page }) => await deleteAllHonorees(page));

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  page.pause();
  await page.goto("http://127.0.0.1:3000/ui/listHonorees.html");
  const deleteButtons = await page.locator("#deleteButton");
  const count = await deleteButtons.count();
  for (let i = count - 1; i >= 0; i--) {
    await deleteButtons.nth(i).click();
  }
});
