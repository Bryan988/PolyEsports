const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const upload = require('express-fileupload');
const expressSanitizer = require('express-sanitizer');
const csrf = require("csurf");
const toobusy = require('toobusy-js');
const hpp = require('hpp');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const teamsRouter = require('./routes/teams');
const tournamentRouter = require('./routes/tournaments');

const csrfMW = csrf({ cookie: true });

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json('10mb'));
//extended false means that values will only be string and array in body
app.use(express.urlencoded({ extended: false, limit:"1kb" }));
app.use(cookieParser());
app.use(csrfMW);
app.use(express.static(path.join(__dirname, 'public')));
app.use(upload());
app.use(expressSanitizer());
app.use(hpp());



app.use('/', indexRouter);
app.use("/teams",teamsRouter);
app.use("/tournaments",tournamentRouter);
app.use('/users', usersRouter);
app.use('/users/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(req, res, next) {
  if (toobusy()) {
    // log if you see necessary
    res.send(503, "Server Too Busy");
  } else {
    next();
  }
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log(err.stack);
  res.status(err.status || 500);
  res.render('error');
});

app.listen(4000);



module.exports = app;
