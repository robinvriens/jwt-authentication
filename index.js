require('dotenv').config();

const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');
const authorize = require('./authorize');

const app = new Koa();
const router = new Router();
const port = process.env.PORT || 4000;

app.use(bodyParser());
app.use(router.routes());

const users = [
  {
    id: '5e3b4a69-a02e-45ae-9132-df31508fa6f1',
    name: 'John Doe',
    email: 'john@doe.com',
    password: '123456'
  },
  {
    id: 'd3c59238-98a4-4118-92e0-36c0ea545940',
    name: 'Jane Doe',
    email: 'jane@doe.com',
    password: '123456'
  }
];

const books = [
  {
    id: 1,
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling'
  },
  {
    id: 2,
    title: 'Jurassic Park',
    author: 'Michael Crichton'
  },
  {
    id: 3,
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien'
  }
];

router.use(async (ctx, next) => {
  const token = ctx.cookies.get('token');

  try {
    const { sub } = jwt.verify(token, process.env.JWT_SECRET);
    const user = users.find(user => user.id === sub);
    ctx.state.user = user;
  } catch (e) {
    ctx.state.user = null;
  }

  await next();
});

router.get('/user/me', ctx => {
  ctx.body = {
    user: ctx.state.user
  };
});

router.get('/', ctx => {
  ctx.body = 'Hello World!';
});

router.get('/books', authorize, ctx => {
  ctx.body = books;
});

router.post('/login', ctx => {
  const { email, password } = ctx.request.body;

  const user = users.find(
    user => user.email === email && user.password === password
  );

  if (!user) ctx.throw(400, 'Invalid Credentials');

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  ctx.cookies.set('token', token, {
    httpOnly: true
  });

  ctx.body = 'User has been successfully logged in!';
});

app.listen(port, () =>
  console.log(`Server is running at http://localhost:${port}`)
);
