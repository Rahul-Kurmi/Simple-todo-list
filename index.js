const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express(); // Create an instance of the Express application

// Use the express.json() middleware to parse the request body
app.use(express.json()); // Middleware to parse incoming JSON requests

// Store users and TODOs in arrays
const users = []; // Array to store registered users
const todos = []; // Array to store TODO items

// Secret key for JWT
const JWT_SECRET = "ilove100xdevsliveclassse"; // Define a secret key for signing JWTs

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public"))); // Middleware to serve static files from the 'public' folder

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({
      message: "Username and password fields can't be empty.",
    });
  }

  if (username.length < 5) {
    return res.json({ message: "Username must have at least 5 characters." });
  }

  if (users.find((user) => user.username === username)) {
    return res.json({ message: "You are already signed up!" });
  }

  users.push({ username, password });
  res.json({ message: "You are signed up successfully!" });
});

app.post("/signin", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ message: "Username and password are required." });
  }

  const foundUser = users.find(
    (user) => user.username === username && user.password === password
  );

  if (foundUser) {
    const token = jwt.sign({ username }, JWT_SECRET);
    res.json({ token, message: "You are signed in successfully!" });
  } else {
    res.json({ message: "Invalid username or password!" });
  }
});

function auth(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.json({ message: "Token is missing!" });
    }
  
    try {
      const decodedData = jwt.verify(token, JWT_SECRET);
      req.username = decodedData.username;
      next();
    } catch (error) {
      res.json({ message: "Invalid token!" });
    }
  }
  

// Route to get all To-Dos for the authenticated user
app.get("/todos", auth, (req, res) => {
  // Get the username from the request object
  const currentUser = req.username;

  // Filter the To-Dos based on the username
  const userTodos = todos.filter((todo) => todo.username === currentUser);

  // Send the filtered To-Dos in the response
  res.json(userTodos);
});

// Route to create a new To-Do
app.post("/todos", auth, (req, res) => {
  // Extract the title from the request body
  const { title } = req.body;

  // Get the username from the request object
  const currentUser = req.username;

  // Check if the title is provided
  if (!title) {
    // Send an error message if the title is missing
    return res.json({ message: "To-Do title cannot be empty." });
  }

  // Create a new To-Do object
  const newTodo = {
    id: todos.length + 1, // Generate a unique id
    username: currentUser,
    title,
    done: false, // Default to undone
  };

  // Add the new To-Do to the todos array
  todos.push(newTodo);

  // Send a success response
  res.json({ message: "To-Do created successfully!", todo: newTodo });
});

// Route to update a To-Do
app.put("/todos/:id", auth, (req, res) => {
  // Extract the id from the request parameters
  const { id } = req.params;

  // Extract the title from the request body
  const { title } = req.body;

  // Get the username from the request object
  const currentUser = req.username;

  // Find the To-Do with the provided id and username
  const todo = todos.find(
    (todo) => todo.id === parseInt(id) && todo.username === currentUser
  );

  // Check if the To-Do is not found
  if (!todo) {
    // Send an error message if the To-Do is not found
    return res.json({ message: "To-Do not found." });
  }

  // Check if the title is provided
  if (!title) {
    // Send an error message if the title is missing
    return res.json({ message: "To-Do title cannot be empty." });
  }

  // Update the title of the To-Do
  todo.title = title;

  // Send a success response
  res.json({ message: "To-Do updated successfully!", todo });
});

// Route to delete a To-Do
app.delete("/todos/:id", auth, (req, res) => {
  // Extract the id from the request parameters
  const { id } = req.params;

  // Get the username from the request object
  const currentUser = req.username;

  // Find the index of the To-Do with the provided id and username
  // The findIndex() method in JavaScript is used to find the index of the first element in an array that satisfies a given condition. If no element satisfies the condition, it returns -1
  const todoIndex = todos.findIndex(
    (todo) => todo.id === parseInt(id) && todo.username === currentUser
  );

  // Check if the To-Do is not found
  if (todoIndex === -1) {
    // Send an error message if the To-Do is not found
    return res.json({ message: "To-Do not found." });
  }

  // Remove the To-Do from the todos array
  todos.splice(todoIndex, 1);

  // Send a success response
  res.json({ message: "To-Do deleted successfully!" });
});

// Route to mark a To-Do as done/undone using PUT
app.put("/todos/:id/done", auth, (req, res) => {
  // Extract the id from the request parameters
  const { id } = req.params;

  // Get the username from the request object
  const currentUser = req.username;

  // Find the To-Do with the provided id and username
  const todo = todos.find(
    (todo) => todo.id === parseInt(id) && todo.username === currentUser
  );

  // Check if the To-Do is not found
  if (!todo) {
    // Send an error message if the To-Do is not found
    return res.json({ message: "To-Do not found." });
  }

  // Toggle the 'done' status of the To-Do
  todo.done = !todo.done;

  // Send a success response
  res.json({
    message: `To-Do marked as ${todo.done ? "done" : "undone"}.`,
    todo,
  });
});

// Start the server on port 3000
app.listen(3000 , () =>{
    console.log(`Listening at port 3000`);
});
