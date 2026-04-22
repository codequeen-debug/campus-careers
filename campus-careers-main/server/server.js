const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load variables from .env

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3005;

const { MongoClient, ServerApiVersion } = require("mongodb");

const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL;
if (!mongoURI) {
  console.error("Missing MONGO_URI environment variable. Create a .env with MONGO_URI.");
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.type("text");
  res.send(
    `Hello — Campus Careers backend.\nYou can use /api/jobs, /api/users, /api/applications endpoints.`
  );
});

// mount routers early so endpoints exist even if DB connection is still in progress
const jobRouter = require("./routes/jobRoutes");
const userRouter = require("./routes/userRoutes");
const applicationRouter = require("./routes/applicationRoutes");

app.use("/api/jobs", jobRouter);
app.use("/api/users", userRouter);
app.use("/api/applications", applicationRouter);

async function run() {
  try {
    await client.connect();

    const dbName = process.env.DB_NAME || "campusCareersDB";
    app.locals.db = client.db(dbName);

    // routers are mounted earlier; app.locals.db will be available to them now

    // Seed jobs when empty (basic seeding)
    try {
      const jobsColl = app.locals.db.collection("jobs");
      const count = await jobsColl.countDocuments();
      if (count === 0) {
        const jobsSeed = [
          { title: "Assistant Professor of Computer Science", institution: "State University", department: "Computer Science", location: "Austin, TX", salaryMin: 85000, salaryMax: 105000, type: "Full-time", description: "We are seeking a dynamic Assistant Professor to join our Computer Science department.", qualifications: "PhD in Computer Science or related field.", deadline: "2025-06-30", startDate: "2025-08-15", recruiterId: "recruiter1", postedDate: "2025-04-01" },
          { title: "Director of Financial Aid", institution: "Lakewood College", department: "Financial Services", location: "Denver, CO", salaryMin: 72000, salaryMax: 90000, type: "Full-time", description: "Lakewood College seeks an experienced Director of Financial Aid.", qualifications: "Master's degree preferred.", deadline: "2025-05-15", startDate: "2025-07-01", recruiterId: "recruiter1", postedDate: "2025-03-28" },
          { title: "Head Athletic Trainer", institution: "Riverside University", department: "Athletics", location: "Orlando, FL", salaryMin: 58000, salaryMax: 72000, type: "Full-time", description: "Riverside University Athletics is searching for a Head Athletic Trainer.", qualifications: "BOC certification required.", deadline: "2025-05-30", startDate: "2025-08-01", recruiterId: "recruiter2", postedDate: "2025-04-02" }
        ];

        await jobsColl.insertMany(jobsSeed);
        console.log("Seeded jobs collection with sample data.");
      }
    } catch (e) {
      console.warn("Job seeding failed:", e && e.message ? e.message : e);
    }

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.listen(port, () => {
      console.log(`Listening to port: ${port}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    if (err && err.stack) console.error(err.stack);
    // don't exit immediately — keep process alive to inspect logs
  }
}
run().catch((e) => { console.error('Run() unhandled error:', e); if (e && e.stack) console.error(e.stack); });

// Global handlers to capture unexpected crashes and rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  if (err && err.stack) console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (reason && reason.stack) console.error(reason.stack);
});


