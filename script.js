document.addEventListener('DOMContentLoaded', () => {

    // ─── CONFIG ───────────────────────────────────────────────────
    const API_URL = '/api';

    // ─── DOM REFS ─────────────────────────────────────────────────
    const loadingOverlay  = document.getElementById('loading-overlay');
    const loadingText     = document.getElementById('loading-text');
    const langToggleBtn   = document.getElementById('lang-toggle');
    const currentLangEl   = document.getElementById('current-lang');
    const themeToggleBtn  = document.getElementById('theme-toggle');
    const themeIcon       = document.getElementById('theme-icon');

    // Income
    const incomeForm      = document.getElementById('income-form');
    const incomesList     = document.getElementById('incomes-list');
    const emptyIncome     = document.getElementById('empty-income');
    const incomesTable    = document.getElementById('incomes-table');
    const totalIncomeEl   = document.getElementById('total-income-amount');
    const savingsAmountEl = document.getElementById('savings-amount');
    const needsAmountEl   = document.getElementById('needs-amount');
    const wantsAmountEl   = document.getElementById('wants-amount');

    // Expense
    const expenseForm     = document.getElementById('expense-form');
    const expensesList    = document.getElementById('expenses-list');
    const emptyExpense    = document.getElementById('empty-expense');
    const expensesTable   = document.getElementById('expenses-table');

    // Summary
    const sumAllocNeeds   = document.getElementById('summary-allocated-needs');
    const sumSpentNeeds   = document.getElementById('summary-spent-needs');
    const sumRemNeeds     = document.getElementById('summary-remaining-needs');
    const progressNeeds   = document.getElementById('progress-needs');
    const sumAllocWants   = document.getElementById('summary-allocated-wants');
    const sumSpentWants   = document.getElementById('summary-spent-wants');
    const sumRemWants     = document.getElementById('summary-remaining-wants');
    const progressWants   = document.getElementById('progress-wants');
    const totalSpentEl    = document.getElementById('total-spent-amount');

    // ─── STATE ────────────────────────────────────────────────────
    let state = {
        incomes:  [],
        expenses: [],
        budget:   { savings: 0, needs: 0, wants: 0 },
        totalIncome: 0,
        lang:  localStorage.getItem('ft_lang')  || 'en',
        theme: localStorage.getItem('ft_theme') || 'dark',
    };

    // ─── TRANSLATIONS ─────────────────────────────────────────────
    const i18n = {
        en: {
            app_title: 'FinanceTracker',
            syncing: 'Syncing with Database...',
            main_heading: 'Smart Money Management',
            sub_heading: 'Manage your class fees easily',
            tab_dashboard: 'Dashboard',
            tab_reports: 'Reports',
            daily_income: 'Daily Income Tracker',
            date: 'Date',
            class_desc: 'Class / Description',
            amount_received: 'Amount Received (Rs.)',
            add_income: 'Add Income',
            amount: 'Amount',
            action: 'Action',
            no_incomes: 'No incomes logged yet.',
            budget_allocation: 'Budget Allocation',
            total_monthly_income: 'Total Monthly Income',
            savings: 'Savings (20%)',
            needs: 'Needs (50%)',
            wants: 'Wants (30%)',
            daily_expense: 'Daily Expense Tracker',
            description: 'Description',
            category: 'Category',
            select: 'Select...',
            need_option: 'Need / Expense',
            want_option: 'Want',
            add_expense: 'Add Expense',
            no_expenses: 'No expenses logged yet.',
            balance_summary: 'Balance Summary',
            needs_balance: 'Needs Balance',
            wants_balance: 'Wants Balance',
            allocated: 'Allocated',
            spent: 'Spent',
            remaining: 'Remaining',
            total_monthly_spent: 'Total Monthly Spent',
            monthly_report_title: 'Monthly Report Filter',
            select_month: 'Select Month',
            generate_report: 'Generate Report',
            total_income: 'Total Income',
            total_expense: 'Total Expense',
            net_savings: 'Net Savings',
            income_breakdown: 'Income Breakdown',
            expense_breakdown: 'Expense Breakdown',
            need_badge: 'Need',
            want_badge: 'Want',
            deposit_calculator_title: 'Bank Deposit Calculator',
            deposit_calculator_desc: 'Select a date range to calculate deposit percentages for accumulated class fees.',
            start_date: 'Start Date',
            end_date: 'End Date',
            calculate: 'Calculate',
            selected_period_income: 'Total Income in Selected Period',
            deposit_split: 'Deposit Split:',
        },
        si: {
            app_title: 'මූල්‍ය කළමනාකරු',
            syncing: 'දත්ත සමග සම්බන්ධ වෙමින්...',
            main_heading: 'ස්මාර්ට් මූල්‍ය කළමනාකරණය',
            sub_heading: 'ඔබගේ පන්ති ගාස්තු පහසුවෙන් කළමනාකරණය කරන්න',
            tab_dashboard: 'ප්‍රධාන පුවරුව',
            tab_reports: 'මාසික වාර්තා',
            daily_income: 'දෛනික ආදායම් සටහන',
            date: 'දිනය',
            class_desc: 'පන්තිය / විස්තරය',
            amount_received: 'ලැබුණු මුදල (රු.)',
            add_income: 'ආදායම එකතු කරන්න',
            amount: 'මුදල',
            action: 'ක්‍රියාව',
            no_incomes: 'තවම ආදායම් සටහන් කර නැත.',
            budget_allocation: 'අයවැය බෙදීම',
            total_monthly_income: 'මුළු මාසික ආදායම',
            savings: 'ඉතිරිය (20%)',
            needs: 'අවශ්‍යතා (50%)',
            wants: 'වුවමනා (30%)',
            daily_expense: 'දෛනික වියදම් සටහන',
            description: 'විස්තරය',
            category: 'කාණ්ඩය',
            select: 'තෝරන්න...',
            need_option: 'අවශ්‍යතා / වියදම්',
            want_option: 'වුවමනා',
            add_expense: 'වියදම එකතු කරන්න',
            no_expenses: 'තවම වියදම් සටහන් කර නැත.',
            balance_summary: 'ශේෂ සාරාංශය',
            needs_balance: 'අවශ්‍යතා ශේෂය',
            wants_balance: 'වුවමනා ශේෂය',
            allocated: 'වෙන් කල',
            spent: 'වියදම් කල',
            remaining: 'ඉතිරිය',
            total_monthly_spent: 'මුළු මාසික වියදම',
            monthly_report_title: 'මාසික වාර්තා සෙවීම',
            select_month: 'මාසය තෝරන්න',
            generate_report: 'වාර්තාව බලන්න',
            total_income: 'මුළු ආදායම',
            total_expense: 'මුළු වියදම',
            net_savings: 'ඉතිරි මුදල',
            income_breakdown: 'ආදායම් විස්තරය',
            expense_breakdown: 'වියදම් විස්තරය',
            need_badge: 'අවශ්‍යතා',
            want_badge: 'වුවමනා',
            deposit_calculator_title: 'බැංකු තැන්පතු ගණනය',
            deposit_calculator_desc: 'දින කිහිපයක එකතු වූ පන්ති ගාස්තු බැංකුවට දැමීමට ප්‍රතිශත ගණනය කරන්න.',
            start_date: 'ආරම්භක දිනය',
            end_date: 'අවසන් දිනය',
            calculate: 'ගණනය කරන්න',
            selected_period_income: 'තෝරාගත් කාලයේ මුළු ආදායම',
            deposit_split: 'බැංකුවට දැමිය යුතු අයුරු:',
        }
    };

    // ─── FORMATTERS ───────────────────────────────────────────────
    const fmt = (v) =>
        'Rs.\u00a0' + Number(v).toLocaleString('en-LK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const fmtDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString(state.lang === 'si' ? 'si-LK' : 'en-GB', {
            day: '2-digit', month: 'short', year: '2-digit'
        });
    };

    // ─── LOADING ──────────────────────────────────────────────────
    const showLoading = (msg) => {
        if (msg && loadingText) loadingText.textContent = msg;
        loadingOverlay.style.display = 'flex';
    };
    const hideLoading = () => { loadingOverlay.style.display = 'none'; };

    // ─── TAB SWITCHING ────────────────────────────────────────────
    window.switchTab = (tabId, btn) => {
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
        btn.classList.add('active');

        if (tabId === 'reports') {
            const m = document.getElementById('report-month');
            if (!m.value) m.value = new Date().toISOString().slice(0, 7);
        }
    };

    // ─── LANGUAGE ─────────────────────────────────────────────────
    const applyLanguage = () => {
        const dict = i18n[state.lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) el.textContent = dict[key];
        });
        currentLangEl.textContent = state.lang === 'en' ? 'සිං' : 'EN';
        document.body.className = state.lang === 'si' ? 'lang-si' : '';
        renderAll();
    };

    langToggleBtn.addEventListener('click', () => {
        state.lang = state.lang === 'en' ? 'si' : 'en';
        localStorage.setItem('ft_lang', state.lang);
        applyLanguage();
    });

    // ─── THEME ────────────────────────────────────────────────────
    const applyTheme = () => {
        document.documentElement.setAttribute('data-theme', state.theme);
        themeIcon.className = state.theme === 'dark'
            ? 'fa-solid fa-sun'
            : 'fa-solid fa-moon';
    };

    themeToggleBtn.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('ft_theme', state.theme);
        applyTheme();
    });

    // ─── CALCULATIONS ─────────────────────────────────────────────
    const calcTotals = () => {
        state.totalIncome = state.incomes.reduce((a, c) => a + c.amount, 0);
        state.budget = {
            savings: state.totalIncome * 0.20,
            needs:   state.totalIncome * 0.50,
            wants:   state.totalIncome * 0.30,
        };
    };

    // ─── FETCH DATA ───────────────────────────────────────────────
    const fetchData = async () => {
        showLoading(i18n[state.lang].syncing);
        try {
            const [incRes, expRes] = await Promise.all([
                fetch(`${API_URL}/incomes`),
                fetch(`${API_URL}/expenses`)
            ]);
            if (!incRes.ok || !expRes.ok) throw new Error('Fetch failed');
            state.incomes  = await incRes.json();
            state.expenses = await expRes.json();
            calcTotals();
            renderAll();
        } catch (err) {
            console.error('DB error:', err);
            alert('Cannot connect to database. Check your connection or MongoDB IP whitelist.');
        } finally {
            hideLoading();
        }
    };

    // ─── INCOME FORM ──────────────────────────────────────────────
    incomeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date        = document.getElementById('income-date').value;
        const description = document.getElementById('income-desc').value.trim();
        const amount      = parseFloat(document.getElementById('income-amount').value);
        if (!date || !description || isNaN(amount) || amount <= 0) return;

        showLoading();
        try {
            const res = await fetch(`${API_URL}/incomes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, description, amount })
            });
            const newItem = await res.json();
            state.incomes.unshift(newItem);
            calcTotals();
            renderAll();
            document.getElementById('income-desc').value   = '';
            document.getElementById('income-amount').value = '';
        } catch (err) { console.error(err); }
        finally { hideLoading(); }
    });

    // ─── EXPENSE FORM ─────────────────────────────────────────────
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date        = document.getElementById('expense-date').value;
        const description = document.getElementById('expense-desc').value.trim();
        const category    = document.getElementById('expense-category').value;
        const amount      = parseFloat(document.getElementById('expense-amount').value);
        if (!date || !description || !category || isNaN(amount) || amount <= 0) return;

        showLoading();
        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, description, category, amount })
            });
            const newItem = await res.json();
            state.expenses.unshift(newItem);
            renderAll();
            document.getElementById('expense-desc').value     = '';
            document.getElementById('expense-amount').value   = '';
            document.getElementById('expense-category').value = '';
        } catch (err) { console.error(err); }
        finally { hideLoading(); }
    });

    // ─── DELETE ───────────────────────────────────────────────────
    window.deleteIncome = async (id) => {
        showLoading();
        try {
            await fetch(`${API_URL}/incomes/${id}`, { method: 'DELETE' });
            state.incomes = state.incomes.filter(i => i._id !== id);
            calcTotals();
            renderAll();
        } catch (err) { console.error(err); }
        finally { hideLoading(); }
    };

    window.deleteExpense = async (id) => {
        showLoading();
        try {
            await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
            state.expenses = state.expenses.filter(e => e._id !== id);
            renderAll();
        } catch (err) { console.error(err); }
        finally { hideLoading(); }
    };

    // ─── RENDER ALL ───────────────────────────────────────────────
    const renderAll = () => {
        const dict = i18n[state.lang];

        // Budget allocation display
        totalIncomeEl.textContent   = fmt(state.totalIncome);
        savingsAmountEl.textContent = fmt(state.budget.savings);
        needsAmountEl.textContent   = fmt(state.budget.needs);
        wantsAmountEl.textContent   = fmt(state.budget.wants);

        // ── Incomes table ──
        incomesList.innerHTML = '';
        if (state.incomes.length === 0) {
            emptyIncome.style.display  = 'block';
            incomesTable.style.display = 'none';
        } else {
            emptyIncome.style.display  = 'none';
            incomesTable.style.display = 'table';
            state.incomes.forEach(inc => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${fmtDate(inc.date)}</td>
                    <td>${inc.description}</td>
                    <td style="font-weight:700;color:var(--cyan);font-family:var(--mono)">
                        +${fmt(inc.amount)}
                    </td>
                    <td>
                        <button class="del-btn" onclick="deleteIncome('${inc._id}')" title="Delete">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>`;
                incomesList.appendChild(tr);
            });
        }

        // ── Expenses table ──
        expensesList.innerHTML = '';
        if (state.expenses.length === 0) {
            emptyExpense.style.display  = 'block';
            expensesTable.style.display = 'none';
        } else {
            emptyExpense.style.display  = 'none';
            expensesTable.style.display = 'table';
            state.expenses.forEach(exp => {
                const isNeed    = exp.category === 'need';
                const badgeCls  = isNeed ? 'badge-need' : 'badge-want';
                const badgeTxt  = isNeed ? dict.need_badge : dict.want_badge;
                const tr        = document.createElement('tr');
                tr.innerHTML = `
                    <td>${fmtDate(exp.date)}</td>
                    <td>${exp.description}</td>
                    <td><span class="badge ${badgeCls}">${badgeTxt}</span></td>
                    <td style="font-weight:600;font-family:var(--mono)">${fmt(exp.amount)}</td>
                    <td>
                        <button class="del-btn" onclick="deleteExpense('${exp._id}')" title="Delete">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>`;
                expensesList.appendChild(tr);
            });
        }

        renderSummary();
    };

    // ─── RENDER SUMMARY ───────────────────────────────────────────
    const renderSummary = () => {
        let spentNeeds = 0, spentWants = 0;
        state.expenses.forEach(e => {
            if (e.category === 'need') spentNeeds += e.amount;
            else                       spentWants += e.amount;
        });

        const remNeeds = state.budget.needs - spentNeeds;
        const remWants = state.budget.wants - spentWants;

        sumAllocNeeds.textContent = fmt(state.budget.needs);
        sumSpentNeeds.textContent = fmt(spentNeeds);
        sumRemNeeds.textContent   = fmt(remNeeds);
        sumRemNeeds.style.color   = remNeeds < 0 ? 'var(--rose)' : '';

        sumAllocWants.textContent = fmt(state.budget.wants);
        sumSpentWants.textContent = fmt(spentWants);
        sumRemWants.textContent   = fmt(remWants);
        sumRemWants.style.color   = remWants < 0 ? 'var(--rose)' : '';

        totalSpentEl.textContent = fmt(spentNeeds + spentWants);

        const pct = (spent, alloc) =>
            alloc === 0 ? (spent > 0 ? 100 : 0) : Math.min((spent / alloc) * 100, 100);

        const np = pct(spentNeeds, state.budget.needs);
        progressNeeds.style.width      = `${np}%`;
        progressNeeds.style.background = np >= 100 ? 'var(--rose)' : 'var(--amber)';

        const wp = pct(spentWants, state.budget.wants);
        progressWants.style.width      = `${wp}%`;
        progressWants.style.background = wp >= 100 ? 'var(--rose)' : 'var(--indigo-light)';
    };

    // ─── MONTHLY REPORT ───────────────────────────────────────────
    document.getElementById('generate-report-btn').addEventListener('click', () => {
        const monthVal = document.getElementById('report-month').value;
        if (!monthVal) return;

        const [year, month] = monthVal.split('-');
        const monthName = new Date(year, month - 1).toLocaleString(
            state.lang === 'si' ? 'si-LK' : 'en-US',
            { month: 'long', year: 'numeric' }
        );
        document.getElementById('report-display-month').textContent = monthName;

        const filtInc = state.incomes.filter(i  => i.date.startsWith(monthVal));
        const filtExp = state.expenses.filter(e => e.date.startsWith(monthVal));

        const totalInc = filtInc.reduce((a, c) => a + c.amount, 0);
        const totalExp = filtExp.reduce((a, c) => a + c.amount, 0);
        const savings  = totalInc - totalExp;

        document.getElementById('rep-income').textContent  = fmt(totalInc);
        document.getElementById('rep-expense').textContent = fmt(totalExp);
        document.getElementById('rep-savings').textContent = fmt(savings);

        // Savings card colour
        const savCard = document.getElementById('savings-kpi');
        savCard.className = 'kpi-card ' + (savings >= 0 ? 'kpi-card--green' : 'kpi-card--danger');

        // Income breakdown
        const incBody = document.getElementById('rep-income-list');
        incBody.innerHTML = filtInc.length
            ? filtInc.map(i => `
                <tr>
                    <td>${fmtDate(i.date)}</td>
                    <td>${i.description}</td>
                    <td style="color:var(--cyan);font-family:var(--mono);font-weight:600">${fmt(i.amount)}</td>
                </tr>`).join('')
            : '<tr><td colspan="3" style="text-align:center;color:var(--text-subtle);padding:1.5rem">No data</td></tr>';

        // Expense breakdown
        const expBody = document.getElementById('rep-expense-list');
        expBody.innerHTML = filtExp.length
            ? filtExp.map(e => `
                <tr>
                    <td>${fmtDate(e.date)}</td>
                    <td>${e.description}</td>
                    <td style="font-family:var(--mono);font-weight:600">${fmt(e.amount)}</td>
                </tr>`).join('')
            : '<tr><td colspan="3" style="text-align:center;color:var(--text-subtle);padding:1.5rem">No data</td></tr>';

        document.getElementById('report-results').style.display = 'block';
    });

    // ─── BANK DEPOSIT CALCULATOR ──────────────────────────────────
    document.getElementById('calculate-deposit-btn').addEventListener('click', () => {
        const startVal = document.getElementById('calc-start-date').value;
        const endVal   = document.getElementById('calc-end-date').value;

        if (!startVal || !endVal) {
            alert(state.lang === 'si'
                ? 'කරුණාකර දින දෙකම තෝරන්න.'
                : 'Please select both start and end dates.');
            return;
        }

        const startDate = new Date(startVal); startDate.setHours(0, 0, 0, 0);
        const endDate   = new Date(endVal);   endDate.setHours(23, 59, 59, 999);

        if (startDate > endDate) {
            alert(state.lang === 'si'
                ? 'ආරම්භක දිනය අවසන් දිනයට පෙර විය යුතුය.'
                : 'Start date must be before end date.');
            return;
        }

        const periodIncomes = state.incomes.filter(inc => {
            const d = new Date(inc.date);
            return d >= startDate && d <= endDate;
        });
        const total = periodIncomes.reduce((a, c) => a + c.amount, 0);

        document.getElementById('calc-total-income').textContent = fmt(total);
        document.getElementById('calc-savings').textContent      = fmt(total * 0.20);
        document.getElementById('calc-needs').textContent        = fmt(total * 0.50);
        document.getElementById('calc-wants').textContent        = fmt(total * 0.30);

        document.getElementById('deposit-results').style.display = 'block';
    });

    // ─── INIT ─────────────────────────────────────────────────────
    applyTheme();
    applyLanguage();

    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('income-date').value  = today;
    document.getElementById('expense-date').value = today;

    fetchData();
});