const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const crypto = require('crypto');
const mailchimp = require('@mailchimp/mailchimp_marketing');

// CONFIGURATION CONSTANTS
const DAYS_LIMIT = 2; // Only add people who opted in within the last 2 days
const MS_LIMIT = DAYS_LIMIT * 24 * 60 * 60 * 1000; // convert days to milliseconds

mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX,
  });
  
const listId = process.env.MAILCHIMP_LIST_ID;
const csvFilePath = path.resolve(__dirname, 'email-opt-in.csv');
const subscribers = [];

// Parse the CSV file.
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    subscribers.push(row);
  })
  .on('end', async () => {
    console.log(`Parsed ${subscribers.length} subscriber records from CSV.`);
    
    // Run all upsert operations concurrently.
    const promises = subscribers.map(subscriber => upsertSubscriber(subscriber));
    await Promise.all(promises);

    console.log('All subscribers processed.');
    process.exit(0);
  });

/**
 * Upsert a subscriber in Mailchimp using the marketing API.
 * Only processes subscribers whose date_opted_in is within the past DAYS_LIMIT days.
 */
async function upsertSubscriber(subscriber) {
  const { email, first_name, last_name, zip_code, date_opted_in } = subscriber;
  
  if (!email) {
    // console.warn('Skipping record with no email:', subscriber);
    return;
  }
  
  // Check if the subscriber's opt-in date is within the last DAYS_LIMIT days.
  if (date_opted_in) {
    const optInDate = new Date(date_opted_in);
    if (isNaN(optInDate.getTime())) {
      console.warn(`Invalid date for subscriber ${email}. Skipping record.`);
      return;
    }
    const timeDifference = Date.now() - optInDate.getTime();
    if (timeDifference > MS_LIMIT) {
      // console.log(`Skipping ${email} - opted in more than ${DAYS_LIMIT} days ago.`);
      return;
    }
  } else {
    console.warn(`No opt-in date provided for ${email}. Skipping record.`);
    return;
  }

  // Mailchimp requires a lowercase MD5 hash of the subscriber's email.
  const subscriberHash = crypto
    .createHash('md5')
    .update(email.toLowerCase())
    .digest('hex');

  // Build the subscriber data.
  const subscriberData = {
    email_address: email,
    status_if_new: "subscribed",
    merge_fields: {
      FNAME: first_name || "",
      LNAME: last_name || "",
      MERGE13: "Tock",
      ADDRESS: {
        addr1: "",
        addr2: "",
        city: "",
        state: "",
        zip: zip_code || "",
        country: ""
      }
    }
  };

  try {
    const response = await mailchimp.lists.setListMember(
      listId,
      subscriberHash,
      subscriberData,
      { skip_merge_validation: true }
    );
    console.log(`Successfully upserted subscriber: ${email}`);
  } catch (error) {
    console.error(`Error upserting subscriber ${email}:`, error.response?.body || error);
  }
}
