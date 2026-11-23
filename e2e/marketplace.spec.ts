import { test, expect } from "@playwright/test";

test.describe("QyzmetTap Public Pages", () => {
  test("homepage renders hero, categories, and how-it-works without overflow", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Қажетті маманды жақын жерден табыңыз" })
    ).toBeVisible();
    await expect(page.getByText("Танымал қызметтер")).toBeVisible();
    await expect(page.getByText("QyzmetTap қалай жұмыс істейді?")).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("services catalog lists seeded categories", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: "Қызметтер каталогы" })).toBeVisible();
    await expect(page.getByText("Электрик")).toBeVisible();
    await expect(page.getByText("Сантехник")).toBeVisible();
  });

  test("providers directory and map load cleanly", async ({ page }) => {
    await page.goto("/providers");
    await expect(page.getByRole("heading", { name: "Мамандар" })).toBeVisible();

    await page.goto("/map");
    await expect(page.getByRole("heading", { name: "Мамандар картасы" })).toBeVisible();
  });

  test("login and registration pages render forms", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Жүйеге кіру" })).toBeVisible();

    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Тіркелу" })).toBeVisible();
  });
});

