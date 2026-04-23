document.addEventListener('DOMContentLoaded', () => {
    // API URL - Uses relative path for Vercel Serverless
    const API_URL = '/api';

    // --- DOM Elements ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const langToggleBtn = document.getElementById('lang-toggle');
    const currentLangText = document.getElementById('current-lang');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Income Elements
    const incomeForm = document.getElementById('income-form');
    const incomesList = document.getElementById('incomes-list');
    const emptyIncomeState = document.getElementById('empty-income-state');
    const totalIncomeAmountEl = document.getElementById('total-income-amount');
    const savingsAmountEl = document.getElementById('savings-amount');
    const needsAmountEl = document.getElementById('needs-amount');
    const wantsAmountEl = document.getElementById('wants-amount');

    // Expense Elements
    const expenseForm = document.getElementById('expense-form');
    const expensesList = document.getElementById('expenses-list');
    const emptyState = document.getElementById('empty-state');
    
    // Summary Elements
    const summaryAllocatedNeeds = document.getElementById('summary-allocated-needs');
    const summarySpentNeeds = document.getElementById('summary-spent-needs');
    const summaryRemainingNeeds = document.getElementById('summary-remaining-needs');
    const progressNeeds = document.getElementById('progress-needs');
    const summaryAllocatedWants = document.getElementById('summary-allocated-wants');
    const summarySpentWants = document.getElementById('summary-spent-wants');
    const summaryRemainingWants = document.getElementById('summary-remaining-wants');
    const progressWants = document.getElementById('progress-wants');
    const totalSpentAmount = document.getElementById('total-spent-amount');

    // State
    let state = {
        totalIncome: 0,
        budget: { savings: 0, needs: 0, wants: 0 },
        incomes: [],
        expenses: [],
        lang: localStorage.getItem('financeLang') || 'en',
        theme: localStorage.getItem('financeTheme') || 'dark'
    };

    // --- Translations ---
    const i18n = {
        en: {
            app_title: "FinanceTracker",
            syncing: "Syncing with Database...",
            main_heading: "Smart Money Management",
            sub_heading: "Manage your class fees easily",
            tab_dashboard: "Dashboard",
            tab_reports: "Monthly Reports",
            daily_income: "Daily Income Tracker",
            date: "Date",
            class_desc: "Class / Description",
            amount_received: "Amount Received",
            add_income: "Add Income",
            amount: "Amount",
            action: "Action",
            no_incomes: "No incomes logged yet.",
            budget_allocation: "Budget Allocation",
            total_monthly_income: "Total Monthly Income",
            savings: "Savings (20%)",
            needs: "Needs/Expenses (50%)",
            wants: "Wants (30%)",
            daily_expense: "Daily Expense Tracker",
            description: "Description",
            category: "Category",
            select: "Select...",
            need_option: "Need / Expense",
            want_option: "Want",
            add_expense: "Add Expense",
            no_expenses: "No expenses logged yet.",
            balance_summary: "Balance Summary",
            needs_balance: "Needs Balance",
            wants_balance: "Wants Balance",
            allocated: "Allocated:",
            spent: "Spent:",
            remaining: "Remaining:",
            total_monthly_spent: "Total Monthly Spent",
            clear_all: "Clear All Cloud Data",
            monthly_report_title: "Monthly Report Filter",
            select_month: "Select Month",
            generate_report: "Generate Report",
            total_income: "Total Income",
            total_expense: "Total Expense",
            net_savings: "Net Savings",
            income_breakdown: "Income Breakdown",
            expense_breakdown: "Expense Breakdown",
            need_badge: "Need",
            want_badge: "Want",
            deposit_calculator_title: "Bank Deposit Calculator",
            deposit_calculator_desc: "Select a date range to calculate deposit percentages for accumulated class fees.",
            start_date: "Start Date",
            end_date: "End Date",
            calculate: "Calculate",
            selected_period_income: "Total Income in Selected Period",
            deposit_split: "Deposit Split:"
        },
        si: {
            app_title: "මූල්‍ය කළමනාකරු",
            syncing: "දත්ත සමග සම්බන්ධ වෙමින්...",
            main_heading: "ස්මාර්ට් මූල්‍ය කළමනාකරණය",
            sub_heading: "ඔබගේ පන්ති ගාස්තු පහසුවෙන් කළමනාකරණය කරන්න",
            tab_dashboard: "ප්‍රධාන පුවරුව",
            tab_reports: "මාසික වාර්තා",
            daily_income: "දෛනික ආදායම් සටහන",
            date: "දිනය",
            class_desc: "පන්තිය / විස්තරය",
            amount_received: "ලැබුණු මුදල",
            add_income: "ආදායම එකතු කරන්න",
            amount: "මුදල",
            action: "ක්‍රියාව",
            no_incomes: "තවම ආදායම් සටහන් කර නැත.",
            budget_allocation: "අයවැය බෙදීම",
            total_monthly_income: "මුළු මාසික ආදායම",
            savings: "ඉතිරිය (20%)",
            needs: "අවශ්‍යතා/වියදම් (50%)",
            wants: "වුවමනා (30%)",
            daily_expense: "දෛනික වියදම් සටහන",
            description: "විස්තරය",
            category: "කාණ්ඩය",
            select: "තෝරන්න...",
            need_option: "අවශ්‍යතා / වියදම්",
            want_option: "වුවමනා",
            add_expense: "වියදම එකතු කරන්න",
            no_expenses: "තවම වියදම් සටහන් කර නැත.",
            balance_summary: "ශේෂ සාරාංශය",
            needs_balance: "අවශ්‍යතා ශේෂය",
            wants_balance: "වුවමනා ශේෂය",
            allocated: "වෙන් කල:",
            spent: "වියදම් කල:",
            remaining: "ඉතිරිය:",
            total_monthly_spent: "මුළු මාසික වියදම",
            clear_all: "සියලු දත්ත මකන්න",
            monthly_report_title: "මාසික වාර්තා සෙවීම",
            select_month: "මාසය තෝරන්න",
            generate_report: "වාර්තාව බලන්න",
            total_income: "මුළු ආදායම",
            total_expense: "මුළු වියදම",
            net_savings: "ඉතිරි මුදල",
            income_breakdown: "ආදායම් විස්තරය",
            expense_breakdown: "වියදම් විස්තරය",
            need_badge: "අවශ්‍යතා",
            want_badge: "වුවමනා",
            deposit_calculator_title: "බැංකු තැන්පතු ගණනය",
            deposit_calculator_desc: "දින කිහිපයක එකතු වූ පන්ති ගාස්තු බැංකුවට දැමීමට පෙර ප්‍රතිශත වෙන්කර ගැනීමට දින පරාසයක් තෝරන්න.",
            start_date: "ආරම්භක දිනය",
            end_date: "අවසන් දිනය",
            calculate: "ගණනය කරන්න",
            selected_period_income: "තෝරාගත් කාලයේ මුළු ආදායම",
            deposit_split: "බැංකුවට දැමිය යුතු අයුරු:"
        }
    };

    // --- Formatters ---
    const currencyFormatter = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    });

    const showLoading = () => loadingOverlay.style.display = 'flex';
    const hideLoading = () => loadingOverlay.style.display = 'none';

    // --- Tab Switching ---
    window.switchTab = (tabId) => {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
        event.currentTarget.classList.add('active');
        if (tabId === 'reports') {
            document.getElementById('report-month').value = new Date().toISOString().slice(0, 7);
        }
    };

    // --- Language Logic ---
    const applyLanguage = () => {
        const dict = i18n[state.lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });
        currentLangText.textContent = state.lang === 'en' ? 'සිං' : 'EN';
        document.body.className = state.lang === 'si' ? 'lang-si' : '';
        updateUI(); // Re-render tables with new language badges
    };

    langToggleBtn.addEventListener('click', () => {
        state.lang = state.lang === 'en' ? 'si' : 'en';
        localStorage.setItem('financeLang', state.lang);
        applyLanguage();
    });

    // --- Theme Logic ---
    const applyTheme = () => {
        document.documentElement.setAttribute('data-theme', state.theme);
        themeIcon.className = state.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    };

    themeToggleBtn.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('financeTheme', state.theme);
        applyTheme();
    });

    // --- Fetch Data ---
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
            alert('Cannot connect to Database. Check internet connection or MongoDB IP whitelist.');
        } finally {
            hideLoading();
        }
    };

    const calculateTotals = () => {
        state.totalIncome = state.incomes.reduce((acc, curr) => acc + curr.amount, 0);
        state.budget = {
            savings: state.totalIncome * 0.20,
            needs: state.totalIncome * 0.50,
            wants: state.totalIncome * 0.30
        };
    };

    // --- Form Handlers ---
    document.getElementById('income-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('income-date').value;
        const description = document.getElementById('income-desc').value;
        const amount = parseFloat(document.getElementById('income-amount').value);
        if (!date || !description || isNaN(amount)) return;

        showLoading();
        try {
            const res = await fetch(`${API_URL}/incomes`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, description, amount })
            });
            const newIncome = await res.json();
            state.incomes.unshift(newIncome);
            calculateTotals(); updateUI();
            document.getElementById('income-desc').value = '';
            document.getElementById('income-amount').value = '';
        } catch (err) { console.error(err); } finally { hideLoading(); }
    });

    document.getElementById('expense-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('expense-date').value;
        const description = document.getElementById('expense-desc').value;
        const category = document.getElementById('expense-category').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        if (!date || !description || !category || isNaN(amount)) return;

        showLoading();
        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, description, category, amount })
            });
            const newExpense = await res.json();
            state.expenses.unshift(newExpense);
            updateUI();
            document.getElementById('expense-desc').value = '';
            document.getElementById('expense-amount').value = '';
        } catch (err) { console.error(err); } finally { hideLoading(); }
    });

    window.deleteIncome = async (id) => {
        showLoading();
        try {
            await fetch(`${API_URL}/incomes/${id}`, { method: 'DELETE' });
            state.incomes = state.incomes.filter(inc => inc._id !== id);
            calculateTotals(); updateUI();
        } catch (err) { console.error(err); } finally { hideLoading(); }
    };

    window.deleteExpense = async (id) => {
        showLoading();
        try {
            await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
            state.expenses = state.expenses.filter(exp => exp._id !== id);
            updateUI();
        } catch (err) { console.error(err); } finally { hideLoading(); }
    };

    document.getElementById('clear-data-btn').addEventListener('click', async () => {
        const msg = state.lang === 'si' ? 'සියලුම දත්ත මකන්නද?' : 'Are you sure you want to clear ALL data?';
        if(confirm(msg)) {
            showLoading();
            try {
                await fetch(`${API_URL}/clear-all`, { method: 'DELETE' });
                state.incomes = []; state.expenses = [];
                calculateTotals(); updateUI();
            } catch (err) { console.error(err); } finally { hideLoading(); }
        }
    });

    // --- UI Update ---
    const updateUI = () => {
        const dict = i18n[state.lang];
        
        totalIncomeAmountEl.textContent = currencyFormatter.format(state.totalIncome);
        savingsAmountEl.textContent = currencyFormatter.format(state.budget.savings);
        needsAmountEl.textContent = currencyFormatter.format(state.budget.needs);
        wantsAmountEl.textContent = currencyFormatter.format(state.budget.wants);

        // Incomes
        incomesList.innerHTML = '';
        if (state.incomes.length === 0) {
            emptyIncomeState.style.display = 'block';
            document.getElementById('incomes-table').style.display = 'none';
        } else {
            emptyIncomeState.style.display = 'none';
            document.getElementById('incomes-table').style.display = 'table';
            state.incomes.forEach((inc, index) => {
                const tr = document.createElement('tr');
                const dateObj = new Date(inc.date);
                tr.innerHTML = `
                    <td>${dateObj.toLocaleDateString()}</td>
                    <td>${inc.description}</td>
                    <td style="font-weight: 600; color: var(--color-savings)">+${currencyFormatter.format(inc.amount)}</td>
                    <td><button class="delete-btn" onclick="deleteIncome('${inc._id}')"><i class="fa-solid fa-trash"></i></button></td>
                `;
                incomesList.appendChild(tr);
            });
        }

        // Expenses
        expensesList.innerHTML = '';
        if (state.expenses.length === 0) {
            emptyState.style.display = 'block';
            document.getElementById('expenses-table').style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            document.getElementById('expenses-table').style.display = 'table';
            state.expenses.forEach((expense, index) => {
                const tr = document.createElement('tr');
                const badgeClass = expense.category === 'need' ? 'badge-need' : 'badge-want';
                const categoryText = expense.category === 'need' ? dict.need_badge : dict.want_badge;
                const dateObj = new Date(expense.date);
                tr.innerHTML = `
                    <td>${dateObj.toLocaleDateString()}</td>
                    <td>${expense.description}</td>
                    <td><span class="badge ${badgeClass}">${categoryText}</span></td>
                    <td style="font-weight: 600;">${currencyFormatter.format(expense.amount)}</td>
                    <td><button class="delete-btn" onclick="deleteExpense('${expense._id}')"><i class="fa-solid fa-trash"></i></button></td>
                `;
                expensesList.appendChild(tr);
            });
        }
        updateSummary();
    };

    const updateSummary = () => {
        let spentNeeds = 0; let spentWants = 0;
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

        summaryRemainingNeeds.style.color = remainingNeeds < 0 ? 'var(--danger)' : 'var(--text-primary)';
        summaryRemainingWants.style.color = remainingWants < 0 ? 'var(--danger)' : 'var(--text-primary)';

        const calcPct = (spent, alloc) => alloc === 0 ? (spent > 0 ? 100 : 0) : Math.min((spent / alloc) * 100, 100);
        
        const needsPct = calcPct(spentNeeds, state.budget.needs);
        progressNeeds.style.width = `${needsPct}%`;
        progressNeeds.style.backgroundColor = needsPct >= 100 ? 'var(--danger)' : 'var(--color-needs)';
        
        const wantsPct = calcPct(spentWants, state.budget.wants);
        progressWants.style.width = `${wantsPct}%`;
        progressWants.style.backgroundColor = wantsPct >= 100 ? 'var(--danger)' : 'var(--color-wants)';
    };

    // --- Report Logic ---
    document.getElementById('generate-report-btn').addEventListener('click', () => {
        const monthVal = document.getElementById('report-month').value; // YYYY-MM
        if(!monthVal) return;
        
        const [year, month] = monthVal.split('-');
        const dateObj = new Date(year, month - 1);
        const monthName = dateObj.toLocaleString(state.lang === 'si' ? 'si-LK' : 'en-US', { month: 'long', year: 'numeric' });
        document.getElementById('report-display-month').textContent = monthName;

        // Filter data
        const filteredIncomes = state.incomes.filter(i => i.date.startsWith(monthVal));
        const filteredExpenses = state.expenses.filter(e => e.date.startsWith(monthVal));

        const totalInc = filteredIncomes.reduce((a, c) => a + c.amount, 0);
        const totalExp = filteredExpenses.reduce((a, c) => a + c.amount, 0);
        const savings = totalInc - totalExp;

        document.getElementById('rep-income').textContent = currencyFormatter.format(totalInc);
        document.getElementById('rep-expense').textContent = currencyFormatter.format(totalExp);
        document.getElementById('rep-savings').textContent = currencyFormatter.format(savings);
        
        const repSavingsEl = document.getElementById('rep-savings').parentElement;
        repSavingsEl.className = 'report-card ' + (savings >= 0 ? 'success' : 'danger');

        const incList = document.getElementById('rep-income-list');
        incList.innerHTML = '';
        filteredIncomes.forEach(inc => {
            incList.innerHTML += `<tr><td>${new Date(inc.date).toLocaleDateString()}</td><td>${inc.description}</td><td>${currencyFormatter.format(inc.amount)}</td></tr>`;
        });

        const expList = document.getElementById('rep-expense-list');
        expList.innerHTML = '';
        filteredExpenses.forEach(exp => {
            expList.innerHTML += `<tr><td>${new Date(exp.date).toLocaleDateString()}</td><td>${exp.description}</td><td>${currencyFormatter.format(exp.amount)}</td></tr>`;
        });

        document.getElementById('report-results').style.display = 'block';
    });

    // --- Bank Deposit Calculator Logic ---
    document.getElementById('calculate-deposit-btn').addEventListener('click', () => {
        const startVal = document.getElementById('calc-start-date').value;
        const endVal = document.getElementById('calc-end-date').value;
        
        if (!startVal || !endVal) {
            alert(state.lang === 'si' ? 'කරුණාකර දින දෙකම තෝරන්න.' : 'Please select both start and end dates.');
            return;
        }

        const startDate = new Date(startVal);
        startDate.setHours(0,0,0,0);
        
        const endDate = new Date(endVal);
        endDate.setHours(23,59,59,999);

        if (startDate > endDate) {
            alert(state.lang === 'si' ? 'ආරම්භක දිනය අවසන් දිනයට පෙර විය යුතුය.' : 'Start date must be before end date.');
            return;
        }

        // Filter incomes within the range
        const periodIncomes = state.incomes.filter(inc => {
            const incDate = new Date(inc.date);
            return incDate >= startDate && incDate <= endDate;
        });

        const periodTotal = periodIncomes.reduce((a, c) => a + c.amount, 0);

        document.getElementById('calc-total-income').textContent = currencyFormatter.format(periodTotal);
        document.getElementById('calc-savings').textContent = currencyFormatter.format(periodTotal * 0.20);
        document.getElementById('calc-needs').textContent = currencyFormatter.format(periodTotal * 0.50);
        document.getElementById('calc-wants').textContent = currencyFormatter.format(periodTotal * 0.30);

        document.getElementById('deposit-results').style.display = 'block';
    });

    // --- Initialization ---
    applyLanguage();
    applyTheme();
    document.getElementById('income-date').valueAsDate = new Date();
    document.getElementById('expense-date').valueAsDate = new Date();
    fetchData();
});
