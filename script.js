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

    // Auth Elements
    const authPortal      = document.getElementById('auth-portal');
    const mainApp         = document.getElementById('main-app');
    const tabLoginBtn     = document.getElementById('tab-login-btn');
    const tabRegisterBtn  = document.getElementById('tab-register-btn');
    const loginForm       = document.getElementById('login-form');
    const registerForm    = document.getElementById('register-form');
    const guestLoginBtn   = document.getElementById('guest-login-btn');

    // Profile Elements
    const profileMenu     = document.getElementById('profile-menu');
    const profileTrigger  = document.getElementById('profile-trigger');
    const profileName     = document.getElementById('profile-name');
    const profileEmail    = document.getElementById('profile-email');
    const userAvatar      = document.getElementById('user-avatar');
    const userIcon        = document.getElementById('user-icon');
    const logoutBtn       = document.getElementById('logout-btn');

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
        token: localStorage.getItem('ft_token') || '',
        user:  JSON.parse(localStorage.getItem('ft_user')) || null,
        isGuest: localStorage.getItem('ft_is_guest') === 'true'
    };

    // ─── CHART INSTANCES ──────────────────────────────────────────
    let categoryChart = null;
    let trendChart = null;

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
            
            // Auth translations
            auth_subtitle: 'Smart Money Management',
            login: 'Login',
            register: 'Register',
            email_address: 'Email Address',
            password: 'Password',
            signin: 'Sign In',
            full_name: 'Full Name',
            create_account: 'Create Account',
            guest_mode: 'Continue as Guest (Demo)',
            signout: 'Sign Out',
            visual_analytics: 'Visual Analytics',
            reports_desc: 'Track, analyse and plan your finances',
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

            // Auth translations
            auth_subtitle: 'ස්මාර්ට් මූල්‍ය කළමනාකරණය',
            login: 'ඇතුල් වන්න',
            register: 'ලියාපදිංචි වන්න',
            email_address: 'ඊමේල් ලිපිනය',
            password: 'මුරපදය',
            signin: 'ඇතුල් වන්න',
            full_name: 'සම්පූර්ණ නම',
            create_account: 'ගිණුමක් සාදන්න',
            guest_mode: 'ආගන්තුකයෙකු ලෙස ඇතුල් වන්න (Demo)',
            signout: 'පිටවන්න',
            visual_analytics: 'ප්‍රස්ථාරික විශ්ලේෂණය',
            reports_desc: 'ඔබගේ මූල්‍ය කටයුතු නිරීක්ෂණය කර සැලසුම් කරන්න',
        }
    };

    // ─── HEADERS GENERATOR ────────────────────────────────────────
    const getHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
        if (state.token) {
            headers['Authorization'] = `Bearer ${state.token}`;
        }
        return headers;
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
        if (categoryChart && trendChart) {
            initCharts();
            updateCharts();
        }
    });

    // ─── THEME ────────────────────────────────────────────────────
    const applyTheme = () => {
        document.documentElement.setAttribute('data-theme', state.theme);
        themeIcon.className = state.theme === 'dark'
            ? 'fa-solid fa-sun'
            : 'fa-solid fa-moon';
        if (categoryChart && trendChart) {
            initCharts();
            updateCharts();
        }
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

    // ─── MOCK GUEST DATABASE ──────────────────────────────────────
    const saveGuestData = () => {
        localStorage.setItem('ft_guest_incomes', JSON.stringify(state.incomes));
        localStorage.setItem('ft_guest_expenses', JSON.stringify(state.expenses));
    };

    const loadGuestData = () => {
        state.incomes = JSON.parse(localStorage.getItem('ft_guest_incomes')) || [];
        state.expenses = JSON.parse(localStorage.getItem('ft_guest_expenses')) || [];
        calcTotals();
        renderAll();
    };

    // ─── FETCH DATA ───────────────────────────────────────────────
    const fetchData = async () => {
        showLoading(i18n[state.lang].syncing);
        try {
            const [incRes, expRes] = await Promise.all([
                fetch(`${API_URL}/incomes`, { headers: getHeaders() }),
                fetch(`${API_URL}/expenses`, { headers: getHeaders() })
            ]);
            if (!incRes.ok || !expRes.ok) throw new Error('Fetch failed');
            state.incomes  = await incRes.json();
            state.expenses = await expRes.json();
            calcTotals();
            renderAll();
        } catch (err) {
            console.error('DB error:', err);
            alert('Cannot connect to database. Check your connection.');
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

        if (state.isGuest) {
            const newItem = {
                _id: 'guest_inc_' + Date.now(),
                date,
                description,
                amount
            };
            state.incomes.unshift(newItem);
            saveGuestData();
            calcTotals();
            renderAll();
            document.getElementById('income-desc').value   = '';
            document.getElementById('income-amount').value = '';
            return;
        }

        showLoading();
        try {
            const res = await fetch(`${API_URL}/incomes`, {
                method: 'POST',
                headers: getHeaders(),
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

        if (state.isGuest) {
            const newItem = {
                _id: 'guest_exp_' + Date.now(),
                date,
                description,
                category,
                amount
            };
            state.expenses.unshift(newItem);
            saveGuestData();
            renderAll();
            document.getElementById('expense-desc').value     = '';
            document.getElementById('expense-amount').value   = '';
            document.getElementById('expense-category').value = '';
            return;
        }

        showLoading();
        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: getHeaders(),
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
        if (state.isGuest) {
            state.incomes = state.incomes.filter(i => i._id !== id);
            saveGuestData();
            calcTotals();
            renderAll();
            return;
        }

        showLoading();
        try {
            await fetch(`${API_URL}/incomes/${id}`, { method: 'DELETE', headers: getHeaders() });
            state.incomes = state.incomes.filter(i => i._id !== id);
            calcTotals();
            renderAll();
        } catch (err) { console.error(err); }
        finally { hideLoading(); }
    };

    window.deleteExpense = async (id) => {
        if (state.isGuest) {
            state.expenses = state.expenses.filter(e => e._id !== id);
            saveGuestData();
            renderAll();
            return;
        }

        showLoading();
        try {
            await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE', headers: getHeaders() });
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
        updateCharts();
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

    // ─── CHARTS MANAGEMENT (CHART.JS) ─────────────────────────────
    const initCharts = () => {
        const ctx1 = document.getElementById('categoryChart')?.getContext('2d');
        const ctx2 = document.getElementById('trendChart')?.getContext('2d');
        if (!ctx1 || !ctx2) return;

        if (categoryChart) categoryChart.destroy();
        if (trendChart) trendChart.destroy();

        const isDark = state.theme === 'dark';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        const textColor = isDark ? '#8b949e' : '#64748b';

        // Category Breakdown Chart
        categoryChart = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: state.lang === 'si'
                    ? ['ඉතිරි කිරීම් (20%)', 'අවශ්‍යතා (Spent)', 'වුවමනා (Spent)', 'අවශ්‍යතා ඉතිරිය', 'වුවමනා ඉතිරිය']
                    : ['Savings (20%)', 'Needs (Spent)', 'Wants (Spent)', 'Needs Rem.', 'Wants Rem.'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#4dccbd', 
                        '#f0a03f', 
                        '#7c6af7', 
                        'rgba(240, 160, 63, 0.2)', 
                        'rgba(124, 106, 247, 0.2)'
                    ],
                    borderWidth: isDark ? 2 : 1,
                    borderColor: isDark ? '#161b22' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: textColor,
                            font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${context.label}: Rs. ${context.raw.toLocaleString('en-LK')}`
                        }
                    }
                }
            }
        });

        // Income vs Expense Trend
        trendChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: state.lang === 'si' ? 'ආදායම' : 'Income',
                        data: [],
                        backgroundColor: '#4dccbd',
                        borderRadius: 4
                    },
                    {
                        label: state.lang === 'si' ? 'වියදම' : 'Expense',
                        data: [],
                        backgroundColor: '#f56565',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                            font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${context.dataset.label}: Rs. ${context.raw.toLocaleString('en-LK')}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 9 } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 9 } }
                    }
                }
            }
        });
    };

    const updateCharts = () => {
        if (!categoryChart || !trendChart) {
            initCharts();
        }
        if (!categoryChart || !trendChart) return;

        let spentNeeds = 0, spentWants = 0;
        state.expenses.forEach(e => {
            if (e.category === 'need') spentNeeds += e.amount;
            else                       spentWants += e.amount;
        });

        const remNeeds = Math.max(0, state.budget.needs - spentNeeds);
        const remWants = Math.max(0, state.budget.wants - spentWants);
        const savings = state.budget.savings;

        categoryChart.data.datasets[0].data = [
            savings,
            spentNeeds,
            spentWants,
            remNeeds,
            remWants
        ];
        categoryChart.update();

        // Trend aggregation (Group by date)
        const dateMap = {};
        state.incomes.forEach(i => {
            const d = i.date.substring(0, 10);
            if (!dateMap[d]) dateMap[d] = { income: 0, expense: 0 };
            dateMap[d].income += i.amount;
        });
        state.expenses.forEach(e => {
            const d = e.date.substring(0, 10);
            if (!dateMap[d]) dateMap[d] = { income: 0, expense: 0 };
            dateMap[d].expense += e.amount;
        });

        const sortedDates = Object.keys(dateMap).sort().slice(-7);
        trendChart.data.labels = sortedDates.map(d => fmtDate(d));
        trendChart.data.datasets[0].data = sortedDates.map(d => dateMap[d].income);
        trendChart.data.datasets[1].data = sortedDates.map(d => dateMap[d].expense);
        trendChart.update();
    };

    // ─── AUTHENTICATION PORTAL LOGIC ──────────────────────────────
    
    // Tab toggle
    tabLoginBtn.addEventListener('click', () => {
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });

    tabRegisterBtn.addEventListener('click', () => {
        tabRegisterBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    // Forms submission handlers
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        showLoading("Signing In...");
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Login failed');
            }

            const data = await res.json();
            localStorage.setItem('ft_token', data.token);
            localStorage.setItem('ft_user', JSON.stringify(data.user));
            localStorage.setItem('ft_is_guest', 'false');

            state.token = data.token;
            state.user = data.user;
            state.isGuest = false;

            initSession();
        } catch (err) {
            alert(err.message);
        } finally {
            hideLoading();
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        showLoading("Creating Account...");
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Registration failed');
            }

            const data = await res.json();
            localStorage.setItem('ft_token', data.token);
            localStorage.setItem('ft_user', JSON.stringify(data.user));
            localStorage.setItem('ft_is_guest', 'false');

            state.token = data.token;
            state.user = data.user;
            state.isGuest = false;

            initSession();
        } catch (err) {
            alert(err.message);
        } finally {
            hideLoading();
        }
    });

    // Guest Mode
    guestLoginBtn.addEventListener('click', () => {
        localStorage.setItem('ft_token', 'guest_token');
        localStorage.setItem('ft_user', JSON.stringify({ name: 'Guest User', email: 'guest@finance.lk', picture: '' }));
        localStorage.setItem('ft_is_guest', 'true');

        state.token = 'guest_token';
        state.user = { name: 'Guest User', email: 'guest@finance.lk', picture: '' };
        state.isGuest = true;

        initSession();
    });

    // Profile Dropdown
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        profileMenu.classList.remove('open');
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('ft_token');
        localStorage.removeItem('ft_user');
        localStorage.removeItem('ft_is_guest');

        state.token = '';
        state.user = null;
        state.isGuest = false;
        state.incomes = [];
        state.expenses = [];

        if (categoryChart) { categoryChart.destroy(); categoryChart = null; }
        if (trendChart) { trendChart.destroy(); trendChart = null; }

        initSession();
    });

    // Google Sign-In SDK Initialization
    const initGoogleSignIn = () => {
        if (typeof google === 'undefined') {
            setTimeout(initGoogleSignIn, 1000);
            return;
        }

        google.accounts.id.initialize({
            client_id: "898516089332-dummyid.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse,
            auto_select: false
        });

        google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            { theme: "outline", size: "large", width: "100%", shape: "rectangular" }
        );
    };

    const handleGoogleCredentialResponse = async (response) => {
        showLoading("Signing in with Google...");
        try {
            const res = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Google Auth Failed');
            }

            const data = await res.json();
            localStorage.setItem('ft_token', data.token);
            localStorage.setItem('ft_user', JSON.stringify(data.user));
            localStorage.setItem('ft_is_guest', 'false');
            
            state.token = data.token;
            state.user = data.user;
            state.isGuest = false;

            initSession();
        } catch (err) {
            console.error(err);
            alert("Google Sign-In failed. Try standard account or Guest Mode.");
        } finally {
            hideLoading();
        }
    };

    // Session Initialization
    const initSession = () => {
        if (state.token) {
            authPortal.style.display = 'none';
            mainApp.style.display = 'block';

            if (state.user) {
                profileMenu.style.display = 'inline-block';
                profileName.textContent = state.user.name;
                profileEmail.textContent = state.user.email;
                if (state.user.picture) {
                    userAvatar.src = state.user.picture;
                    userAvatar.style.display = 'block';
                    userIcon.style.display = 'none';
                } else {
                    userAvatar.style.display = 'none';
                    userIcon.style.display = 'block';
                }
            }

            if (state.isGuest) {
                loadGuestData();
            } else {
                fetchData();
            }
        } else {
            authPortal.style.display = 'flex';
            mainApp.style.display = 'none';
            profileMenu.style.display = 'none';
        }
    };

    // ─── INIT ─────────────────────────────────────────────────────
    applyTheme();
    applyLanguage();

    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('income-date').value  = today;
    document.getElementById('expense-date').value = today;

    // Load active session on boot
    initSession();
    
    // Lazy load Google SDK
    initGoogleSignIn();
});