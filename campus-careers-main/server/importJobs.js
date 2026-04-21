require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

const filePath = path.join(__dirname, 'jobsSeed.json');
if (!fs.existsSync(filePath)) {
  console.error('jobsSeed.json not found in server/');
  process.exit(1);
}

const jobs = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const force = process.argv.includes('--force');

async function run() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    const dbName = process.env.DB_NAME || 'campusCareersDB';
    const db = client.db(dbName);
    const coll = db.collection('jobs');

    const count = await coll.countDocuments();
    if (count > 0 && !force) {
      console.log(`jobs collection already has ${count} documents. Use --force to replace.`);
      return;
    }

    if (force) {
      await coll.deleteMany({});
      console.log('Cleared existing jobs collection.');
    }

    if (jobs.length === 0) {
      console.log('No jobs to import.');
      return;
    }

    const res = await coll.insertMany(jobs, { ordered: false });
    console.log(`Inserted ${res.insertedCount} job documents into ${dbName}.jobs`);
  } catch (err) {
    console.error('Import failed:', err);
    if (err && err.stack) console.error(err.stack);
  } finally {
    try { await client.close(); } catch (e) {}
  }
}

run();
