import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home hero links and carousel controls work", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Browse furniture" }),
  ).toHaveAttribute("href", "/store");
  await expect(
    page.getByRole("link", { name: "View new arrivals" }),
  ).toHaveAttribute("href", "/store?newArrival=true");

  const pause = page.getByRole("button", { name: "Pause slides" });
  await expect(pause).toBeVisible();
  await pause.click();
  await expect(page.getByRole("button", { name: "Play slides" })).toBeVisible();

  await page.getByRole("button", { name: "Next slide" }).click();
  await page.getByRole("button", { name: "Previous slide" }).click();
  await expect(
    page.getByRole("button", { name: "Show slide 1" }),
  ).toBeVisible();
});

test("mobile navigation reports and changes its expanded state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menu = page.getByRole("button", { name: "Open navigation menu" });
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await expect(
    page.getByRole("button", { name: "Close navigation menu" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.locator("#mobile-navigation").getByRole("link", { name: "Store" }),
  ).toBeVisible();
});

test("home page has no serious or critical accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );
  expect(blocking).toEqual([]);
});
