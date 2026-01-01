require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');

mongoose.connect(process.env.CONNECTIONSTRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority',
  ssl: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  app.emit('pronto');
})
.catch(e => console.log(e));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); // Deve estar antes de sessionOptions
app.use(express.static(path.resolve(__dirname, 'public')));

// session + store (connect-mongo) — necessário para persistência
const sessionOptions = session({
  secret: process.env.SESSION_SECRET || 'mudar_para_um_segredo',
  resave: false,
  saveUninitialized: false, // Crucial: não salva sessions vazias
  store: process.env.CONNECTIONSTRING
    ? MongoStore.create({ 
        mongoUrl: process.env.CONNECTIONSTRING,
        touch: false // Não toca em sessions existentes automaticamente
      })
    : undefined,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: false
  }
});
app.use(sessionOptions);
app.use(flash());

// Middleware: intercepta tentativas de salvar session vazia
app.use((req, res, next) => {
  const originalSave = req.session?.save;
  
  if (originalSave) {
    req.session.save = function(callback) {
      // Só salva se houver dados de usuário
      if (this.user) {
        originalSave.call(this, callback);
      } else if (callback) {
        // Não salva session vazia
        callback();
      }
    };
  }
  
  next();
});

// Middleware para disponibilizar mensagens flash em res.locals
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.session?.user || null; // Disponibiliza usuário em todas as views
  next();
});

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

const routes = require('./routes');
app.use(routes);

let port =  3000;

app.on('pronto', () => {
  const server = app.listen(port)
    .on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`port ${port} já está em uso. tentando a próxima porta`);
        port++;
        server.close(() => {
          app.listen(port, () => {
            console.log(`servidor executando na porta ${port}`);
            console.log(`Acessar http://localhost:${port}`);
          });
        });
      } else {
        console.error(e);
      }
    })
    .on('listening', () => {
      console.log(`servidor executando na porta ${port}`);
      console.log(`Acessar http://localhost:${port}`);
    });
});

