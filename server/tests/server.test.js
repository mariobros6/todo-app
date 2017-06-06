const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

beforeEach((done) => {
  Todo.remove({}).then(() => done());
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

                Todo.find().then((todos) => {
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
                    expect(todos.length).toBe(0);
                    done();
                }).catch((e) => done(e));

            });
    });
});