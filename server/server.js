require('./config/config');

const {ObjectID} = require('mongodb');
const _ = require('lodash');
const {authenticate} = require('./middleware/authenticate');

var express = require('express');
var bodyParser = require('body-parser');
const bcrypt = require('bcryptjs')

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');


var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// USERS
// POST - dodaje usera

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

// POST - loguje usera

app.post('/users/login', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  User.findByCredentials(email, password).then((user) => {
    //res.send(user);
    return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    console.log(2, e);
    res.status(400).send();
  });

  

});

// POST - wylogowuje usera

app.delete('/users/me/token', authenticate, (req, res) => {
  // console.log(req);
  // console.log(1);
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  })
});

// POST - dodaje usera

app.get('/users/me', authenticate, (req, res) => {
  // console.log(2); 
  res.send(req.user);
});

// TODO
// POST - pobranie todos usera

app.get('/todos', authenticate, (req, res) => {
    Todo.find({_creator: req.user._id}).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.send(e);
    });
});

// dodanie todo

app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// get todo by id

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(404).send();

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
      
    } else { 
      return res.send({todo});
    }
  }, (err) => {
    res.send(400, err);
  });
  
});

app.delete('/todos/:id', authenticate,  (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id))
    return res.status(404).send();


  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user.id
  }).then((todo) => {
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

app.patch('/todos/:id', authenticate, (req, res) => {
  
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
    Todo.findOneAndUpdate({
      _id: id,
      _creator: req.user._id 
    }, {$set: body}, {new: true}).then((todo) => {
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
