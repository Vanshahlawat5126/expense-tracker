import {useState} from 'react';

function TypeManager({ options, onAddOption, onRenameOption, onRemoveOption }) {
  const [newOption, setNewOption] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedValue, setEditedValue] = useState('');

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditedValue(options[index]);
  };

  const saveEdit = () => {
    if (!editedValue.trim()) return;
    onRenameOption(options[editingIndex], editedValue.trim());
    setEditingIndex(null);
    setEditedValue('');
  };

  return (
    <div className="type-manager">
      <h2>Manage expense types</h2>
      <div className="type-manager__add">
        <input
          type="text"
          placeholder="Add a new expense type"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
        />
        <button
          type="button"
          className="type-manager__button type-manager__button--primary"
          onClick={() => {
            const trimmed = newOption.trim();
            if (!trimmed) return;
            onAddOption(trimmed);
            setNewOption('');
          }}
        >
          Add type
        </button>
      </div>

      <ul className="type-manager__list">
        {options.map((option, index) => (
          <li className="type-manager__item" key={option}>
            {editingIndex === index ? (
              <>
                <input
                  type="text"
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                />
                <div className="type-manager__actions">
                  <button
                    type="button"
                    className="type-manager__button type-manager__button--primary"
                    onClick={saveEdit}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="type-manager__button type-manager__button--secondary"
                    onClick={() => setEditingIndex(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>{option}</span>
                <div className="type-manager__actions">
                  <button
                    type="button"
                    className="type-manager__button type-manager__button--secondary"
                    onClick={() => startEdit(index)}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="type-manager__button type-manager__button--danger"
                    onClick={() => onRemoveOption(option)}
                  >
                    Remove
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TypeManager;
