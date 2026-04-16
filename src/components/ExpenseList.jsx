import {useState, useMemo} from 'react';

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

function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day + 6) % 7;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameWeek(date, reference) {
  return startOfWeek(date).getTime() === startOfWeek(reference).getTime();
}

function isLastWeek(date, reference) {
  const current = startOfWeek(reference);
  const previous = new Date(current);
  previous.setDate(current.getDate() - 7);
  return startOfWeek(date).getTime() === previous.getTime();
}

function isLastMonth(date, reference) {
  const currentMonthStart = startOfMonth(reference);
  const previousMonthStart = new Date(currentMonthStart);
  previousMonthStart.setMonth(currentMonthStart.getMonth() - 1);
  return (
    date.getFullYear() === previousMonthStart.getFullYear() &&
    date.getMonth() === previousMonthStart.getMonth()
  );
}

function ExpenseList({ expenses, onEditExpense }) {
  const [selectedType, setSelectedType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('thisWeek');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const expensesWithDate = useMemo(
    () =>
      expenses
        .map((expense) => {
          const date = new Date(expense.createdAt);
          return {
            ...expense,
            date: isNaN(date.getTime()) ? new Date() : date,
          };
        })
        .sort((a, b) => b.date - a.date),
    [expenses]
  );

  const availableYears = useMemo(
    () =>
      [...new Set(
        expensesWithDate
          .map((expense) => expense.date.getFullYear())
          .filter((year) => Number.isFinite(year))
      )].sort((a, b) => b - a),
    [expensesWithDate]
  );

  const availableMonths = useMemo(() => {
    const months = expensesWithDate
      .filter(
        (expense) =>
          (selectedYear ? expense.date.getFullYear() === Number(selectedYear) : true) &&
          Number.isFinite(expense.date.getMonth())
      )
      .map((expense) => expense.date.getMonth());
    return [...new Set(months)].sort((a, b) => a - b);
  }, [expensesWithDate, selectedYear]);

  const typeOptions = useMemo(
    () => [...new Set(expensesWithDate.map((expense) => expense.type).filter(Boolean))],
    [expensesWithDate]
  );

  const availableDays = useMemo(() => {
    const days = expensesWithDate
      .filter(
        (expense) =>
          (selectedYear ? expense.date.getFullYear() === Number(selectedYear) : true) &&
          (selectedMonth !== '' ? expense.date.getMonth() === Number(selectedMonth) : true)
      )
      .map((expense) => expense.date.getDate())
      .filter((day) => Number.isFinite(day));
    return [...new Set(days)].sort((a, b) => a - b);
  }, [expensesWithDate, selectedYear, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();

    return expensesWithDate.filter((expense) => {
      const matchesType = selectedType ? expense.type === selectedType : true;

      const matchesYear = selectedYear ? expense.date.getFullYear() === Number(selectedYear) : true;
      const matchesMonth =
        selectedMonth !== '' ? expense.date.getMonth() === Number(selectedMonth) : true;
      const matchesDay = selectedDay !== '' ? expense.date.getDate() === Number(selectedDay) : true;

      let matchesPeriod = true;
      if (selectedPeriod === 'thisWeek') {
        matchesPeriod = isSameWeek(expense.date, now);
      } else if (selectedPeriod === 'lastWeek') {
        matchesPeriod = isLastWeek(expense.date, now);
      } else if (selectedPeriod === 'lastMonth') {
        matchesPeriod = isLastMonth(expense.date, now);
      }

      return matchesType && matchesYear && matchesMonth && matchesDay && matchesPeriod;
    });
  }, [expensesWithDate, selectedType, selectedYear, selectedMonth, selectedDay, selectedPeriod]);

  const groupedExpenses = useMemo(() => {
    return filteredExpenses.reduce((groups, expense) => {
      const year = expense.date.getFullYear();
      const month = `${MONTH_LABELS[expense.date.getMonth()]} ${year}`;
      const day = expense.date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = {};
      if (!groups[year][month][day]) groups[year][month][day] = [];
      groups[year][month][day].push(expense);
      return groups;
    }, {});
  }, [filteredExpenses]);

  return (
    <div className="expense-list">
      <div className="period-buttons">
        <button type="button" onClick={() => setSelectedPeriod('thisWeek')}>
          This week
        </button>
        <button type="button" onClick={() => setSelectedPeriod('lastWeek')}>
          Last week
        </button>
        <button type="button" onClick={() => setSelectedPeriod('lastMonth')}>
          Last month
        </button>
        <button type="button" onClick={() => setSelectedPeriod('all')}>
          All
        </button>
      </div>
      <div className="select-filters">
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">All time</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          disabled={!availableMonths.length}
        >
          <option value="">Month</option>
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {MONTH_LABELS[month]}
            </option>
          ))}
        </select>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          disabled={!availableDays.length}
        >
          <option value="">Day</option>
          {availableDays.map((day) => (
            <option key={day} value={day}>
              {String(day).padStart(2, '0')}
            </option>
          ))}
        </select>
        <select
          className="expense-filter-input"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All expense types</option>
          {typeOptions.map((typeOption) => (
            <option key={typeOption} value={typeOption}>
              {typeOption}
            </option>
          ))}
        </select>
      </div>

      {filteredExpenses.length === 0 ? (
        <p>No expenses found for the selected period.</p>
      ) : (
        Object.keys(groupedExpenses)
          .sort((a, b) => Number(b) - Number(a))
          .map((year) => (
            <div key={year}>
              <h2>{year}</h2>
              {Object.keys(groupedExpenses[year]).map((month) => (
                <div key={month}>
                  <h3>{month}</h3>
                  {Object.keys(groupedExpenses[year][month]).map((day) => (
                    <div key={day}>
                      <h4>{day}</h4>
                      <ul>
                        {groupedExpenses[year][month][day].map((expense) => (
                              <li key={expense.id}>
                            <div className="expense-item-info">
                              {expense.description && <strong>{expense.description}</strong>}
                              {expense.type && <span> • {expense.type}</span>}
                              {expense.paymentMethod && <span> • {expense.paymentMethod}</span>} - ₹{Number(expense.amount).toFixed(2)}
                            </div>
                            <button
                              type="button"
                              className="expense-item-edit"
                              onClick={() => onEditExpense && onEditExpense(expense)}
                            >
                              Edit
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))
      )}
    </div>
  );
}

export default ExpenseList;     