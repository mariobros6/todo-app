const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: "zadanie 1"
}, {
    _id: new ObjectID(),
    text: "zadanie 2"
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
      return Todo.insertMany(todos);
  }).then(() => done());
});


describe('post /todos', () => {
    it('should add todo', (done) => {
        var text = 'jakis tekst';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                console.log('------------------------');
                expect(res.body.text).toBe(text);
            })
            .end((err ,res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => {
                    console.log(err, "err");
                    done(e);
                });
            });
    });

    it('should not add', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));

            });
    });
});

describe('GET /todos', () => {
    it('return todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('powinno zwrocic wybrany rekord', (done) => {
        request(app)
            .get('/todos/' + todos[0]._id.toHexString())
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text)
            
            })
            .end(done);;
    });

    it('powinno zwrocic 404, gdy nie ma danych', (done) => {
        request(app)
            .get('/todos/' + (new ObjectID).toHexString())
            .expect(404)
            .end(done);
    });
});