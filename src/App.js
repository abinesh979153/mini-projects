[8:42 pm, 23/04/2026] anish: // ============================================================
// ShopReact - A complete eCommerce app in a single JSX file
// Uses: React Hooks, Context API, React Router (HashRouter),
//       React-Bootstrap for layout, custom CSS-in-JS styles.
// ============================================================

import { useState, useEffect, useContext, createContext, useCallback } from "react";

// ─── Router (HashRouter so it works without a server) ────────
const RouterContext = createContext({ path: "/", navigate: () => {} });

function HashRouter({ children }) {
  const getPath = () => window.location.hash.replace(/^#/, "") || "/";
  const [path, setPath] = useState(getPath);
  useEffect(() => {
    const handler = () => setPath(getPath());
    window.a…
[6:41 am, 25/04/2026] anish: import { useState, useEffect, useRef, useCallback } from "react";

const FILTERS = ["All", "Incomplete", "Completed"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,600;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f5f0e8;
    --surface: #fffef9;
    --ink: #1a1410;
    --ink-muted: #7a6f63;
    --accent: #c84b2f;
    --accent-pale: #f5ddd8;
    --green: #2e7d52;
    --green-pale: #d6ede1;
    --border: #d4ccc0;
    --shadow: 0 2px 8px rgba(26,20,16,0.08);
    --shadow-lg: 0 8px 32px rgba(26,20,16,0.12);
  }

  body {
    background: var(--bg);
    font-family: 'DM Mono', monospace;
    color: var(--ink);
    min-height: 100vh;
    padding: 0;
  }

  .app {
    max-width: 640px;
    margin: 0 auto;
    padding: 48px 24px 80px;
  }

  .header {
    margin-bottom: 40px;
  }

  .header-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
  }

  .header-title {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: clamp(36px, 8vw, 56px);
    line-height: 1.0;
    color: var(--ink);
  }

  .header-title em {
    font-style: italic;
    color: var(--accent);
  }

  .stats {
    margin-top: 12px;
    font-size: 12px;
    color: var(--ink-muted);
  }

  /* Input area */
  .add-form {
    display: flex;
    gap: 0;
    margin-bottom: 28px;
    border: 1.5px solid var(--ink);
    border-radius: 4px;
    overflow: hidden;
    background: var(--surface);
    box-shadow: var(--shadow);
    transition: box-shadow 0.2s;
  }

  .add-form:focus-within {
    box-shadow: var(--shadow-lg);
  }

  .add-input {
    flex: 1;
    padding: 14px 16px;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    border: none;
    background: transparent;
    color: var(--ink);
    outline: none;
  }

  .add-input::placeholder { color: var(--ink-muted); }

  .add-btn {
    padding: 14px 20px;
    background: var(--ink);
    color: var(--bg);
    border: none;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
  }

  .add-btn:hover { background: var(--accent); }

  /* Filters */
  .filters {
    display: flex;
    gap: 6px;
    margin-bottom: 20px;
  }

  .filter-btn {
    padding: 6px 14px;
    border: 1.5px solid var(--border);
    border-radius: 100px;
    background: transparent;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all 0.15s;
  }

  .filter-btn:hover {
    border-color: var(--ink);
    color: var(--ink);
  }

  .filter-btn.active {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--bg);
  }

  /* Task list */
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .empty-state {
    text-align: center;
    padding: 48px 0;
    color: var(--ink-muted);
    font-size: 13px;
    font-style: italic;
    font-family: 'Fraunces', serif;
    font-weight: 300;
  }

  /* Task item */
  .task-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 6px;
    transition: all 0.15s;
    animation: slideIn 0.2s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .task-item:hover {
    border-color: var(--ink-muted);
    box-shadow: var(--shadow);
  }

  .task-item.completed {
    background: var(--green-pale);
    border-color: #b2d9c3;
  }

  /* Checkbox */
  .checkbox {
    width: 18px;
    height: 18px;
    border: 1.5px solid var(--ink-muted);
    border-radius: 3px;
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    background: transparent;
  }

  .checkbox.checked {
    background: var(--green);
    border-color: var(--green);
  }

  .checkbox.checked::after {
    content: '';
    width: 10px;
    height: 6px;
    border-left: 2px solid white;
    border-bottom: 2px solid white;
    transform: rotate(-45deg) translateY(-1px);
    display: block;
  }

  /* Task text */
  .task-body { flex: 1; min-width: 0; }

  .task-text {
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
    color: var(--ink);
    transition: all 0.15s;
  }

  .task-item.completed .task-text {
    color: var(--ink-muted);
    text-decoration: line-through;
    text-decoration-color: var(--green);
  }

  .task-edit-input {
    width: 100%;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    border: none;
    border-bottom: 1.5px solid var(--accent);
    background: transparent;
    color: var(--ink);
    outline: none;
    padding: 2px 0;
    line-height: 1.5;
  }

  .task-date {
    font-size: 10px;
    color: var(--ink-muted);
    margin-top: 3px;
    letter-spacing: 0.03em;
  }

  /* Actions */
  .task-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .icon-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ink-muted);
    font-size: 13px;
    transition: all 0.15s;
    padding: 0;
  }

  .icon-btn:hover { background: var(--accent-pale); color: var(--accent); }
  .icon-btn.confirm:hover { background: var(--green-pale); color: var(--green); }
  .icon-btn.delete:hover { background: var(--accent-pale); color: var(--accent); }

  /* Clear completed */
  .footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }

  .clear-btn {
    background: none;
    border: none;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--ink-muted);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.15s;
  }

  .clear-btn:hover { color: var(--accent); }

  @media (max-width: 480px) {
    .app { padding: 32px 16px 60px; }
    .add-btn { padding: 14px 14px; font-size: 12px; }
  }
