const {MongoClient, ObjectID} = require('mongodb');

//var  = 

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        console.log("erro connect" + err);
    } else {
        console.log('ok');

        // db.collection('Users').find({name: 'mariusz'}).toArray().then((docs) => {
        //     console.log('users:', JSON.stringify(docs, undefined, 2));
        // }, (err) => {
        //     console.log('err:', err);
        // });

        // db.collection('Todos').findOneAndDelete({completion: false}).then((res) => {
        //     console.log(res);
        // });

        db.collection('Users').findOneAndUpdate({
            _id : new ObjectID("592b44736cccce1da8956b36")
        }, {
            $inc: {
                age: 5
            }, 
            $set: {
                name: "marrroororoor"
            }
        }, {
            returnOriginal: false
        }).then((res) => {
            console.log(res);
        });


        //db.close();
    }
});