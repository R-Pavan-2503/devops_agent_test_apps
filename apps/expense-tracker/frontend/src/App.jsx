import { useState, useEffect } from 'react';

const API = '/expenses';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(API);
      const json = await res.json();
      if (json.success) setExpenses(json.data);
    } catch (e) {
      console.error("Failed to fetch expenses");
    }
  };
  // aDDING EXPENSE
  // test 3: adding a comment
  const addExpense = async (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amount }),
      });
      const json = await res.json();
      if (json.success) {
        setExpenses([json.data, ...expenses]);
        setName('');
        setAmount('');
      }
    } catch (e) {
      console.error("Failed to add expense");
    }
  };

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Expense Tracker</h1>

      <form onSubmit={addExpense} style={{ marginBottom: '20px' }}>
        <input
          placeholder="Expense Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>Add Expense</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {expenses.map(item => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}>
            <span>{item.name}</span>
            <strong>${item.amount.toFixed(2)}</strong>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '20px', borderTop: '2px solid #333', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <strong>TOTAL:</strong>
        <strong style={{ color: 'red' }}>${total.toFixed(2)}</strong>
      </div>
    </div>
  );
}
