import { test, expect, Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://127.0.0.1:3000");
});

const CHAMPION = {
  sport: "testSport",
  award: "testAward",
  year: "1234",
  description: "testDescription",
};

const addHonoree = async (page) => {
  // Create 1st honoree.
  await page.locator("#add").click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/ui/uploadHonoree.html");

  await page.fill("#sport", CHAMPION.sport);
  await page.fill("#award", CHAMPION.award);
  await page.fill("#year", CHAMPION.year);
  await page.fill("#description", CHAMPION.description);
  await page.setInputFiles(
    "#fileUploader",
    "./tests/images/WoC Images/08 1958 Football/1958 Football Team Photo.jpg"
  );

  await page.locator("#submitButton").press("Enter");
  await expect(page).toHaveURL("http://127.0.0.1:3000/ui/mainNavigation.html");
};

const deleteHonoree = async (page) => {
  await page.goto("http://127.0.0.1:3000/ui/listHonorees.html");
  // Locate elements, this locator points to a list.
  const images = await page.locator("text=Delete honoree").nth(1);
  await images.click();
};

test.describe("CRUD honorees", () => {
  test("add/delete bulk honorees", async ({ page }) => {
    for (let i = 0; i < 22; i++) {
      await addHonoree(page);
      await deleteHonoree(page);
    }
  });
});
