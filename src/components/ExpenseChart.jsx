import {useMemo, useState} from 'react';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatAmount(value) {
  return `₹${value.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
}

function getSafeDate(createdAt) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function ExpenseChart({ expenses }) {
  const [view, setView] = useState('thisYear');

  const expensesWithDate = useMemo(
    () =>
      expenses.map((expense) => ({
        ...expense,
        date: getSafeDate(expense.createdAt),
      })),
    [expenses]
  );

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const yearTotals = useMemo(() => {
    const totals = {};
    expensesWithDate.forEach((expense) => {
      const year = expense.date.getFullYear();
      totals[year] = (totals[year] || 0) + Number(expense.amount || 0);
    });
    return Object.entries(totals)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, total]) => ({ year: Number(year), total }));
  }, [expensesWithDate]);

  const monthlyTotals = useMemo(() => {
    const totals = Array(12).fill(0);
    const selectedYear = view === 'lastYear' ? lastYear : currentYear;
    expensesWithDate.forEach((expense) => {
      if (expense.date.getFullYear() === selectedYear) {
        totals[expense.date.getMonth()] += Number(expense.amount || 0);
      }
    });
    return totals;
  }, [expensesWithDate, view, currentYear, lastYear]);

  const projectedYear = useMemo(() => {
    if (yearTotals.length < 2) return null;
    const recentYears = yearTotals.slice(-2);
    const [prev, latest] = recentYears;
    const growth = latest.total - prev.total;
    return {
      year: latest.year + 1,
      total: Math.max(0, latest.total + growth),
      projection: true,
    };
  }, [yearTotals]);

  const chartData = useMemo(() => {
    if (view === 'yearToYear') {
      const data = [...yearTotals];
      if (projectedYear) data.push(projectedYear);
      return data;
    }
    return monthlyTotals.map((amount, index) => ({
      label: MONTH_LABELS[index],
      value: amount,
    }));
  }, [view, yearTotals, monthlyTotals, projectedYear]);

  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

  return (
    <section className="expense-chart">
      <div className="expense-chart__header">
        <div>
          <h2>Expense overview</h2>
          <p>Y axis shows amount, X axis shows months or yearly projection.</p>
        </div>
        <div className="expense-chart__controls">
          <button
            type="button"
            className={view === 'thisYear' ? 'active' : ''}
            onClick={() => setView('thisYear')}
          >
            This year
          </button>
          <button
            type="button"
            className={view === 'lastYear' ? 'active' : ''}
            onClick={() => setView('lastYear')}
          >
            Last year
          </button>
          <button
            type="button"
            className={view === 'yearToYear' ? 'active' : ''}
            onClick={() => setView('yearToYear')}
          >
            Year to year
          </button>
        </div>
      </div>
      {chartData.length === 0 ? (
        <div className="expense-chart__empty">No expenses available yet.</div>
      ) : (
        <div className="expense-chart__grid">
          <div className="expense-chart__y-axis">
            {[4, 3, 2, 1, 0].map((row) => {
              const value = Math.round((maxValue / 4) * row);
              return (
                <div key={row} className="expense-chart__y-label">
                  {formatAmount(value)}
                </div>
              );
            })}
          </div>
          <div className="expense-chart__bars">
            {chartData.map((item) => {
              const height = maxValue ? (item.value / maxValue) * 100 : 0;
              return (
                <div key={item.label} className="expense-chart__bar-column">
                  <div className="expense-chart__bar" style={{ height: `${height}%` }}>
                    <span>{formatAmount(item.value)}</span>
                  </div>
                  <div className="expense-chart__label">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default ExpenseChart;
