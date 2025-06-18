// ! 🧱 1. MVC in Node.js

// * The MVC pattern (Model-View-Controller) is a software architectural pattern that separates application logic into three interconnected components:

// ! 🔹 M – Model
// * Represents the data layer and business logic.

// * You define schemas and interact with databases (e.g., MongoDB, PostgreSQL).

// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

module.exports = mongoose.model("User", userSchema);

// ! 🔹 V – View
//* Handles the UI layer.

//* In APIs, this might be JSON responses. In server-rendered apps, it could be HTML via EJS, Pug, etc.

// In an API context, when you use:

res.json({ message: "User created" }); //* — that is your View.

// 🔹 C – Controller
// * Acts as an intermediary between the Model and View.

// * Contains the application logic: handles requests, manipulates models, and returns views/responses.

// controllers/userController.js
const User = require("../models/User");

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("user", { user }); // or res.json(user) for APIs
};

//! ✅ Benefits of MVC in Node

//* Separation of concerns

//* Easier to maintain and test

//* Promotes scalability and modular design
