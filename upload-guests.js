const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const csvFilePath = path.resolve(__dirname, 'guest-directory.csv');
let guests = [];

/**
 * Convert a string to proper case (Title Case).
 * For each word, capitalize the first letter and lower-case the rest.
 */
function properCase(str) {
    return str
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

/**
 * Normalize a value for comparison.
 * - For emails: return lower-case.
 * - For phone numbers: if a semicolon is present, take only the first part.
 *   Then, remove any non-digit characters and prepend a '+' if digits are found.
 * - For other values: return the trimmed string.
 */
function normalize(value, key) {
    let str = (value || "").toString().trim();
    if (key === 'email') {
      return str.toLowerCase();
    }
    if (key === 'phone') {
      // If the phone string contains a semicolon, take only the first segment.
      if (str.includes(';')) {
        str = str.split(';')[0];
      }
      // Remove non-digit characters.
      const digits = str.replace(/\D/g, '');
      return digits ? `+${digits}` : "";
    }
    if (key === 'first_name' || key === 'last_name') {
        return properCase(str);
      }
    return str;
  }

/**
 * Deduplicate an array of guest objects based on a composite key.
 *
 * For each guest:
 *  - Normalize email and phone.
 *  - If email is empty, keep it as empty (""), but for the deduplication key use the phone as fallback.
 *  - The composite key becomes:  (emailFallback)|phone, where emailFallback is email if available or phone otherwise.
 * This ensures that records with empty email and identical phone numbers are treated as duplicates.
 */
function deduplicateGuests(arr) {
  const map = new Map();
  arr.forEach(guest => {
    let email = normalize(guest.email, 'email');  // may be ""
    let phone = normalize(guest.phone, 'phone');
    
    // For deduplication key, if email is empty then use phone as fallback.
    const emailKey = email || phone;
    const key = `${emailKey}|${phone}`;
    
    // Save the normalized values back onto the guest.
    guest.email = email; // remains empty string if not provided
    guest.phone = phone;
    
    if (!map.has(key)) {
      map.set(key, guest);
    }
    // If duplicate rows exist, they are skipped. Adjust merge logic if you need to combine fields.
  });
  return Array.from(map.values());
}

// Parse the CSV file.
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Trim the incoming email and phone values.
    row.email = (row.email || "").trim();
    row.phone = (row.phone || "").trim();
    guests.push(row);
  })
  .on('end', async () => {
    console.log(`Parsed ${guests.length} guest records from CSV.`);
    
    // Deduplicate records
    guests = deduplicateGuests(guests);
    console.log(`Deduplicated to ${guests.length} unique records.`);
    
    // Batch upsert all unique records using the composite unique key (email, phone).
    // (Your table should have a unique constraint on (email, phone) or an equivalent composite key.)
    const { data, error } = await supabase
      .from('guests')
      .upsert(guests, { onConflict: 'email,phone' });
    
    if (error) {
      console.error('Error during upsert:', error);
    } else if (!data) {
      console.error('Upsert returned no data.');
    } else {
      console.log(`Upserted ${data.length} records. Duplicates were updated.`);
    }
    
    process.exit(0);
  });
