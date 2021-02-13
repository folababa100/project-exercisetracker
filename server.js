require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors');
const moment = require("moment");
const Exercise = require("./models/Exercise")
const User = require("./models/User")
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://folababa:folababa@cluster0.oio2g.mongodb.net/<dbname>?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }
  )
  .then(() =>
    console.log("database is up and running...", mongoose.connection.readyState)
  )
  .catch((err) => console.error(err, mongoose.connection.readyState));


app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.post("/api/exercise/new-user", async (req, res) => {
  const { username } = req.body;

  try {
    const getUser = await User.findOne({
      username
    })

    if(getUser) {
      return res.status(2000).send("User already exists");
    }

    const user = new User({
      username
    })

    const newUser = await user.save();

    res.status(201).json(newUser);
  } catch (err) {
    if(err) {
      console.log("err", err);
      res.status(500).json({
        success: false,
        message: "User creation was unsucessful",
      });
    }
  }
});

app.get("/api/exercise/users", async (req, res) => {
  try {
    const users = await User.find().exec();

    res.status(200).send(users);
  } catch (err) {
    if (err) {
      console.log("err", err);
      res.status(500).json({
        success: false,
        message: "User collections failed",
        err
      });
    }
  }
});

app.post("/api/exercise/add", async (req, res) => {
  const { userId, description, duration, date } = req.body;
  try {
    const exercise = new Exercise({
      userId,
      description,
      duration,
      date,
    });
    const findUser = await User.findOne({
      _id: userId
    })
    const newExecise = await exercise.save();
    console.log("findUser", findUser);
    console.log("newExecise", newExecise);
    res
      .status(200)
      .json({
        _id: findUser._id,
        username: findUser.username,
        description: newExecise.description,
        duration: newExecise.duration,
        date: newExecise.date,
      });
  } catch (err) {
    if (err) {
      console.log("err", err);
      res.status(500).json({
        success: false,
        message: "Excercise creation was unsucessful",
      });
    }
  }
});

app.get("/api/exercise/log/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const exercises = await Exercise.find(
      {
        userId,
      },
      {
        description: 1,
        duration: 1,
        date: 1,
        _id: 0
      }
    ).exec();

    console.log("exercises", exercises);
    res.status(200).send(exercises);
  } catch (err) {
    if (err) {
      console.log("err", err);
      res.status(500).json({
        success: false,
        message: "Exercise collections failed",
        err,
      });
    }
  }
});

app.get("/api/exercise/log/", async (req, res) => {
  try {
    const count = await Exercise.find().countDocuments();

    res.status(200).send(count);
  } catch (err) {
    if (err) {
      console.log("err", err);
      res.status(500).json({
        success: false,
        message: "Count collections failed",
        err,
      });
    }
  }
});

app.get("/api/exercise/log?{userId}[&from][&to][&limit]", async (req, res) => {
  const { from, to, limit, userId } = req.query;
  try {
    const findUser = await User.findOne({
      _id: userId,
    });

    const exercises = await Exercise.find(
      {
        userId,
        date: {
          $gte: new Date(from),
          $lt: new Date(to),
        },
      },
      {
        description: 1,
        duration: 1,
        date: 1,
      }
    ).limit(limit ? parseInt(limit) : 1);

    res.status(200).json({
      _id: findUser._id,
      username: findUser.username,
      log: exercises,
      from: from ? moment(new Date(from)).format("ddd MMM DD YYYY") : null,
      to: to ? moment(new Date(to)).format("ddd MMM DD YYYY") : null,
    });
  } catch (err) {
    if (err) {
      console.log("err", err);
      res.status(500).json({
        success: false,
        message: "Exercise collections failed",
        err,
      });
    }
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
