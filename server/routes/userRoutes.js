const express = require('express');
const router = express.Router();

function usersCollection(req) {
  if (!req.app.locals.db) throw new Error('DB_NOT_READY');
  return req.app.locals.db.collection('users');
}

// POST — create or update user profile
router.post('/', async (req, res) => {
  try {
    if (!req.app.locals.db) return res.status(503).json({ error: 'DB not connected' });
    const coll = usersCollection(req);
    const { uid, email, name, role, createdAt, disabled } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid is required' });
    const userDoc = {
      uid, email, name, role,
      createdAt: createdAt || new Date().toISOString(),
      disabled: !!disabled
    };
    await coll.updateOne({ uid }, { $set: userDoc }, { upsert: true });
    res.status(201).json(userDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save user' });
  }
});

// ── Must come before /:uid or Express mistakes "status" for a uid ──

// GET all users — admin dashboard
router.get('/', async (req, res) => {
  try {
    const coll = usersCollection(req);
    const users = await coll.find({}).sort({ createdAt: -1 }).toArray();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /:uid/status — suspend or enable a user (admin action)
router.put('/:uid/status', async (req, res) => {
  try {
    const coll = usersCollection(req);
    const { disabled } = req.body;
    if (typeof disabled !== 'boolean') {
      return res.status(400).json({ error: 'disabled must be true or false' });
    }
    const result = await coll.updateOne(
      { uid: req.params.uid },
      { $set: { disabled } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, uid: req.params.uid, disabled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// GET one user by uid
router.get('/:uid', async (req, res) => {
  try {
    const coll = usersCollection(req);
    const user = await coll.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /:uid — update any user fields
router.put('/:uid', async (req, res) => {
  try {
    const coll = usersCollection(req);
    const result = await coll.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'User not found' });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /:uid — remove a user
router.delete('/:uid', async (req, res) => {
  try {
    const coll = usersCollection(req);
    const result = await coll.deleteOne({ uid: req.params.uid });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
