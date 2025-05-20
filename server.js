const express = require('express');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const names = require('./names.json');
const winnersFile = path.join(__dirname, 'winner.json');

function pickRandomWinner() {
  const winner = names[Math.floor(Math.random() * names.length)];
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
  const dailyWinner = { name: winner, date: today };
  fs.writeFileSync(winnersFile, JSON.stringify(dailyWinner, null, 2));
  return dailyWinner;
}

cron.schedule('0 4 * * *', () => {
  pickRandomWinner();
}, {
  timezone: "Europe/Berlin"
});

app.get('/names', (req, res) => {
  res.json(names);
});

app.get('/winner', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(winnersFile));
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
    if (data.date === today) {
      res.json(data);
    } else {
      const newWinner = pickRandomWinner();
      res.json(newWinner);
    }
  } catch {
    const newWinner = pickRandomWinner();
    res.json(newWinner);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
