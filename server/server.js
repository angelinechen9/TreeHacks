const express = require("express");
const hbs = require("hbs");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const _ = require("lodash");
require("dotenv").config();
const postsRoute = require("./routes/postsRoute.js");
const {Post} = require("./models/post.js");
const app = express();
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../views", "../public")));
hbs.registerPartials(path.join(__dirname, "../views", "partials"));
mongoose.connect("mongodb://localhost:27017/NewsFeed");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
const language = require("@google-cloud/language");
const client = new language.LanguageServiceClient();
let hashtags = [];
Post.find()
.then(posts => {
  posts.forEach(post => {
    const text = post.post;
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };
    client
      .analyzeEntitySentiment({document: document})
      .then(results => {
        const entities = results[0].entities;
        entities.sort((a, b) => {
          return b.salience - a.salience;
        })
        console.log(`Entities and sentiments:`);
        entities.slice(0, 10).forEach(entity => {
          console.log(`  Name: ${entity.name}`);
          console.log(`  Type: ${entity.type}`);
          console.log(`  Score: ${entity.sentiment.score}`);
          console.log(`  Magnitude: ${entity.sentiment.magnitude}`);
          hashtags.push(`#${entity.name}`);
        });
        console.log(hashtags);
        Post.findByIdAndUpdate(post.id, {$set: {hashtags: hashtags}}, {new: true})
        .then(post => {
          console.log(post.hashtags);
        })
        .catch(e => {
          res.status(404).send(e);
        })
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
  })
})
app.get("/", (req, res) => {
  res.redirect("/posts");
})
app.use("/posts", postsRoute);
app.listen(3000);
