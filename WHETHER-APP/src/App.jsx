// ============================================================
//  TODO REST API — COMPLETE SINGLE-FILE VERSION
//  Node.js + Express | CRUD | Validation | Tests
//  Run:  node todo-api-complete.js
//  Test: (copy test block into a separate file and run jest)
// ============================================================

// ── Dependencies ─────────────────────────────────────────────
// npm install express uuid morgan cors helmet express-validator dotenv

"use strict";

// ============================================================
// FILE: config/index.js
// ============================================================
const config = {
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || "development",
  },
  api: {
    version: process.env.API_VERSION || "v1",
    prefix: process.env.API_PREFIX || "/api",
  },
};


// ============================================================
// FILE: src/utils/response.js
// ============================================================

/**
 * Send a successful response.
 * @param {import("express").Response} res
 * @param {*} data
 * @param {string} [message]
 * @param {number} [statusCode=200]
 */
const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

/**
 * Send an error response.
 * @param {import("express").Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 */
const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({ success: false, message, data: null });
};


// ============================================================
// FILE: src/models/todo.model.js
// ============================================================
const { v4: uuidv4 } = require("uuid");

/**
 * @typedef {Object} Todo
 * @property {string}  id
 * @property {string}  title
 * @property {string}  note
 * @property {boolean} completed
 * @property {"low"|"medium"|"high"} priority
 * @property {string}  createdAt
 * @property {string}  updatedAt
 */

/** @type {Map<string, Todo>} */
const store = new Map();

const TodoModel = {
  /**
   * Return all todos, optionally filtered by completion status.
   * @param {{ completed?: boolean }} [filters]
   * @returns {Todo[]}
   */
  findAll(filters = {}) {
    let todos = Array.from(store.values());
    if (typeof filters.completed === "boolean") {
      todos = todos.filter((t) => t.completed === filters.completed);
    }
    return todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Find a single todo by ID.
   * @param {string} id
   * @returns {Todo|null}
   */
  findById(id) {
    return store.get(id) || null;
  },

  /**
   * Create and persist a new todo.
   * @param {{ title: string, note?: string, priority?: string }} data
   * @returns {Todo}
   */
  create({ title, note = "", priority = "medium" }) {
    const now = new Date().toISOString();
    const todo = {
      id: uuidv4(),
      title: title.trim(),
      note: note.trim(),
      completed: false,
      priority,
      createdAt: now,
      updatedAt: now,
    };
    store.set(todo.id, todo);
    return todo;
  },

  /**
   * Partially update an existing todo.
   * @param {string} id
   * @param {Partial<Todo>} data
   * @returns {Todo|null}
   */
  update(id, data) {
    const todo = store.get(id);
    if (!todo) return null;
    const allowed = ["title", "note", "completed", "priority"];
    allowed.forEach((key) => {
      if (data[key] !== undefined) {
        todo[key] = typeof data[key] === "string" ? data[key].trim() : data[key];
      }
    });
    todo.updatedAt = new Date().toISOString();
    store.set(id, todo);
    return todo;
  },

  /**
   * Delete a todo.
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    return store.delete(id);
  },

  /**
   * Return aggregate stats.
   * @returns {{ total: number, completed: number, pending: number }}
   */
  stats() {
    const all = Array.from(store.values());
    const completed = all.filter((t) => t.completed).length;
    return { total: all.length, completed, pending: all.length - completed };
  },
};


// ============================================================
// FILE: src/middleware/validate.js
// ============================================================
const { body, query, validationResult } = require("express-validator");

/** Reject request if validation errors exist */
const rejectIfInvalid = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }
  next();
};

const PRIORITIES = ["low", "medium", "high"];

const validate = {
  /** POST /todos */
  createTodo: [
    body("title")
      .trim()
      .notEmpty().withMessage("title is required")
      .isLength({ max: 200 }).withMessage("title must be ≤ 200 characters"),
    body("note")
      .optional().trim()
      .isLength({ max: 1000 }).withMessage("note must be ≤ 1000 characters"),
    body("priority")
      .optional()
      .isIn(PRIORITIES).withMessage(priority must be one of: ${PRIORITIES.join(", ")}),
    rejectIfInvalid,
  ],

  /** PATCH /todos/:id */
  updateTodo: [
    body("title")
      .optional().trim()
      .notEmpty().withMessage("title cannot be empty")
      .isLength({ max: 200 }).withMessage("title must be ≤ 200 characters"),
    body("note")
      .optional().trim()
      .isLength({ max: 1000 }).withMessage("note must be ≤ 1000 characters"),
    body("completed")
      .optional()
      .isBoolean().withMessage("completed must be a boolean"),
    body("priority")
      .optional()
      .isIn(PRIORITIES).withMessage(priority must be one of: ${PRIORITIES.join(", ")}),
    rejectIfInvalid,
  ],

  /** GET /todos */
  listTodos: [
    query("completed")
      .optional()
      .isBoolean().withMessage("completed query param must be 'true' or 'false'")
      .toBoolean(),
    rejectIfInvalid,
  ],
};


