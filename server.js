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
    "mongodb+srv://folababa:folababa@cluster0.oio2g.mongodb.net/exercisetracker?retryWrites=true&w=majority",
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
      return res.status(200).json("User already exists");
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

    res.status(200).json(users);
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
    const exercise = new Exercise(
      date
        ? {
            userId,
            description,
            duration,
            date: new Date(date),
          }
        : {
            userId,
            description,
            duration,
          }
    );
    const findUser = await User.findOne({
      _id: userId
    })
    const newExecise = await exercise.save();
    console.log("findUser", findUser);
    console.log("newExecise", newExecise);
    res.status(200).json({
      _id: findUser._id,
      username: findUser.username,
      description: newExecise.description,
      duration: newExecise.duration,
      date: moment(newExecise.date).format("ddd MMM DD YYYY"),
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

// app.get("/api/exercise/log/", async (req, res) => {
//   try {
//     const count = await Exercise.find().countDocuments();

//     res.status(200).json(count);
//   } catch (err) {
//     if (err) {
//       console.log("err", err);
//       res.status(500).json({
//         success: false,
//         message: "Count collections failed",
//         err,
//       });
//     }
//   }
// });

app.get("/api/exercise/log", async (req, res) => {
  const { from, to, limit, userId } = req.query;
  try {
    const findUser = await User.findOne({
      _id: userId,
    });
    if(!findUser) {
      return res.status(500).json("Unknown userId");
    }

    const exercises = await Exercise.find(
      {
        userId,
        date: {
          $gte: from ? new Date(from) : new Date(0),
          $lte: from ? new Date(to) : new Date(),
        },
      },
      {
        description: 1,
        duration: 1,
        _id: 0,
        date: 1,
      }
    ).limit(limit ? parseInt(limit) : 1);

    const exercisesDocumentNumber = await Exercise.find(
      {
        userId,
        date: {
          $gte: from ? new Date(from) : new Date(0),
          $lt: from ? new Date(to) : new Date(),
        },
      },
      {
        description: 1,
        duration: 1,
        date: 1,
      }
    ).limit(limit ? parseInt(limit) : 1).countDocuments()

    res.status(200).json({
      _id: findUser._id,
      username: findUser.username,
      log: exercises,
      from: from
        ? moment(new Date(from)).format("ddd MMM DD YYYY")
        : moment(new Date(0)).format("ddd MMM DD YYYY"),
      to: to
        ? moment(new Date(to)).format("ddd MMM DD YYYY")
        : moment(new Date()).format("ddd MMM DD YYYY"),
      count: exercisesDocumentNumber,
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
  res.jsonFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
