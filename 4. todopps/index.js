// declare all module required
const express = require('express');
const hbs = require('hbs');
const http = require('http');
const path = require('path');
const session = require('express-session');

// use express for entire app
const app = express();

// use the hbs for view engine
app.set('view engine', 'hbs');

// register every folder static on views
app.set('views', path.join(__dirname, 'views'));

//json object
app.use(express.json());

//register partials folder inside views
hbs.registerPartials(__dirname + '/views/partials');

// call the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

const dbConnection = require('./connection/db');

app.use(express.urlencoded({ extended: true }));

// setting express session
app.use(
  session({
    cookie: {
      maxAge: 10800000,
      secure: false,
      httpOnly: true,
    },
    store: new session.MemoryStore(),
    saveUninitialized: false,
    resave: false,
    secret: 'secretValue',
  })
);

// setting middleware
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.get('/', function (req, res) {
  const query = `select * from task_tb`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let todos = [];

      for (let result of results) {
        todos.push({
          ...result,
        });
      }
      if (todos.length == 0) {
        todos = false;
      }
      res.render('index', {
        isLogin: req.session.isLogin,
        todos,
      });
    });
  });
});

app.post('/', function (req, res) {
  const { addTask, category } = req.body;

  if (addTask == 0 || category == 0) {
    req.session.message = {
      type: 'danger',
      message: 'add some taks !',
    };
    return res.redirect('/');
  }

  const query = `insert into task_tb (name, is_done, collections_id) values ('${addTask}', false, '${category}');`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;
      req.session.message = {
        type: 'success',
        message: 'successfully added',
      };

      res.redirect('/');
    });
    conn.release();
  });
});

app.get('/delete-todo/:id', function (req, res) {
  const { id } = req.params;

  const query = `delete from task_tb where id=${id}`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) {
        req.session.message = {
          type: 'danger',
          message: err.sqlMessage,
        };
        res.redirect('/');
      } else {
        req.session.message = {
          type: 'success',
          message: 'Delete successfully !',
        };
      }
      res.redirect('/');
    });
    conn.release();
  });
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', function (req, res) {
  const { email, password } = req.body;

  const query = `select id, email, username, MD5(password) from users_tb where email = '${email}' AND password = '${password}';`;

  if (email == '' || password == '') {
    req.session.message = {
      type: 'danger',
      message: 'Please fill all required fields !',
    };
    return res.redirect('/login');
  }

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      if (results.length == 0) {
        req.session.message = {
          type: 'danger',
          message: 'Email and Password are not Found !',
        };

        return res.redirect('/login');
      } else {
        // req.session.message = {
        //   type: 'success',
        //   message: 'Successfully Logged in !',
        // };

        req.session.isLogin = true;
        req.session.user = {
          id: results[0].id,
          email: results[0].email,
          username: results[0].username,
        };
        return res.redirect('/');
      }
    });

    conn.release();
  });
});

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

app.get('/register', function (req, res) {
  res.render('register');
});

app.post('/register', function (req, res) {
  const { email, username, password } = req.body;

  if (email == 0 || username == 0 || password == 0) {
    req.session.message = {
      type: 'danger',
      message: 'Please fill all required fields !',
    };
    return res.redirect('/register');
  }

  const query = `insert into users_tb (email, username, password) values ('${email}', '${username}', '${password}');`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      req.session.message = {
        type: 'success',
        message: 'Successfully registered !',
      };
      res.redirect('/register');
    });
    conn.release();
  });
});

app.listen(3000, function () {
  console.log('server is running on port 3000');
});
