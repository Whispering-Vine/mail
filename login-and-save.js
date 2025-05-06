const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TOCK_EMAIL = process.env.TOCK_EMAIL;
const TOCK_PASSWORD = process.env.TOCK_PASSWORD;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: true,
  });

  const loginPage = await context.newPage();
  await loginPage.goto('https://dashboard.exploretock.com/login?continueTo=%2Fapp');
  await loginPage.getByTestId('login-email-input').fill(TOCK_EMAIL);
  await loginPage.getByTestId('login-submit-button').click();
  await loginPage.getByTestId('login-password-input').fill(TOCK_PASSWORD);
  await loginPage.getByTestId('login-submit-button').click();

  Wait for something on the post‑login landing page to be sure you’re in
  await loginPage.waitForURL('**/app/**');

  // Open three pages (one for each download task)
  const guestsPage = await context.newPage();
  const optInPage = await context.newPage();
  const reviewsPage = await context.newPage();

  // Task 1: Download Guest Directory CSV
  const guestsTask = (async () => {
    await guestsPage.goto('https://dashboard.exploretock.com/app/guests/directory');
    const [download] = await Promise.all([
      guestsPage.waitForEvent('download'),
      guestsPage.getByRole('button', { name: 'Download' }).click(),
    ]);
    const guestPath = path.resolve(__dirname, 'guest-directory.csv');
    await download.saveAs(guestPath);
    console.log(`Guest directory saved to ${guestPath}`);
  })();

  // Task 2: Download Email Opt-In CSV
  const optInTask = (async () => {
    await optInPage.goto('https://dashboard.exploretock.com/control-panel/marketing/email-opt-in');
    const [download] = await Promise.all([
      optInPage.waitForEvent('download'),
      optInPage.getByRole('button', { name: 'Download CSV' }).click(),
    ]);
    const optInPath = path.resolve(__dirname, 'email-opt-in.csv');
    await download.saveAs(optInPath);
    console.log(`Email opt-in list saved to ${optInPath}`);
  })();

  // Task 3: Download Reviews CSV
  const reviewsTask = (async () => {
    await reviewsPage.goto('https://dashboard.exploretock.com/app/operations/reviews');

    // Set date range and configure the download parameters
    await reviewsPage.getByTestId('daterange-picker-input').click();
    await reviewsPage.getByTestId('date-range-shortcut-last-7-days').click();
    await reviewsPage.getByText('ReviewsDownloadPrint').click();

    const [download] = await Promise.all([
      reviewsPage.waitForEvent('download'),
      reviewsPage.getByTestId('download-button').click(),
    ]);
    const reviewsPath = path.resolve(__dirname, 'reviews.csv');
    await download.saveAs(reviewsPath);
    console.log(`Reviews CSV saved to ${reviewsPath}`);
  })();

  // Run all tasks concurrently. This will start all three downloads at the same time.
  await Promise.all([guestsTask, optInTask, reviewsTask]);

  await browser.close();
})();
