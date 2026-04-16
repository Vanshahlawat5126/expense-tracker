import {useMemo, useState} from 'react';

const VIEW_LABELS = {
  daily: 'Daily',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const COLORS = ['#51ff4a', '#ffb300', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const getSafeDate = (createdAt) => {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isSameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const isSameYear = (a, b) => a.getFullYear() === b.getFullYear();

function ExpensePieChart({ expenses }) {
  const [view, setView] = useState('daily');

  const expensesWithDate = useMemo(
    () =>
      expenses.map((expense) => ({
        ...expense,
        date: getSafeDate(expense.createdAt),
      })),
    [expenses]
  );

  const today = useMemo(() => new Date(), []);

  const filteredExpenses = useMemo(
    () =>
      expensesWithDate.filter((expense) => {
        if (view === 'daily') return isSameDay(expense.date, today);
        if (view === 'monthly') return isSameMonth(expense.date, today);
        return isSameYear(expense.date, today);
      }),
    [expensesWithDate, view, today]
  );

  const typeTotals = useMemo(() => {
    const totals = filteredExpenses.reduce((acc, expense) => {
      const type = expense.type || 'Other';
      acc[type] = (acc[type] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .map(([type, amount], index) => ({
        type,
        amount,
        color: COLORS[index % COLORS.length],
      }));
  }, [filteredExpenses]);

  const totalAmount = typeTotals.reduce((sum, item) => sum + item.amount, 0);
  const circumference = 2 * Math.PI * 80;
  let offset = 0;

  const slices = typeTotals.map((item) => {
    const value = item.amount;
    const size = totalAmount > 0 ? (value / totalAmount) * circumference : 0;
    const slice = {
      ...item,
      size,
      offset,
      percentage: totalAmount > 0 ? Math.round((value / totalAmount) * 100) : 0,
    };
    offset += size;
    return slice;
  });

  return (
    <section className="expense-piechart">
      <div className="expense-piechart__header">
        <div>
          <h2>Expense type distribution</h2>
          <p>Choose daily, monthly, or yearly projection to view expense type share.</p>
        </div>
        <div className="expense-piechart__controls">
          {Object.entries(VIEW_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={view === key ? 'active' : ''}
              onClick={() => setView(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {typeTotals.length === 0 ? (
        <div className="expense-piechart__empty">No expenses for the selected projection.</div>
      ) : (
        <div className="expense-piechart__content">
          <div className="expense-piechart__visual">
            <svg viewBox="0 0 220 220" className="expense-piechart__svg">
              <circle
                cx="110"
                cy="110"
                r="80"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="32"
              />
              {slices.map((slice) => (
                <circle
                  key={slice.type}
                  cx="110"
                  cy="110"
                  r="80"
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="32"
                  strokeDasharray={`${slice.size} ${circumference - slice.size}`}
                  strokeDashoffset={-slice.offset}
                  transform="rotate(-90 110 110)"
                  strokeLinecap="round"
                  title={`${slice.type}: ₹${slice.amount.toFixed(2)} • ${slice.percentage}%`}
                />
              ))}
            </svg>
            <div className="expense-piechart__total">
              <span>Total</span>
              <strong>₹{totalAmount.toFixed(2)}</strong>
            </div>
          </div>

          <div className="expense-piechart__legend">
            {slices.map((slice) => (
              <div
                key={slice.type}
                className="expense-piechart__legend-item"
                title={`${slice.type}: ₹${slice.amount.toFixed(2)} • ${slice.percentage}%`}
              >
                <span
                  className="expense-piechart__legend-color"
                  style={{ background: slice.color }}
                />
                <div>
                  <strong>{slice.type}</strong>
                  <p>
                    ₹{slice.amount.toFixed(2)} • {slice.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ExpensePieChart;
