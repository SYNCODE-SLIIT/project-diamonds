import React, { useState } from 'react';
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';

const AddExpenseForm = ({ onAddExpense }) => {
    const [expense, setExpense] = useState({
        category: "",
        amount: "",
        date: "",
        icon: "",
    });

    // Corrected function to reference 'expense' instead of 'income'
    const handleChange = (key, value) => {
        setExpense((prev) => ({ ...prev, [key]: value }));
    };

    // Function to handle form submission
    const handleSubmit = () => {
        onAddExpense(expense);
        setExpense({ category: "", amount: "", date: "", icon: "" }); // Reset form after submission
    };

    return (
        <div>
            <EmojiPickerPopup
                icon={expense.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />

            <Input
                value={expense.category}
                onChange={({ target }) => handleChange("category", target.value)}
                label="Category"
                placeholder="Rent, Groceries, etc"
                type="text"
            />

            <Input
                value={expense.amount}
                onChange={({ target }) => handleChange("amount", target.value)}
                label="Amount"
                placeholder="Enter amount"
                type="number"
            />

            <Input
                value={expense.date}
                onChange={({ target }) => handleChange("date", target.value)}
                label="Date"
                type="date"
            />

            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    className="add-btn add-btn-fill"
                    onClick={handleSubmit} // Ensures handleSubmit is called
                >
                    Add Expense
                </button>
            </div>
        </div>
    );
};

export default AddExpenseForm;
