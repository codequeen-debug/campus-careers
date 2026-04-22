const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

function jobsCollection(req) {
  if (!req.app.locals.db) throw new Error('DB_NOT_READY');
  return req.app.locals.db.collection('jobs');
}

router.get('/', async (req, res) => {
  try {
    if (!req.app.locals.db) return res.status(503).json({ error: 'DB not connected' });
    const coll = jobsCollection(req);
    const docs = await coll.find({}).sort({ postedDate: -1 }).toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!req.app.locals.db) return res.status(503).json({ error: 'DB not connected' });
    const coll = jobsCollection(req);
    const id = req.params.id;
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const doc = await coll.findOne(query);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.app.locals.db) return res.status(503).json({ error: 'DB not connected' });
    const coll = jobsCollection(req);
    const job = { ...req.body, postedDate: req.body.postedDate || new Date().toISOString() };
    const result = await coll.insertOne(job);
    res.status(201).json({ ...job, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const coll = jobsCollection(req);
    const id = req.params.id;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const updates = { $set: req.body };
    const result = await coll.findOneAndUpdate(filter, updates, { returnDocument: 'after' });
    if (!result.value) return res.status(404).json({ error: 'Not found' });
    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const coll = jobsCollection(req);
    const id = req.params.id;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    await coll.deleteOne(filter);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
