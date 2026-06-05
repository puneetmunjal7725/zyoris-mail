import { test, expect } from "@playwright/test";

test("mailboxes page loads", async ({ page }) => {
  await page.goto("/app/mailboxes");
  await expect(page.getByText("Mailboxes")).toBeVisible();
});

