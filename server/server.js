var express = require('express');
var bodyPArser = require('body-parser');


// save
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');


var newUser = new User({
    email: 'stefek@ebros.pl'
});

var app = express();

app.use(bodyPArser.json());

app.post('/todos', (req, res) => {
    var newTodo = new Todo({
        text: req.body.text
    });

    newTodo.save().then((doc) => {
        console.log('ok', doc);
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
        console.log('err', err);
    });
});

app.listen(3000, () => {
    console.log('server start');
})