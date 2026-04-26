import { useState, useEffect, useRef } from 'react';

const API = '/todos';

// ─── Hooks ─────────────────────────────────────────────────────────
function useTodos() {
  const [todos,   setTodos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setTodos(json.data ?? []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (text, priority = 'medium') => {
    const res  = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, priority }),
    });
    const json = await res.json();
    if (json.success) setTodos(prev => [json.data, ...prev]);
  };

  const toggle = async (id, completed) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    await fetch(`${API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
  };

  const remove = async (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    await fetch(`${API}/${id}`, { method: 'DELETE' });
  };

  const clearCompleted = async () => {
    setTodos(prev => prev.filter(t => !t.completed));
    await fetch(API, { method: 'DELETE' });
  };

  return { todos, loading, error, add, toggle, remove, clearCompleted, reload: load };
}

// ─── TodoItem ───────────────────────────────────────────────────────
function TodoItem({ todo, onToggle, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200
        ${todo.completed
          ? 'bg-gray-900/40 border-gray-800/50 opacity-60'
          : 'bg-gray-900 border-gray-800 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5'
        }
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <button
        id={`check-${todo.id}`}
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`
          flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${todo.completed
            ? 'bg-brand-500 border-brand-500 text-white'
            : 'border-gray-600 hover:border-brand-400'
          }
        `}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.completed && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Text */}
      <div className="flex-1 flex flex-col">
        <span className={`text-sm leading-relaxed transition-all duration-200 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
          {todo.text}
        </span>
        <div className="flex gap-2 mt-1">
          <span className={`
            text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider
            ${todo.priority === 'high' ? 'bg-red-500/20 text-red-400' : 
              todo.priority === 'low' ? 'bg-blue-500/20 text-blue-400' : 
              'bg-yellow-500/20 text-yellow-400'}
          `}>
            {todo.priority}
          </span>
        </div>
      </div>

      {/* Delete — visible on hover */}
      <button
        id={`delete-${todo.id}`}
        onClick={() => onDelete(todo.id)}
        className={`
          flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-600
          hover:text-red-400 hover:bg-red-400/10 transition-all duration-150
          ${hovered ? 'opacity-100' : 'opacity-0'}
        `}
        aria-label="Delete todo"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── AddTodo ────────────────────────────────────────────────────────
function AddTodo({ onAdd }) {
  const [value, setValue]       = useState('');
  const [priority, setPriority] = useState('medium');
  const [shake, setShake]       = useState(false);
  const inputRef                = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!value.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      inputRef.current?.focus();
      return;
    }
    await onAdd(value.trim(), priority);
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 mb-6">
      <div className="flex gap-2">
        <input
          id="new-todo-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="What needs to be done?"
          className={`
            flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm
            text-gray-100 placeholder-gray-600 outline-none
            focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
            transition-all duration-200
            ${shake ? 'animate-pulse border-red-500/60' : ''}
          `}
        />
        <button
          id="add-todo-btn"
          type="submit"
          className="
            flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold
            bg-brand-500 hover:bg-brand-400 text-white
            transition-all duration-150 shadow-lg shadow-brand-500/25
            hover:shadow-brand-500/40 active:scale-95
          "
        >
          Add
        </button>
      </div>
      
      <div className="flex gap-2 items-center">
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Priority:</span>
        {['low', 'medium', 'high'].map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setPriority(p)}
            className={`
              px-2 py-1 rounded text-[10px] font-bold uppercase transition-all
              ${priority === p 
                ? (p === 'high' ? 'bg-red-500 text-white' : p === 'low' ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white')
                : 'bg-gray-800 text-gray-500 hover:text-gray-300'
              }
            `}
          >
            {p}
          </button>
        ))}
      </div>
    </form>
  );
}

// ─── Filter Tabs ────────────────────────────────────────────────────
function FilterTabs({ filter, setFilter, counts }) {
  const tabs = [
    { key: 'all',       label: 'All',       count: counts.all },
    { key: 'active',    label: 'Active',    count: counts.active },
    { key: 'completed', label: 'Completed', count: counts.completed },
  ];
  return (
    <div className="flex gap-1 mb-4 p-1 bg-gray-900 rounded-xl border border-gray-800">
      {tabs.map(tab => (
        <button
          key={tab.key}
          id={`filter-${tab.key}`}
          onClick={() => setFilter(tab.key)}
          className={`
            flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold
            flex items-center justify-center gap-1.5 transition-all duration-150
            ${filter === tab.key
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-300'
            }
          `}
        >
          {tab.label}
          <span className={`
            inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold
            ${filter === tab.key ? 'bg-white/20' : 'bg-gray-800'}
          `}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Stats Bar ──────────────────────────────────────────────────────
function StatsBar({ todos, onClearCompleted }) {
  const done = todos.filter(t => t.completed).length;
  const pct  = todos.length ? Math.round((done / todos.length) * 100) : 0;

  return (
    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
      <span className="text-xs text-gray-500">
        <span className="text-brand-400 font-semibold">{done}</span> of{' '}
        <span className="font-semibold text-gray-400">{todos.length}</span> complete
      </span>
      <div className="flex items-center gap-3">
        {/* Progress bar */}
        <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-300 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {done > 0 && (
          <button
            id="clear-completed-btn"
            onClick={onClearCompleted}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors duration-150"
          >
            Clear done
          </button>
        )}
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────
export default function App() {
  const { todos, loading, error, add, toggle, remove, clearCompleted } = useTodos();
  const [filter, setFilter] = useState('all');

  const visible = todos.filter(t => {
    if (filter === 'active')    return !t.completed;
    if (filter === 'completed') return  t.completed;
    return true;
  });

  const counts = {
    all:       todos.length,
    active:    todos.filter(t => !t.completed).length,
    completed: todos.filter(t =>  t.completed).length,
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl
            bg-gradient-to-br from-brand-500 to-brand-300 mb-3 shadow-glow">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Todo</h1>
          <p className="text-xs text-gray-500 mt-1">Stay focused, get things done.</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-5 shadow-2xl">

          <AddTodo onAdd={add} />
          <FilterTabs filter={filter} setFilter={setFilter} counts={counts} />

          {/* Error */}
          {error && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              ⚠️ {error} — Is the todo backend running on port 4001?
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-12 rounded-xl bg-gray-800/50 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && visible.length === 0 && (
            <div className="text-center py-10 text-gray-600">
              <div className="text-4xl mb-2">{filter === 'completed' ? '🎉' : '📋'}</div>
              <p className="text-sm">
                {filter === 'completed' ? 'Nothing completed yet.' : 'No tasks here. Add one above!'}
              </p>
            </div>
          )}

          {/* List */}
          {!loading && (
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto scrollbar-thin pr-0.5">
              {visible.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggle}
                  onDelete={remove}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          {!loading && todos.length > 0 && (
            <StatsBar todos={todos} onClearCompleted={clearCompleted} />
          )}
        </div>

        <p className="text-center text-xs text-gray-700 mt-4">
          API → <code className="text-gray-600">localhost:4001/todos</code>
        </p>
      </div>
    </div>
  );
}
