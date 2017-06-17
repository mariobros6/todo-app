require('./config/config');

const {ObjectID} = require('mongodb');
const _ = require('lodash');
const {authenticate} = require('./middleware/authenticate');

var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');


var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post('/users', (req, res) => {
  var user = new User({
    email: req.body.email,
    password: req.body.password
  });

  user.save().then(() => {
    return user.generateAuthToken();
    //res.send(doc);
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});



app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.send(e);
    });
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(404).send();

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
      
    } else { 
      return res.send({todo});
    }
  }, (err) => {
    res.send(400, err);
  });
  
});

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id))
    return res.status(404).send();


  Todo.findByIdAndRemove(id).then((todo) => {
    // console.log(todo);
    if (!todo) {
      res.status(404).send();
    } else {
      return res.send({todo});
    }
    
  }).catch((err) => {
    return res.status(400).send();
  });

});

app.patch('/todos/:id', (req, res) => {
  
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    console.log(body);
    if (!ObjectID.isValid(id))
        return res.status(400).send();

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    console.log(body);
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo)
            res.status(400).send();
        console.log(todo);
        res.send({todo});

    }).catch((err) => {
      res.status(400).send();
    });
});

app.listen(port, () => {
  console.log('Started on port ' + port);
});

module.exports = {app};
