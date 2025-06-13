const express = require('express');
const router = express.Router();
const Job = require('../models/Job.js');

// Admin - Create Job
router.post('/jobcreate', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Public - Get All Jobs
router.get('/', async (req, res) => {
  const jobs = await Job.find().sort({ deadline: 1 });
  res.json(jobs);
});

module.exports = router;
