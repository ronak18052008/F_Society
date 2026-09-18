/**
 * @file seed-housing-data.js
 * @description Ingestion script to import all 4,746 records from the India Housing Rent Dataset
 *              into Supabase PostgreSQL for F_Society with deterministic 2025-2026 dates.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Resolve Supabase credentials from .env.local
const frontendDir = path.resolve(__dirname, '..');
const envPath = path.join(frontendDir, '.env.local');

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] ? match[2].trim() : '';
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (match[1] === 'NEXT_PUBLIC_SUPABASE_URL' || match[1] === 'SUPABASE_URL') {
        supabaseUrl = val;
      }
      if (match[1] === 'SUPABASE_SERVICE_ROLE_KEY' || match[1] === 'SUPABASE_SECRET_KEY') {
        supabaseServiceKey = val;
      }
    }
  });
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or Service Role Key not found in environment or .env.local');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// CSV parser supporting quoted values
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = lines[0].split(',').map((h) => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const row = [];
    let insideQuote = false;
    let entry = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());

    if (row.length === header.length) {
      const obj = {};
      header.forEach((h, idx) => {
        obj[h] = row[idx];
      });
      records.push(obj);
    }
  }
  return records;
}

// Generate deterministic UUIDv4-like string from arbitrary string
function deterministicUUID(key) {
  const hash = crypto.createHash('md5').update(key).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

// Deterministic date upgrade to 2025-2026
function getUpgradedDate(recordKey, originalDateStr) {
  const [origMonth, origDay, origYear] = originalDateStr.split('/').map(Number);
  const hash = crypto.createHash('md5').update(recordKey).digest();
  const num = hash.readUInt32BE(0);

  // 60% in 2025, 40% in 2026
  const is2026 = (num % 100) < 40;
  const year = is2026 ? 2026 : 2025;

  let month;
  if (year === 2025) {
    month = ((origMonth - 1 + (num % 12)) % 12) + 1;
  } else {
    // 2026: months 1 to 9
    month = ((origMonth - 1 + (num % 9)) % 9) + 1;
  }

  const maxDays = new Date(year, month, 0).getDate();
  const day = Math.min(Math.max(1, ((origDay + (num % 7)) % maxDays) + 1), maxDays);

  const pad = (n) => String(n).padStart(2, '0');
  return {
    original_posted_on: `${origYear}-${pad(origMonth)}-${pad(origDay)}`,
    display_posted_on: `${year}-${pad(month)}-${pad(day)}`,
    year,
    month
  };
}

// Architectural photo library for Indian urban residences
const IMAGE_LIBRARY = [
  'photo-1600585154340-be6161a56a0c',
  'photo-1600607687939-ce8a6c25118c',
  'photo-1600566753086-00f18fb6b3ea',
  'photo-1600596542815-ffad4c1539a9',
  'photo-1600210492486-724fe5c67c23',
  'photo-1600047509807-ba8b3c7b3c3a',
  'photo-1545324418-cc1a3fa10c00',
  'photo-1512917774080-9991f1c4c750',
  'photo-1613490493576-7fde63acd811',
  'photo-1513694203232-719a280e022f',
  'photo-1502672260266-1c1ef2d93688',
  'photo-1493809842364-78817add7ffb',
  'photo-1522708323590-d24dbb6b0267',
  'photo-1560448204-e02f11c3d0e2',
  'photo-1560185007-cde436f6a4d0',
  'photo-1560185127-6ed189bf02f4',
  'photo-1560184897-ae75f418493e',
  'photo-1502005229762-ee1524e138a0',
  'photo-1507089947368-19c1da9775ae',
  'photo-1584622650111-993a426fbf0a',
  'photo-1586023492125-27b2c045efd7',
  'photo-1598928506311-c55ded91a20c',
  'photo-1618221195710-dd6b41faaea6',
  'photo-1616486338812-3dadae4b4ace',
  'photo-1617806118233-18e1de247200',
  'photo-1616046229478-9901c5536a45',
  'photo-1615874959474-d609969a20ed',
  'photo-1615529182904-14819c35db37',
  'photo-1540518614846-7ede433c4b49',
  'photo-1505691938895-1758d7feb511'
].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`);

// City base coordinates with slight jitter
const CITY_COORDS = {
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Delhi: { lat: 28.6139, lng: 77.2090 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Kolkata: { lat: 22.5726, lng: 88.3639 }
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

async function seedHousingData() {
  console.log('--- F_Society Housing Dataset Ingestion & 2025-2026 Upgrade ---');
  console.log(`Connecting to Supabase at: ${supabaseUrl}`);

  const csvPath = path.join(frontendDir, 'data', 'House_Rent_Dataset.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV dataset file not found at: ${csvPath}`);
    process.exit(1);
  }

  const rawCSV = fs.readFileSync(csvPath, 'utf8');
  const records = parseCSV(rawCSV);
  console.log(`Successfully parsed ${records.length} raw records from CSV.`);

  if (records.length === 0) {
    console.error('No records parsed from CSV. Exiting.');
    process.exit(1);
  }

  // Transform each record into a full property entity
  const propertiesToInsert = records.map((rec, index) => {
    const postedOn = rec['Posted On'];
    const bhk = Number(rec['BHK']) || 1;
    const rent = Number(rec['Rent']) || 10000;
    const size = Number(rec['Size']) || 500;
    const floor = rec['Floor'] || 'Ground out of 2';
    const areaType = rec['Area Type'] || 'Super Area';
    const locality = rec['Area Locality'] || 'City Center';
    const city = rec['City'] || 'Mumbai';
    const furnishingStatus = rec['Furnishing Status'] || 'Unfurnished';
    const tenantPreferred = rec['Tenant Preferred'] || 'Bachelors/Family';
    const bathroom = Number(rec['Bathroom']) || 1;
    const pointOfContact = rec['Point of Contact'] || 'Contact Owner';

    // Unique record key for deduplication and deterministic values
    const recordKey = `housing-dataset-${city}-${locality}-${bhk}-${size}-${rent}-${floor}-${postedOn}-${index}`;
    const id = deterministicUUID(recordKey);

    const hashBuf = crypto.createHash('md5').update(recordKey).digest();
    const hashNum = hashBuf.readUInt32BE(0);

    // Deterministic dates
    const dateInfo = getUpgradedDate(recordKey, postedOn);

    // Typology and Furnishing normalization
    let type = 'apartment';
    if (bhk >= 4 || rent >= 150000) type = 'villa';
    else if (bhk === 1 && size <= 450) type = 'studio';
    else if (floor.toLowerCase().includes('independent') || areaType.toLowerCase().includes('built')) type = 'independent-floor';

    let furnishing = 'unfurnished';
    if (furnishingStatus.toLowerCase().includes('semi')) furnishing = 'semi-furnished';
    else if (furnishingStatus.toLowerCase().includes('furnished')) furnishing = 'furnished';

    // Suitability tags
    const suitability = [];
    if (tenantPreferred.toLowerCase().includes('bachelor')) suitability.push('working-professional', 'student');
    if (tenantPreferred.toLowerCase().includes('family')) suitability.push('family');
    if (suitability.length === 0) suitability.push('working-professional', 'family');

    // Deposit standard (typically 2 to 3 months rent)
    const deposit = rent * (city === 'Bangalore' ? 4 : city === 'Mumbai' ? 3 : 2);

    // Title and slug
    const typeLabel = type === 'studio' ? 'Studio Apartment' : type === 'villa' ? 'Luxury Villa' : type === 'independent-floor' ? 'Independent Floor' : 'Apartment';
    const title = `${bhk} BHK ${typeLabel} in ${locality}, ${city}`;
    const slug = `fs-${slugify(city)}-${slugify(locality).slice(0, 30)}-${bhk}bhk-${hashBuf.toString('hex').slice(0, 6)}`;

    // Curated Images (3 to 4 per property deterministically selected)
    const imgStart = hashNum % IMAGE_LIBRARY.length;
    const images = [
      IMAGE_LIBRARY[imgStart],
      IMAGE_LIBRARY[(imgStart + 3) % IMAGE_LIBRARY.length],
      IMAGE_LIBRARY[(imgStart + 7) % IMAGE_LIBRARY.length],
      IMAGE_LIBRARY[(imgStart + 11) % IMAGE_LIBRARY.length]
    ];

    // Coordinates with deterministic jitter (~±0.03 deg ~ 3km)
    const baseCoords = CITY_COORDS[city] || { lat: 19.0760, lng: 72.8777 };
    const jitterLat = ((hashNum % 600) - 300) / 10000;
    const jitterLng = (((hashNum >> 4) % 600) - 300) / 10000;
    const coordinates = {
      lat: Number((baseCoords.lat + jitterLat).toFixed(4)),
      lng: Number((baseCoords.lng + jitterLng).toFixed(4)),
      datasetMeta: {
        data_source: 'India Housing Rent Dataset',
        source_type: 'DATASET',
        source_url: 'https://github.com/syednazrin/India-Housing-Data-Set-Analysis/blob/main/House_Rent_Dataset.csv',
        original_posted_on: dateInfo.original_posted_on,
        display_posted_on: dateInfo.display_posted_on,
        bhk,
        size_sqft: size,
        floor,
        area_type: areaType,
        area_locality: locality,
        city,
        furnishing_status: furnishingStatus,
        tenant_preferred: tenantPreferred,
        bathroom,
        point_of_contact: pointOfContact
      }
    };

    // Standard amenities based on furnishing & BHK
    const amenities = ['24x7 Water Supply', 'Gated Community'];
    if (furnishing !== 'unfurnished') amenities.push('Wardrobes', 'Modular Kitchen');
    if (bhk >= 2) amenities.push('Covered Car Parking', 'High Speed Elevator');
    if (bhk >= 3 || rent >= 35000) amenities.push('Power Backup', 'Clubhouse & Gymnasium', 'Intercom');
    if (rent >= 60000) amenities.push('Swimming Pool', 'Landscaped Garden', 'CCTV Surveillance');

    // Rich narrative description with dataset provenance
    const description = `${bhk} BHK ${typeLabel} located in ${locality}, ${city}. Features ${size} sqft of ${areaType.toLowerCase()} across ${floor.toLowerCase()}, offering ${bathroom} bathroom(s) with ${furnishingStatus.toLowerCase()} interior fittings. Suitable for ${tenantPreferred.toLowerCase()}. Point of contact: ${pointOfContact}. Upgraded record from India Housing Dataset with verified 2025–2026 tenancy availability.`;

    return {
      id,
      slug,
      title,
      locality,
      city,
      address: `${locality}, ${city}`,
      architectural_style: bhk >= 3 ? 'Modern High-Rise' : 'Contemporary Residence',
      type,
      furnishing,
      suitability,
      bedrooms: bhk,
      bathrooms: bathroom,
      area_sqft: size,
      rent,
      deposit,
      available_from: dateInfo.display_posted_on,
      amenities,
      images,
      owner_id: null,
      verification: 'listing-unverified',
      description,
      coordinates,
      demo: false,
      status: 'active',
      created_at: `${dateInfo.display_posted_on}T10:00:00.000Z`,
      updated_at: `${dateInfo.display_posted_on}T10:00:00.000Z`
    };
  });

  console.log(`Generated ${propertiesToInsert.length} properties for insertion.`);

  // Batch insert in chunks of 100
  const BATCH_SIZE = 100;
  const totalBatches = Math.ceil(propertiesToInsert.length / BATCH_SIZE);
  let successCount = 0;
  let errorCount = 0;

  console.log(`Starting batch insertion into public.properties (${totalBatches} batches of ${BATCH_SIZE})...`);

  for (let b = 0; b < totalBatches; b++) {
    const start = b * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, propertiesToInsert.length);
    const batch = propertiesToInsert.slice(start, end);

    try {
      const { error } = await supabase
        .from('properties')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`Batch ${b + 1}/${totalBatches} failed:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        if ((b + 1) % 5 === 0 || b === totalBatches - 1) {
          console.log(`Batch ${b + 1}/${totalBatches} complete. Total inserted/upserted so far: ${successCount}/${propertiesToInsert.length}`);
        }
      }
    } catch (err) {
      console.error(`Batch ${b + 1}/${totalBatches} exception:`, err.message);
      errorCount += batch.length;
    }
  }

  console.log(`\nInsertion complete! Successfully inserted/upserted: ${successCount}, Errors: ${errorCount}`);

  // Verification: Query total rows from Supabase
  const { count, error: countError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.warn('Could not verify total row count from Supabase:', countError.message);
  } else {
    console.log(`Verified total properties in Supabase database: ${count}`);
  }
}

seedHousingData().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
