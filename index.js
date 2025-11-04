const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const generateId = () => Math.random().toString(36).substring(2, 10);
const users = []
app.post('/api/users', function(req, res) {
  const { username } = req.body;

  const newUser = {username: username.trim(), _id: generateId()}
  users.push(newUser);
  res.json(newUser);
});

app.get('/api/users', function(req, res) {
  res.json(users)
});

app.post('/api/users/:_id/exercises', function(req, res) {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === _id);

  let newDate;
  if (date) {
    newDate = new Date(date);
  } else {
    newDate = new Date();
  }

  const exercise = {
    description: description.trim(), 
    duration: Number(duration), 
    date: newDate.toDateString()
  };

  if (!user.log) user.log = [];
  user.log.push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  });
});

app.get('/api/users/:_id/logs', function(req, res) {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);

  let log  = user.log || [];

  let limitedLog = log;
  if (limit) {
    limitedLog = log.slice(0, Number(limit));
  }
  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate)) {
      log = log.filter(ex => new Date(ex.date) >= fromDate);
    }
  } 

  if (to) {
    const fromTo = new Date(to);
    if(!isNaN(fromTo)) {
      log = log.filter(ex => new Date(ex.date) <= fromTo);
    }
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: limitedLog.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date
    })),
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