// ============================================================
// FILE: src/middleware/errorHandler.js
// ============================================================

/** 404 — catches requests that fell through all routes */
const notFound = (req, res, next) => {
  const err = new Error(Route not found: ${req.method} ${req.originalUrl});
  err.status = 404;
  next(err);
};

/** Global error handler — must be registered last */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isDev = config.server.env === "development";
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    ...(isDev && { stack: err.stack }),
  });
};


// ============================================================
// FILE: src/controllers/todo.controller.js
// ============================================================

const TodoController = {
  /** GET /todos  — optional ?completed= filter */
  getAll(req, res) {
    const filters = {};
    if (req.query.completed !== undefined) filters.completed = req.query.completed;
    const todos = TodoModel.findAll(filters);
    sendSuccess(res, todos, ${todos.length} todo(s) found);
  },

  /** GET /todos/stats */
  getStats(req, res) {
    sendSuccess(res, TodoModel.stats(), "Todo stats");
  },

  /** GET /todos/:id */
  getById(req, res) {
    const todo = TodoModel.findById(req.params.id);
    if (!todo) return sendError(res, "Todo not found", 404);
    sendSuccess(res, todo, "Todo retrieved");
  },

  /** POST /todos  — body: { title, note?, priority? } */
  create(req, res) {
    const { title, note, priority } = req.body;
    const todo = TodoModel.create({ title, note, priority });
    sendSuccess(res, todo, "Todo created", 201);
  },

  /** PATCH /todos/:id  — partial update */
  update(req, res) {
    const todo = TodoModel.update(req.params.id, req.body);
    if (!todo) return sendError(res, "Todo not found", 404);
    sendSuccess(res, todo, "Todo updated");
  },

  /** DELETE /todos/:id */
  remove(req, res) {
    const deleted = TodoModel.delete(req.params.id);
    if (!deleted) return sendError(res, "Todo not found", 404);
    sendSuccess(res, null, "Todo deleted");
  },

  /** PATCH /todos/:id/toggle  — flip completed flag */
  toggle(req, res) {
    const existing = TodoModel.findById(req.params.id);
    if (!existing) return sendError(res, "Todo not found", 404);
    const todo = TodoModel.update(req.params.id, { completed: !existing.completed });
    sendSuccess(res, todo, Todo marked as ${todo.completed ? "completed" : "pending"});
  },
};


// ============================================================
// FILE: src/routes/health.routes.js  +  src/routes/todo.routes.js
// ============================================================
const { Router } = require("express");

// Health router
const healthRouter = Router();
healthRouter.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    uptime: ${Math.floor(process.uptime())}s,
  });
});

// Todo router
const todoRouter = Router();
todoRouter.get("/stats",       TodoController.getStats);                              // must be before /:id
todoRouter.get("/",            validate.listTodos,  TodoController.getAll);
todoRouter.post("/",           validate.createTodo, TodoController.create);
todoRouter.get("/:id",                              TodoController.getById);
todoRouter.patch("/:id",       validate.updateTodo, TodoController.update);
todoRouter.delete("/:id",                           TodoController.remove);
todoRouter.patch("/:id/toggle",                     TodoController.toggle);


// ============================================================
// FILE: src/app.js
// ============================================================
const express = require("express");
const morgan  = require("morgan");
const cors    = require("cors");
const helmet  = require("helmet");

const app = express();

// Security & utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan(config.server.env === "production" ? "combined" : "dev"));

// Mount routes
const base = ${config.api.prefix}/${config.api.version};
app.use(${base}/health, healthRouter);
app.use(${base}/todos,  todoRouter);

// Root info
app.get("/", (req, res) => {
  res.json({
    message: "Todo API",
    version: config.api.version,
    todos:   ${base}/todos,
    health:  ${base}/health,
  });
});

// Error handling (must come after routes)
app.use(notFound);
app.use(errorHandler);


// ============================================================
// FILE: src/server.js  — start the server
// ============================================================
const { port, env } = config.server;

const server = app.listen(port, () => {
  console.log(\n🚀  Todo API running);
  console.log(`   Env  : ${env}`);
  console.log(`   Port : ${port}`);
  console.log(`   URL  : http://localhost:${port}${config.api.prefix}/${config.api.version}/todos\n`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(\n${signal} received — shutting down…);
  server.close(() => { console.log("Server closed."); process.exit(0); });
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

module.exports = app; // export for testing

