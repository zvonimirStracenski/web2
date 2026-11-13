import express from "express";
import "dotenv/config"
import session from 'express-session';
import path from 'node:path';

import indexRouter from './routes/index.js';
import { randomUUID } from "node:crypto";

const app = express();

app.set('views', path.join(import.meta.dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('trust proxy', 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use((req, res, next) => {
  req.session.secret_cookie = randomUUID();
  next();
});

app.use("/", indexRouter);

const PORT = process.env.PORT || 3000;


const server = app.listen(PORT, (err) => {
    if (err) {
        console.error('listen failed:', err);
        return;
    }
    console.log(`Server started on port ${PORT}`);
});

server.on('close', () => console.log('server closed'));
process.on('exit', (code) => console.log('exiting with code', code));

export default app;