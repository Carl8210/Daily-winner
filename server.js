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

function pickWinners() {
  const shuffled = names.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
  const dailyResult = {
    date: today,
    winner: selected[0],
    runnersUp: selected.slice(1)
  };
  fs.writeFileSync(winnersFile, JSON.stringify(dailyResult, null, 2));
  return dailyResult;
}

cron.schedule('0 4 * * *', () => {
  pickWinners();
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
      const newData = pickWinners();
      res.json(newData);
    }
  } catch {
    const newData = pickWinners();
    res.json(newData);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
