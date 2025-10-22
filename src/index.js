require('dotenv').config();
const express = require('express');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const i18nextFsBackend = require('i18next-fs-backend');
const path = require('path');

// Initialize express app
const app = express();
const port = 3000;

// Initialize i18next
i18next
  .use(i18nextFsBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    detection: {
      order: ['querystring','cookie','header'],
      lookupQuerystring: 'lng',
      caches: false
    },
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
      addPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.missing.json')
    },
    fallbackLng: 'en',
    preload: ['en', 'sv', 'fi'],
    saveMissing: true
  });

const helmet = require('helmet');

// Middleware
app.use(helmet({ hsts: false, contentSecurityPolicy: false }));
app.use(i18nextMiddleware.handle(i18next));
app.use((req,res,next)=>{ res.locals.t=req.t; res.locals.i18n=req.i18n; next(); });
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '../public')));

const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET || 'a-very-secret-key-that-you-should-change',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));


// Routes
const reportRoutes = require('./routes/reportRoutes');
const caseRoutes = require('./routes/caseRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/', reportRoutes);
app.use('/', caseRoutes);
app.use('/', adminRoutes);


app.get('/', (req, res) => {
  res.redirect('/case/login');
});

// Start the server only if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;
