import {useState, useEffect} from 'react';
import './App.css';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseChart from './components/ExpenseChart';
import ExpensePieChart from './components/ExpensePieChart';
import TypeManager from './components/TypeManager';

const defaultTypeOptions = [
  'Food',
  'Transportation',
  'Entertainment',
  'Clothing',
  'Rent',
  'Utilities',
];

const getIsoWeek = (date) => {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(date.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.round((firstThursday - target.valueOf()) / 604800000);
};

function App() {
  const [expenses, setExpenses] = useState([]);
  const [typeOptions, setTypeOptions] = useState(defaultTypeOptions);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    const storedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    setExpenses(storedExpenses);

    const storedTypes = JSON.parse(localStorage.getItem('expenseTypes'));
    if (Array.isArray(storedTypes) && storedTypes.length > 0) {
      setTypeOptions(storedTypes);
    }
  }, []);

  const saveTypes = (nextTypes) => {
    setTypeOptions(nextTypes);
    localStorage.setItem('expenseTypes', JSON.stringify(nextTypes));
  };

  const addExpense = (expense) => {
    const now = new Date();
    const weekNumber = getIsoWeek(now);
    const newExpense = {
      ...expense,
      id: Date.now() + Math.random(),
      createdAt: now.toISOString(),
      year: now.getFullYear(),
      week: `Week ${weekNumber}`,
      day: now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
    };
    const newExpenses = [...expenses, newExpense];
    setExpenses(newExpenses);
    localStorage.setItem('expenses', JSON.stringify(newExpenses));
    setShowExpenseForm(false);
  };

  const addTypeOption = (newType) => {
    if (!newType || typeOptions.includes(newType)) return;
    saveTypes([...typeOptions, newType]);
  };

  const updateExpense = (updatedExpense) => {
    const nextExpenses = expenses.map((expense) =>
      expense.id === updatedExpense.id ? { ...expense, ...updatedExpense } : expense
    );
    setExpenses(nextExpenses);
    localStorage.setItem('expenses', JSON.stringify(nextExpenses));
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const renameTypeOption = (oldType, newType) => {
    const sanitized = newType.trim();
    if (!sanitized || typeOptions.includes(sanitized)) return;

    const nextTypes = typeOptions.map((type) => (type === oldType ? sanitized : type));
    saveTypes(nextTypes);

    const nextExpenses = expenses.map((expense) =>
      expense.type === oldType ? { ...expense, type: sanitized } : expense
    );
    setExpenses(nextExpenses);
    localStorage.setItem('expenses', JSON.stringify(nextExpenses));
  };

  const removeTypeOption = (typeToRemove) => {
    saveTypes(typeOptions.filter((type) => type !== typeToRemove));
  };

  return (
    <div className="App">
      <div className="app-header">
        <div>
          <h1>Expense Tracker</h1>
          <p>Monitor spending, customize category types, and add expenses quickly with the floating action button.</p>
        </div>
        <div className="app-actions">
          <button
            type="button"
            className="settings-button"
            onClick={() => setShowSettings(true)}
          >
            ⚙
          </button>
          <button
            type="button"
            className="add-expense-button"
            onClick={() => {
              setEditingExpense(null);
              setShowExpenseForm(true);
            }}
          >
            +
          </button>
        </div>
      </div>
      <div className="app-main">
        <div className="app-left">
          <ExpenseChart expenses={expenses} />
          <ExpensePieChart expenses={expenses} />
        </div>
        <div className="app-right">
          <ExpenseList
            expenses={expenses}
            onEditExpense={(expense) => {
              setEditingExpense(expense);
              setShowExpenseForm(true);
            }}
          />
        </div>
      </div>

      {showExpenseForm && (
        <div className="expense-modal-overlay" onClick={() => {
          setShowExpenseForm(false);
          setEditingExpense(null);
        }}>
          <div className="expense-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="expense-modal-close"
              onClick={() => {
                setShowExpenseForm(false);
                setEditingExpense(null);
              }}
            >
              ×
            </button>
            <ExpenseForm
              expense={editingExpense}
              onSubmit={editingExpense ? updateExpense : addExpense}
              typeOptions={typeOptions}
              submitLabel={editingExpense ? 'Save changes' : 'Add expense'}
            />
          </div>
        </div>
      )}

      {showSettings && (
        <div className="expense-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="expense-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="expense-modal-close"
              onClick={() => setShowSettings(false)}
            >
              ×
            </button>
            <TypeManager
              options={typeOptions}
              onAddOption={addTypeOption}
              onRenameOption={renameTypeOption}
              onRemoveOption={removeTypeOption}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 