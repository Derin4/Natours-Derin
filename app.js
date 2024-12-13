const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingsRoutes');
const viewRouter = require('./routes/viewRoutes');

// Start express app
const app = express();

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

// Serving static files

app.use(express.static(path.join(__dirname, 'public')));

const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://js.stripe.com',
  'https://m.stripe.network',
  'https://*.cloudflare.com',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://*.stripe.com',
  'https://*.cloudflare.com/',
  'https://bundle.js:*',
  'ws://127.0.0.1:*/',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:', 'ws:'],
      connectSrc: [
        "'self'",
        "'unsafe-inline'",
        'data:',
        'blob:',
        ...connectSrcUrls,
      ],
      baseUri: ["'self'"],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:', ...scriptSrcUrls],
      styleSrc: [
        "'self'",
        'https:',
        'http:',
        "'unsafe-inline'",
        ...styleSrcUrls,
      ],
      workerSrc: ["'self'", 'data:', 'blob:', 'https://m.stripe.network'],
      objectSrc: [],
      childSrc: ["'self'", 'blob:'],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:', 'http:'],
      formAction: ["'self'"],
      fontSrc: ["'self'", 'https:', 'http:', 'data:', ...fontSrcUrls],
      upgradeInsecureRequests: [],
    },
  })
);

// // Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API or IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);
// This will apply the limiter to routes that starts with api.

// Body parser, reading data from the body into req.body
// And limiting the data that comes from req.body
app.use(express.json({ limit: '10kb' }));

// This middleware enables us to parse data coming from a form without using the built API
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// Note that the above middleware is a built-in express middleware

// Cookie parser, reading data from the cookie
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS (cross site scrypting attacks)
// app.use(xss());
app.post('/', (req, res) => {
  const sanitizedInput = xss(req.body);
  console.log('Sanitized Input:', sanitizedInput);
  res.send('Input has been sanitized!');
});

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// This package is used to compress the request coming in
app.use(compression());

// // Testing middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
