const express = require('express');
const router = express.Router();
const { analyzePosture } = require('../postureDetection');

router.post('/analyze', async (req, res) => {
  const { videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ message: 'Video URL is required' });
  }

  try {
    const io = req.app.get('io');
    await analyzePosture(videoUrl, io);
    res.json({ message: 'Video analysis started' });
  } catch (error) {
    res.status(500).json({ message: 'Error analyzing video: ' + error.message });
  }
});

module.exports = router;