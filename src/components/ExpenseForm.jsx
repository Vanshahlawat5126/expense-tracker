import {useState, useEffect} from 'react';

function ExpenseForm({ onSubmit, typeOptions, expense, submitLabel = 'Add Expense' }) {
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState({ type: false, amount: false });

  useEffect(() => {
    if (expense) {
      setDescription(expense.description || '');
      setType(expense.type || '');
      setAmount(expense.amount != null ? String(expense.amount) : '');
      setPaymentMethod(expense.paymentMethod || '');
      setErrors({ type: false, amount: false });
    } else {
      setDescription('');
      setType('');
      setAmount('');
      setPaymentMethod('');
      setErrors({ type: false, amount: false });
    }
  }, [expense]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const typeMissing = !type;
    const amountMissing = !amount;

    if (typeMissing || amountMissing) {
      setErrors({ type: typeMissing, amount: amountMissing });
      return;
    }

    const payload = {
      description: description.trim(),
      type,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod.trim(),
      ...(expense ? { id: expense.id, createdAt: expense.createdAt } : {}),
    };

    onSubmit(payload);

    setDescription('');
    setType('');
    setAmount('');
    setPaymentMethod('');
    setErrors({ type: false, amount: false });
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select
        className={errors.type ? 'invalid-field' : ''}
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          if (errors.type && e.target.value) {
            setErrors((prev) => ({ ...prev, type: false }));
          }
        }}
      >
        <option value="">Select Type</option>
        {typeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Payment method (optional)"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      />
      <input
        className={errors.amount ? 'invalid-field' : ''}
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          if (errors.amount && e.target.value) {
            setErrors((prev) => ({ ...prev, amount: false }));
          }
        }}
      />
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

export default ExpenseForm;