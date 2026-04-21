const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

function appsCollection(req) {
  if (!req.app.locals.db) throw new Error('DB_NOT_READY');
  return req.app.locals.db.collection('applications');
}

router.post('/', async (req, res) => {
  try {
    if (!req.app.locals.db) return res.status(503).json({ error: 'DB not connected' });
    const coll = appsCollection(req);
    const appDoc = { ...req.body, dateApplied: req.body.dateApplied || new Date().toISOString(), status: req.body.status || 'pending' };
    const result = await coll.insertOne(appDoc);
    res.status(201).json({ ...appDoc, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

router.get('/', async (req, res) => {
  try {
    const coll = appsCollection(req);
    const docs = await coll.find({}).sort({ dateApplied: -1 }).toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const coll = appsCollection(req);
    const id = req.params.id;
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const doc = await coll.findOne(query);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const coll = appsCollection(req);
    const id = req.params.id;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const updates = { $set: req.body };
    const result = await coll.findOneAndUpdate(filter, updates, { returnDocument: 'after' });
    if (!result.value) return res.status(404).json({ error: 'Not found' });
    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const coll = appsCollection(req);
    const id = req.params.id;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await coll.deleteOne(filter);
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
