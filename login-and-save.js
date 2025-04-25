const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: 'tock-auth.json',
    acceptDownloads: true,
  });

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
    await reviewsPage.getByTestId('date-range-shortcut-last-week').click();
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
