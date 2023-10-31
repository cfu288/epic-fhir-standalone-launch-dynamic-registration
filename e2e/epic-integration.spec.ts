import { test, expect } from "@playwright/test";

test("Epic OAuth2 Login Flow with Dynamic Registration Works", async ({
  page,
}) => {
  await page.goto("http://localhost:5173/");

  // Before we log in, there should be no dynamic client data
  await page.waitForSelector(
    "text=After you log in, your dynamic client data will show here"
  );

  // Start login flow by clicking on button with text "Login to MyChart"
  await page.click("text=Login to MyChart");

  // We are on MyChart login page
  await page.waitForSelector("text=MyChart Username");
  await expect(page).toHaveTitle("MyChart - Login Page");
  await page.click("label[for='Login']", { force: true });
  await page.keyboard.type("fhirderrick");
  await page.click("label[for='Password']", { force: true });
  await page.keyboard.type("epicepic1");
  await page.click("text=Sign In");

  // We have logged in to MyChart
  await page.waitForSelector("text=Not a Company at all has said that it:");
  await expect(page).toHaveTitle("MyChart - Are you sure?");
  await page.getByTitle("Continue to next page").click({
    force: true,
    delay: 1000,
  });

  // We are on the MyChart authorize page. Authorize our app for 1 hour.
  await page.waitForSelector("text=What would you like to share?");
  await expect(page).toHaveTitle("MyChart - Are you sure?");
  // await page.click('text=3 months', { force: true, delay: 1000 });
  await page.click("text=Allow access", { force: true, delay: 500 });

  // MyChart has granted access, redirecting back to app from MyChart
  await page.waitForSelector("text=Epic FHIR Dynamic Registration Redirect");

  // Should auto redirect if successful, but playwright Chrome seems to have issues so we'll manually click if needed
  try {
    await page.click("text=Back to main page", { force: true, delay: 5000 });
  } catch (e) {}

  // If successful, Dynamic Client Registration Data should now be visible
  await page.waitForSelector("text=Dynamic Client Registration Data");
});

test("Epic OAuth2 Login Flow with Dynamic Registration Works with 1 month Expiration Timer", async ({
  page,
}) => {
  await page.goto("http://localhost:5173/");

  // Before we log in, there should be no dynamic client data
  await page.waitForSelector(
    "text=After you log in, your dynamic client data will show here"
  );

  // Start login flow by clicking on button with text "Login to MyChart"
  await page.click("text=Login to MyChart");

  // We are on MyChart login page
  await page.waitForSelector("text=MyChart Username");
  await expect(page).toHaveTitle("MyChart - Login Page");
  await page.click("label[for='Login']", { force: true });
  await page.keyboard.type("fhirderrick");
  await page.click("label[for='Password']", { force: true });
  await page.keyboard.type("epicepic1");
  await page.click("text=Sign In");

  // We have logged in to MyChart
  await page.waitForSelector("text=Not a Company at all has said that it:");
  await expect(page).toHaveTitle("MyChart - Are you sure?");
  await page.getByTitle("Continue to next page").click({
    force: true,
    delay: 1000,
  });

  // We are on the MyChart authorize page. Authorize our app for 1 hour.
  await page.waitForSelector("text=What would you like to share?");
  await expect(page).toHaveTitle("MyChart - Are you sure?");
  await page.click("text=1 month", { force: true, delay: 1000 });
  await page.click("text=Allow access", { force: true, delay: 500 });

  // MyChart has granted access, redirecting back to app from MyChart
  await page.waitForSelector("text=Epic FHIR Dynamic Registration Redirect");

  // Should auto redirect if successful, but playwright Chrome seems to have issues so we'll manually click if needed
  try {
    await page.click("text=Back to main page", { force: true, delay: 5000 });
  } catch (e) {}

  // If successful, Dynamic Client Registration Data should now be visible
  await page.waitForSelector("text=Dynamic Client Registration Data");
});
