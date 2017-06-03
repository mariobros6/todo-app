const {MongoClient, ObjectID} = require('mongodb');

//var  = 

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        console.log("erro connect" + err);
    } else {
        console.log('ok');

        // db.collection('Todos').insertOne({
        //     text: "zrobic gre",
        //     completion: false
        // }, (err, res) => {
        //     if (err) {
        //         return console.log("err: " + err);
        //     }
        //     console.log(JSON.stringify(res.ops, undefined, 2));
        // });

        // db.collection('Todos').find({
        //         _id: new ObjectID('592b43d6e508a11d19c797f0')
        //     }).toArray().then((docs) => {
        //     console.log('todos');
        //     console.log(JSON.stringify(docs, undefined, 2));
        // }, (err) => {
        //     console.log("blad: " + err);
        // })

        // db.collection('Todos').find().count().then((count) => {
        //     console.log('todos', count);
        // }, (err) => {
        //     console.log("blad: " + err);
        // });

        db.collection('Users').find({name: 'mariusz'}).toArray().then((docs) => {
            console.log('users:', JSON.stringify(docs, undefined, 2));
        }, (err) => {
            console.log('err:', err);
        });

        //db.close();
    }
});