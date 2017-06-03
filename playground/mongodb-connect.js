const MongoClient = require('mongodb').MongoClient;

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

        db.collection('Users').insertOne({
            name: 'mariusz',
            age: 39,
            location: 'wawa'
        }, (err, res) => {
            if (err) {
                return console.log("err" + err);
            }

            console.log(JSON.stringify(res.ops[0]._id.getTimestamp(), undefined, 2));

        });
        db.close();
    }
});