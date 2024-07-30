const { test, expect } = require('@playwright/test');

// Extract timestamps from the page
async function extractTimestamps(page) {
  return await page.evaluate(() => {
    const timestamps = [];
    const articleRows = document.querySelectorAll('tr.athing');
    articleRows.forEach((row) => {
      const nextRow = row.nextElementSibling;
      const timestampElement = nextRow ? nextRow.querySelector('.age') : null;
      const timestamp = timestampElement ? timestampElement.title : null;
      if (timestamp) {
        timestamps.push(timestamp);
      }
    });
    return timestamps;
  });
}

// Check if timestamps are sorted
function isSorted(timestamps) {
  for (let i = 1; i < timestamps.length; i++) {
    const prevTimestamp = new Date(timestamps[i - 1]);
    const currTimestamp = new Date(timestamps[i]);
    if (currTimestamp > prevTimestamp) {
      console.log(`Timestamp ${currTimestamp} is out of order with the previous one: ${prevTimestamp}`);
      return false;
    }
  }
  return true;
}

// Test to verify article order
test('verify articles are sorted from newest to oldest', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/newest');
  
  let timestamps = [];
  const numArticles = 100;
  let isPageSorted = true;

  while (timestamps.length < numArticles && isPageSorted) {
    const newTimestamps = await extractTimestamps(page);
    timestamps = timestamps.concat(newTimestamps);

    if (timestamps.length < numArticles) {
      await page.click('a.morelink');
      await page.waitForTimeout(2000); // Wait for more articles to load
    }

    isPageSorted = isSorted(timestamps);
    if (!isPageSorted) {
      console.log('Articles are not sorted correctly.');
      break;
    }
  }

  // Verify number of articles and sorting
  if (timestamps.length < numArticles) {
    console.log(`Only ${timestamps.length} articles found, expected at least ${numArticles}.`);
    expect(timestamps.length).toBeGreaterThanOrEqual(numArticles);
  } else {
    console.log('Test succeeded, first 100 articles are in order from newest to oldest');
  }

  expect(isPageSorted).toBe(true);
});