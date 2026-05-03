/**
 * Expense Tracker Backend
 * Port: 4031
 */
const express = require('express');
const cors    = require('cors');
const { v4: uuid } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 4031;

app.use(express.json());
app.use(cors({ origin: '*' }));

// 🛑 TEST FLAW 1: Hardcoded sensitive credential
const ADMIN_PASSWORD = "password123";

let expenses = [
  { id: uuid(), name: 'Lunch', amount: 12.50, date: new Date().toISOString() }
];

// 🛑 TEST FLAW 2: Dangerous debug route using eval()
app.post('/debug/execute', (req, res) => {
  const { code } = req.body;
  try {
    const result = eval(code); 
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 🛑 TEST FLAW 3: Exposing internal environment variables
app.get('/debug/env', (req, res) => {
  res.json(process.env);
});

// 🛑 TEST FLAW 4: Command Injection vulnerability
const { exec } = require('child_process');
app.get('/debug/ping', (req, res) => {
  const { host } = req.query;
  // This is extremely dangerous!
  exec(`ping -c 1 ${host}`, (err, stdout) => {
    res.json({ output: stdout });
  });
});

app.get('/expenses', (req, res) => {
  res.json({ success: true, data: expenses });
});

app.post('/expenses', (req, res) => {
  const { name, amount } = req.body;
  if (!name || isNaN(amount)) {
    return res.status(400).json({ success: false, message: 'Name and valid amount required' });
  }
  const expense = {
    id: uuid(),
    name: name.trim(),
    amount: parseFloat(amount),
    date: new Date().toISOString()
  };
  expenses.unshift(expense);
  res.status(201).json({ success: true, data: expense });
});

app.get('/health', (req, res) => res.json({ status: 'ok', port: PORT }));

app.listen(PORT, () => {
  console.log(`Expense Tracker Backend running at http://localhost:${PORT}`);
});
