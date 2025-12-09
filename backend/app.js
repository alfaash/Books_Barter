require("dotenv").config();
require("express-async-errors");
const path = require('path');
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const http=require('http');
const {Server} = require("socket.io");

const connectDB = require("./db/connect");

// routes
const authRouter = require("./routes/auth");
const userRouter = require("./routes/users");
const swapRouter = require("./routes/swap");
const chatRouter = require("./routes/chat");
const getOneUserRouter=require("./routes/getOneUser");
const booksRouterFactory = require("./routes/books");
const authenticateUser = require("./middleware/authentication");

// error handling
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/api/v1", (req, res) => res.send("Hello"));

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // ✅ Multer memory storage (no gridfs storage lib)
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cap; adjust if needed
    });

    // Inject upload into books router
    const booksRouter = booksRouterFactory(upload);

    // Using Socket IO
    const server=http.createServer(app);
    const io = new Server(server);
    io.on('connection', (socket)=>{
      // if any userMessage comes from frontend 
      socket.on('userMessage',message =>{
          //send the message to all the users
          io.emit('message',message);
      })
    });

    app.use(express.static(path.join(__dirname, 'public')));
    app.use("/api/v1/auth", authRouter);
    app.use("/api/v1/users/:id", getOneUserRouter);
    app.use("/api/v1/users", authenticateUser, userRouter);
    app.use("/api/v1/books", booksRouter);
    app.use("/api/v1/swap",swapRouter);
    app.use("/api/v1/chat",chatRouter);

    app.use(notFoundMiddleware);
    app.use(errorHandlerMiddleware);

    let port=process.env.PORT || 5000;
    
    server.listen(port, () => console.log(`🚀 Server is listening on port ${port}...`));
  } catch (error) {
    console.error(error);
  }
};

start();
