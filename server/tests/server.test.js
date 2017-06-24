const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


beforeEach(populateTodos);
beforeEach(populateUsers);


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

describe('DELETE /todos/:id', () => {
    it('powinno kasowac wyrbany rekord', (done) => {
        request(app)
            .delete('/todos/' + (todos[0]._id).toHexString())
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
                
            })
            .end((err, res) => {
                if (err) 
                    return done(err);
                
                Todo.findById(res.body._id).then((todo) =>  {

                    expect(todo).toNotExist();

                    return done();

                }).catch((err) => {
                    if (err)
                        return done(err);
                });
            });
    });

    it('powinno zwrocic 404 - nie znaleziono', (done) => {
        request(app)
            .get('/todos/' + (new ObjectID).toHexString())
            .expect(404)
            .end(done);
    });

    it('powinno zwrocic 404 - glupie id', (done) => {
        request(app)
            .get('/todos/2323')
            .expect(404)
            .end(done);
    });

});

describe('PATCH /todos', () => {
    it('powinno zrobic update', (done) => {
        request(app)
            .patch('/todos/' + todos[0]._id.toHexString())
            .send({completed: true, text: "nowa treść 2"})
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe('nowa treść 2')
                expect(res.body.todo.completed).toBe(true)
                expect(res.body.todo.completedAt).toBeA('number')
            })
            .end(done)
    });

     it('powinno wyczyścić completed', (done) => {
         request(app)
            .patch('/todos/' + todos[1]._id.toHexString())
            .send({completed: false, text: "ddd"})
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.text).toBe('ddd');
                expect(res.body.completedAt).toNotExist();
            })
            .end(done)
     })
});

describe('GET /users/me', () => {
    it('powinno zwrocic usera, jesli uwierzytelniony', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('powinno zwrocic 401, jesli nie uwierzytelniony', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    })
});

describe('POST /users/', () => {
    it('powinno zarejestrowac usera', (done) => {
        var email = 'maa2arar@ebr.pl';
        var password = 'pass1234';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email); 
                console.log(res.body);
                
            })
            .end((err) => {
               if (err)
                    return done(err);
                User.findOne({email}).then((user) => {
                    expect(user.email).toBe(email);
                    expect(user.password).toNotBe(password);
                    
                    done();
                }).catch((err) => {
                    return done(err);
                }); 
            });
    });

    it('nie powinno zarejestrowac, bo nie spelwnia wymagan', (done) => {
        var email = 'dsdasdasebr.pl';
        var pass = 'dasd';

        request(app)
            .post('/users')
            .send({email, pass})
            .expect(400)
            .end(done);
    });

    it('nie powinno zarejsrtowac takiego samego usera', (done) => {
        request(app)
            .post('/users')
            .send(users[0])
            .expect(400)
            .end(done)
    });
   
});

describe('POST /users/login', () => {
    it('should login user and return token', (done) => {
        request(app)
            .post('/users/login')
            .send({email: users[1].email, password: users[1].password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                
            })
            .end((err, res) => {
                if (err)
                    return done(err);
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((err) => {
                    return done(err);
                });
            });
    });
    it('should recejt user login', (done) => {
        request(app)
            .post('/users/login')
            .send({email:'aaa', password: 'pass'})
            //.send({email: users[1].email, password: users[1].password})
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
                
            })
            .end((err, res) => {
                if (err)
                    return done(err);
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((err) => {
                    return done(err);
                });
            })
    })
})