`;

let idCounter = Date.now();
const genId = () => task_${++idCounter};

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitEdit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== task.text) onEdit(task.id, trimmed);
    setEditing(false);
  }, [draft, task.id, task.text, onEdit]);

  const cancelEdit = useCallback(() => {
    setDraft(task.text);
    setEditing(false);
  }, [task.text]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <div className={task-item${task.completed ? " completed" : ""}}>
      <div
        className={checkbox${task.completed ? " checked" : ""}}
        onClick={() => onToggle(task.id)}
        role="checkbox"
        aria-checked={task.completed}
        tabIndex={0}
        onKeyDown={e => e.key === " " && onToggle(task.id)}
      />
      <div className="task-body">
        {editing ? (
          <input
            ref={inputRef}
            className="task-edit-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitEdit}
          />
        ) : (
          <div className="task-text" onDoubleClick={() => setEditing(true)}>{task.text}</div>
        )}
        <div className="task-date">{formatDate(task.createdAt)}</div>
      </div>
      <div className="task-actions">
        {editing ? (
          <>
            <button className="icon-btn confirm" onClick={commitEdit} title="Save">✓</button>
            <button className="icon-btn" onClick={cancelEdit} title="Cancel">✕</button>
          </>
        ) : (
          <>
            <button className="icon-btn" onClick={() => setEditing(true)} title="Edit">✎</button>
            <button className="icon-btn delete" onClick={() => onDelete(task.id)} title="Delete">⌫</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("todo_tasks");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [filter, setFilter] = useState("All");
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setTasks(prev => [{ id: genId(), text, completed: false, createdAt: Date.now() }, ...prev]);
    setInput("");
    inputRef.current?.focus();
  }, [input]);

  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const editTask = useCallback((id, text) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(t => !t.completed));
  }, []);

  const filtered = tasks.filter(t =>
    filter === "All" ? true : filter === "Completed" ? t.completed : !t.completed
  );

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <p className="header-eyebrow">— your day, organized</p>
          <h1 className="header-title">What needs<br />to be <em>done?</em></h1>
          <p className="stats">
            {tasks.length === 0
              ? "No tasks yet"
              : ${completedCount} of ${tasks.length} complete}
          </p>
        </header>

        <div className="add-form">
          <input
            ref={inputRef}
            className="add-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="Add a new task…"
            aria-label="New task"
          />
          <button className="add-btn" onClick={addTask}>+ Add</button>
        </div>

        <div className="filters" role="group" aria-label="Filter tasks">
          {FILTERS.map(f => (
            <button
              key={f}
              className={filter-btn${filter === f ? " active" : ""}}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="task-list" role="list">
          {filtered.length === 0 ? (
            <p className="empty-state">
              {filter === "All" ? "Nothing here yet — add your first task above." :
               filter === "Completed" ? "No completed tasks." : "Everything's done!"}
            </p>
          ) : filtered.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
            />
          ))}
        </div>

        {completedCount > 0 && (
          <div className="footer">
            <button className="clear-btn" onClick={clearCompleted}>
              Clear {completedCount} completed
            </button>
          </div>
        )}
      </div>
    </>
  );
}
