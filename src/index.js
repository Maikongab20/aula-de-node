const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((users) => users.username === username);

  if (!user) {
    return response.status(400).json({ error: "user not found" });

  }

  request.user = user;
  return next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todo: [],
  };

  users.push(user);

  return response.status(201).json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  return response.json(user.todo);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  //console.log(`Checking`);
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    create_at: new Date()
  }
  //console.log(`Checking`);
  user.todo.push(todo);
  //console.log(todo);
  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todos = user.todo.find((todo) => todo.id === id);

  if (!todos) {
    return response.status(404).json({ error: "todo not found" });
  }

  todos.title = title;
  todos.deadline = new Date(deadline);

  return response.status(200).send();

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todo.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "todo not found" });
  }

  todo.done = true;

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todo.findIndex(todo => todo.id === id);

  if (todo === -1) {
    return response.status(404).json({ error: "todo not found" });
  }

  user.todo.splice(todo, 1);

  return response.status(201).send();
});

module.exports = app;