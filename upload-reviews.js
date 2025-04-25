// upload-reviews.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const csvFile = path.resolve(__dirname, 'reviews.csv');
const reviews = [];

function titleCaseHeader(header) {
  return header
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function normalize(val, col) {
  const s = (val || '').toString().trim();
  if (col === 'Email') return s.toLowerCase();
  if (col === 'Phone') {
    const base = s.includes(';') ? s.split(';')[0] : s;
    const digits = base.replace(/\D/g, '');
    return digits ? `+${digits}` : '';
  }
  return s;
}

fs.createReadStream(csvFile)
  .pipe(csv())
  .on('data', rawRow => {
    const row = {};
    for (const [rawHeader, value] of Object.entries(rawRow)) {
      // Title-case to match your Supabase columns
      const col = titleCaseHeader(rawHeader);
      if (col === 'Review Id' || col === 'Review_Id') continue; 
      row[col] = normalize(value, col);
    }
    reviews.push(row);
  })
  .on('end', async () => {
    console.log(`Parsed ${reviews.length} rows from CSV.`);

    const { data, error } = await supabase
    .from('reviews')
    .upsert(reviews, {
      onConflict: [
        'Date',
        'Last Name',
        'First Name',
        'Experience',
        'Servers',
        'Feedback Rating',
        'Feedback Message',
        'Total Spent',
        'Email',
        'Phone',
        'Feedback Date',
        'Feedback Time',
        'Visit Time',
        'Party Size'
      ].join(','),
      returning: 'representation'
    })

      if (error) {
        // If it's a duplicate‐key violation, ignore it and continue
        if (error.code === '23505') {
          console.log('Some or all rows were duplicates—skipping.');
        } else {
          // Any other error should still abort
          console.error('Insert error:', error);
          process.exit(1);
        }
      }
      

    if (error) {
        console.error('Upsert error:', error);
        process.exit(1);
      }
      
      console.log('Upsert complete (duplicates and no-ops skipped).');

    process.exit(0);
  });
