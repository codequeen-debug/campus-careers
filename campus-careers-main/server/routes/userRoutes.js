const express = require('express');
const router = express.Router();

function usersCollection(req) {
  if (!req.app.locals.db) throw new Error('DB_NOT_READY');
  return req.app.locals.db.collection('users');
}

// Create or update user profile (frontend can POST the user object)
router.post('/', async (req, res) => {
  try {
    if (!req.app.locals.db) return res.status(503).json({ error: 'DB not connected' });
    const coll = usersCollection(req);
    const { uid, email, name, role, createdAt, disabled } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid is required' });
    const userDoc = { uid, email, name, role, createdAt: createdAt || new Date().toISOString(), disabled: !!disabled };
    await coll.updateOne({ uid }, { $set: userDoc }, { upsert: true });
    res.status(201).json(userDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save user' });
  }
});

router.get('/:uid', async (req, res) => {
  try {
    const coll = usersCollection(req);
    const uid = req.params.uid;
    const user = await coll.findOne({ uid });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/:uid', async (req, res) => {
  try {
    const coll = usersCollection(req);
    const uid = req.params.uid;
    const updates = { $set: req.body };
    const result = await coll.findOneAndUpdate({ uid }, updates, { returnDocument: 'after' });
    if (!result.value) return res.status(404).json({ error: 'Not found' });
    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:uid', async (req, res) => {
  try {
    const coll = usersCollection(req);
    const uid = req.params.uid;
    const result = await coll.deleteOne({ uid });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
