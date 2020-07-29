const express = require('express');
const bodyParser = require('body-parser');
const db = require('./queries');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

// Testing the database
app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)
app.post('/add_user', db.addUser)
app.post('/get_id',db.getUserId)
app.post('/teams', db.teams)
app.post('/teams_by_membership',db.teams_by_membership)
app.post('/projects', db.projects)
app.post('/projects_by_membership',db.projects_by_membership)
app.post('/issues',db.issues)
app.post('/new_team',db.new_team)
app.post('/delete_team',db.delete_team)
app.post('/new_project',db.new_project)
app.post('/delete_project',db.delete_project)
app.post('/team_members',db.team_members)
app.post('/remove_member',db.remove_member)
app.post('/add_member',db.add_member)
app.post('/add_member_email',db.add_member_email)
app.post('/new_issue',db.new_issue)
app.post('/close_issue',db.close_issue)

app.listen(port, () => console.log(`Listening on port ${port}`));
