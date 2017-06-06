const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5936dc7bb236f7769d46a363';

if (!ObjectID.isValid(id)) {
    console.log('id not valid');
}

Todo.find({
    _id: id
}).then((todos) => {
    console.log(2, todos);
});
console.log('1');

Todo.findOne({
    _id: id
}).then((todo) => {
    console.log(3, todo);
});

Todo.findById(id).then((todo) => {
    if (!todo) {
        console.log('not found');
    }
    console.log(3, todo);
}).catch((err) => {
    console.log(err);
});

var userId = '59332d991b5be34655ad29f8';

if (!ObjectID.isValid(userId))
    console.log('user id not valid');

User.findById(userId).then((user) => {
    console.log('user:', user);
}).catch((err) => {
    console.log('err:', err);
})

console.log(2);
