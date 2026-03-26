const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { jwtAuthMiddleware, adminOnly } = require('../jwt');
const Candidate = require('../models/candidate');

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /candidate — add a candidate (admin only)
router.post('/', jwtAuthMiddleware, adminOnly, async (req, res) => {
    try {
        const { name, party, age } = req.body;

        if (!name || !party || age === undefined) {
            return res.status(400).json({ error: 'name, party, and age are required' });
        }

        if (age < 25) {
            return res.status(400).json({ error: 'Candidate must be at least 25 years old' });
        }

        const newCandidate = new Candidate({ name, party, age });
        const saved = await newCandidate.save();

        return res.status(201).json({ candidate: saved });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /candidate/:candidateID — update a candidate (admin only)
router.put('/:candidateID', jwtAuthMiddleware, adminOnly, async (req, res) => {
    try {
        const { candidateID } = req.params;

        if (!isValidObjectId(candidateID)) {
            return res.status(400).json({ error: 'Invalid candidate ID' });
        }

        const updated = await Candidate.findByIdAndUpdate(
            candidateID,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ error: 'Candidate not found' });

        return res.status(200).json({ candidate: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /candidate/:candidateID — remove a candidate (admin only)
router.delete('/:candidateID', jwtAuthMiddleware, adminOnly, async (req, res) => {
    try {
        const { candidateID } = req.params;

        if (!isValidObjectId(candidateID)) {
            return res.status(400).json({ error: 'Invalid candidate ID' });
        }

        const deleted = await Candidate.findByIdAndDelete(candidateID);
        if (!deleted) return res.status(404).json({ error: 'Candidate not found' });

        return res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /candidate/vote/count — get vote counts for all candidates (public)
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: -1 });

        const result = candidates.map((c) => ({
            name: c.name,
            party: c.party,
            voteCount: c.voteCount
        }));

        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /candidate/vote/:candidateID — cast a vote (voter only)
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        const { candidateID } = req.params;
        const userId = req.user.id;

        if (!isValidObjectId(candidateID)) {
            return res.status(400).json({ error: 'Invalid candidate ID' });
        }

        if (req.user.role === 'admin') {
            return res.status(403).json({ error: 'Admins are not allowed to vote' });
        }

        const [candidate, user] = await Promise.all([
            Candidate.findById(candidateID),
            require('../models/user').findById(userId)
        ]);

        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.isVoted) {
            return res.status(400).json({ error: 'You have already voted' });
        }

        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        user.isVoted = true;

        await Promise.all([candidate.save(), user.save()]);

        return res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /candidate — list all candidates (public, name and party only)
// ✅ FIXED: removed '-_id' so frontend can access candidate._id for voting
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name party');
        return res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;