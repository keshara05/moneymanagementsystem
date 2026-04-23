document.addEventListener('DOMContentLoaded', () => {
    // API URL - Change this to your deployed Render URL later
    const API_URL = 'http://localhost:5000/api';

    // DOM Elements - Income
    const incomeForm = document.getElementById('income-form');
    const incomesList = document.getElementById('incomes-list');
    const emptyIncomeState = document.getElementById('empty-income-state');
    const totalIncomeAmountEl = document.getElementById('total-income-amount');

    // DOM Elements - Budget
    const savingsAmountEl = document.getElementById('savings-amount');
    const needsAmountEl = document.getElementById('needs-amount');
    const wantsAmountEl = document.getElementById('wants-amount');

    // DOM Elements - Expense
    const expenseForm = document.getElementById('expense-form');
    const expensesList = document.getElementById('expenses-list');
    const emptyState = document.getElementById('empty-state');
    
    // DOM Elements - Summary
    const summaryAllocatedNeeds = document.getElementById('summary-allocated-needs');
    const summarySpentNeeds = document.getElementById('summary-spent-needs');
    const summaryRemainingNeeds = document.getElementById('summary-remaining-needs');
    const progressNeeds = document.getElementById('progress-needs');

    const summaryAllocatedWants = document.getElementById('summary-allocated-wants');
    const summarySpentWants = document.getElementById('summary-spent-wants');
    const summaryRemainingWants = document.getElementById('summary-remaining-wants');
    const progressWants = document.getElementById('progress-wants');

    const totalSpentAmount = document.getElementById('total-spent-amount');
    const clearDataBtn = document.getElementById('clear-data-btn');
    const loadingOverlay = document.getElementById('loading-overlay');

    // State
    let state = {
        totalIncome: 0,
        budget: { savings: 0, needs: 0, wants: 0 },
        incomes: [],
        expenses: []
    };

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    const showLoading = () => loadingOverlay.style.display = 'flex';
    const hideLoading = () => loadingOverlay.style.display = 'none';

    // Fetch Data from MongoDB Backend
    const fetchData = async () => {
        showLoading();
        try {
            const [incomesRes, expensesRes] = await Promise.all([
                fetch(`${API_URL}/incomes`),
                fetch(`${API_URL}/expenses`)
            ]);
            
            if(!incomesRes.ok || !expensesRes.ok) throw new Error('Failed to fetch data');

            state.incomes = await incomesRes.json();
            state.expenses = await expensesRes.json();
            
            calculateTotals();
            updateUI();
        } catch (error) {
            console.error('Error fetching data:', error);
            // Fallback for demo without backend running
            alert('Cannot connect to Database. Make sure the Node server is running.');
        } finally {
            hideLoading();
        }
    };

    const calculateTotals = () => {
        // Calculate Total Income
        state.totalIncome = state.incomes.reduce((acc, curr) => acc + curr.amount, 0);
        
        // Calculate Budget
        state.budget = {
            savings: state.totalIncome * 0.20,
            needs: state.totalIncome * 0.50,
            wants: state.totalIncome * 0.30
        };
    };

    // Add Income
    const addIncome = async (e) => {
        e.preventDefault();
        const date = document.getElementById('income-date').value;
        const description = document.getElementById('income-desc').value;
        const amount = parseFloat(document.getElementById('income-amount').value);

        if (!date || !description || isNaN(amount)) return;

        showLoading();
        try {
            const res = await fetch(`${API_URL}/incomes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, description, amount })
            });
            const newIncome = await res.json();
            state.incomes.unshift(newIncome); // Add to top
            
            calculateTotals();
            updateUI();
            
            document.getElementById('income-desc').value = '';
            document.getElementById('income-amount').value = '';
            document.getElementById('income-desc').focus();
        } catch (err) {
            console.error(err);
        } finally {
            hideLoading();
        }
    };

    // Add Expense
    const addExpense = async (e) => {
        e.preventDefault();
        const date = document.getElementById('expense-date').value;
        const description = document.getElementById('expense-desc').value;
        const category = document.getElementById('expense-category').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);

        if (!date || !description || !category || isNaN(amount)) return;

        showLoading();
        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, description, category, amount })
            });
            const newExpense = await res.json();
            state.expenses.unshift(newExpense);
            
            updateUI();
            
            document.getElementById('expense-desc').value = '';
            document.getElementById('expense-amount').value = '';
        } catch (err) {
            console.error(err);
        } finally {
            hideLoading();
        }
    };

    // Delete Income
    window.deleteIncome = async (id) => {
        showLoading();
        try {
            await fetch(`${API_URL}/incomes/${id}`, { method: 'DELETE' });
            state.incomes = state.incomes.filter(inc => inc._id !== id);
            calculateTotals();
            updateUI();
        } catch (err) {
            console.error(err);
        } finally {
            hideLoading();
        }
    };

    // Delete Expense
    window.deleteExpense = async (id) => {
        showLoading();
        try {
            await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
            state.expenses = state.expenses.filter(exp => exp._id !== id);
            updateUI();
        } catch (err) {
            console.error(err);
        } finally {
            hideLoading();
        }
    };

    // Clear All
    const clearAllData = async () => {
        if(confirm('Are you sure you want to clear ALL data from the Cloud Database? This cannot be undone.')) {
            showLoading();
            try {
                await fetch(`${API_URL}/clear-all`, { method: 'DELETE' });
                state.incomes = [];
                state.expenses = [];
                calculateTotals();
                updateUI();
            } catch (err) {
                console.error(err);
            } finally {
                hideLoading();
            }
        }
    };

    const updateUI = () => {
        // Update Total Income and Budgets
        totalIncomeAmountEl.textContent = currencyFormatter.format(state.totalIncome);
        savingsAmountEl.textContent = currencyFormatter.format(state.budget.savings);
        needsAmountEl.textContent = currencyFormatter.format(state.budget.needs);
        wantsAmountEl.textContent = currencyFormatter.format(state.budget.wants);

        // Render Incomes Table
        incomesList.innerHTML = '';
        if (state.incomes.length === 0) {
            emptyIncomeState.style.display = 'block';
            document.getElementById('incomes-table').style.display = 'none';
        } else {
            emptyIncomeState.style.display = 'none';
            document.getElementById('incomes-table').style.display = 'table';
            
            state.incomes.forEach((inc, index) => {
                const tr = document.createElement('tr');
                tr.className = 'fade-in';
                tr.style.animationDelay = `${index * 0.05}s`;
                
                const dateObj = new Date(inc.date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                tr.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${inc.description}</td>
                    <td style="font-weight: 600; color: var(--color-savings)">+${currencyFormatter.format(inc.amount)}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteIncome('${inc._id}')" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                incomesList.appendChild(tr);
            });
        }

        // Render Expenses Table
        expensesList.innerHTML = '';
        if (state.expenses.length === 0) {
            emptyState.style.display = 'block';
            document.getElementById('expenses-table').style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            document.getElementById('expenses-table').style.display = 'table';
            
            state.expenses.forEach((expense, index) => {
                const tr = document.createElement('tr');
                tr.className = 'fade-in';
                tr.style.animationDelay = `${index * 0.05}s`;
                
                const badgeClass = expense.category === 'need' ? 'badge-need' : 'badge-want';
                const categoryText = expense.category === 'need' ? 'Need' : 'Want';
                
                const dateObj = new Date(expense.date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                tr.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${expense.description}</td>
                    <td><span class="badge ${badgeClass}">${categoryText}</span></td>
                    <td style="font-weight: 600;">${currencyFormatter.format(expense.amount)}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteExpense('${expense._id}')" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                expensesList.appendChild(tr);
            });
        }

        updateSummary();
    };

    const updateSummary = () => {
        let spentNeeds = 0;
        let spentWants = 0;

        state.expenses.forEach(exp => {
            if (exp.category === 'need') spentNeeds += exp.amount;
            if (exp.category === 'want') spentWants += exp.amount;
        });

        const totalSpent = spentNeeds + spentWants;
        const remainingNeeds = state.budget.needs - spentNeeds;
        const remainingWants = state.budget.wants - spentWants;

        summaryAllocatedNeeds.textContent = currencyFormatter.format(state.budget.needs);
        summarySpentNeeds.textContent = currencyFormatter.format(spentNeeds);
        summaryRemainingNeeds.textContent = currencyFormatter.format(remainingNeeds);
        
        summaryAllocatedWants.textContent = currencyFormatter.format(state.budget.wants);
        summarySpentWants.textContent = currencyFormatter.format(spentWants);
        summaryRemainingWants.textContent = currencyFormatter.format(remainingWants);
        
        totalSpentAmount.textContent = currencyFormatter.format(totalSpent);

        summaryRemainingNeeds.style.color = remainingNeeds < 0 ? 'var(--danger)' : 'var(--color-needs)';
        summaryRemainingWants.style.color = remainingWants < 0 ? 'var(--danger)' : 'var(--color-wants)';

        const calcPercentage = (spent, allocated) => {
            if (allocated === 0) return spent > 0 ? 100 : 0;
            return Math.min((spent / allocated) * 100, 100);
        };

        const needsPct = calcPercentage(spentNeeds, state.budget.needs);
        const wantsPct = calcPercentage(spentWants, state.budget.wants);

        progressNeeds.style.width = `${needsPct}%`;
        progressNeeds.style.backgroundColor = needsPct >= 100 ? 'var(--danger)' : 'var(--color-needs)';
        
        progressWants.style.width = `${wantsPct}%`;
        progressWants.style.backgroundColor = wantsPct >= 100 ? 'var(--danger)' : 'var(--color-wants)';
    };

    // Event Listeners
    incomeForm.addEventListener('submit', addIncome);
    expenseForm.addEventListener('submit', addExpense);
    clearDataBtn.addEventListener('click', clearAllData);

    // Initial load
    document.getElementById('income-date').valueAsDate = new Date();
    document.getElementById('expense-date').valueAsDate = new Date();
    
    // Fetch data from backend on load
    fetchData();
});
