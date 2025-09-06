const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../json/exercises.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ler o arquivo' });
    }

    const exercises = JSON.parse(data);
    res.json(exercises);
  });
});

module.exports = router;
