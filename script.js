// Expense Tracker Application
class ExpenseTracker {
    constructor() {
        this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        this.budget = parseFloat(localStorage.getItem('budget')) || 0;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentEditId = null;
        
        this.categoryConfig = {
            food: { name: '🍕 Food & Dining', color: '#ff6b6b' },
            transport: { name: '🚌 Transport', color: '#4ecdc4' },
            entertainment: { name: '🎬 Entertainment', color: '#45b7d1' },
            stationery: { name: '📚 Stationery', color: '#96ceb4' },
            rent: { name: '🏠 Rent & Bills', color: '#ffeaa7' },
            clothing: { name: '👕 Clothing', color: '#dda0dd' },
            health: { name: '💊 Health & Medical', color: '#98d8c8' },
            other: { name: '🔧 Other', color: '#a29bfe' }
        };
        
        this.init();
    }
    
    init() {
        this.setTheme(this.currentTheme);
        this.bindEvents();
        this.setTodayDate();
        this.updateDashboard();
        this.renderExpenses();
        this.updateBudgetDisplay();
        
        // Add some sample data if no expenses exist
        if (this.expenses.length === 0) {
            this.addSampleData();
        }
    }
    
    addSampleData() {
        const sampleExpenses = [
            {
                id: Date.now() + 1,
                amount: 120.00,
                category: 'food',
                date: this.getDateString(new Date(Date.now() - 86400000)), // Yesterday
                description: 'Lunch at campus cafeteria',
                timestamp: Date.now() - 86400000
            },
            {
                id: Date.now() + 2,
                amount: 45.00,
                category: 'transport',
                date: this.getDateString(new Date(Date.now() - 172800000)), // 2 days ago
                description: 'Auto fare',
                timestamp: Date.now() - 172800000
            },
            {
                id: Date.now() + 3,
                amount: 350.00,
                category: 'entertainment',
                date: this.getDateString(new Date(Date.now() - 259200000)), // 3 days ago
                description: 'Movie tickets',
                timestamp: Date.now() - 259200000
            },
            {
                id: Date.now() + 4,
                amount: 80.00,
                category: 'stationery',
                date: this.getDateString(new Date(Date.now() - 345600000)), // 4 days ago
                description: 'Notebook and pens',
                timestamp: Date.now() - 345600000
            }
        ];
        
        this.expenses = sampleExpenses;
        this.budget = 15000; // Sample budget in rupees
        this.saveToLocalStorage();
        this.updateDashboard();
        this.renderExpenses();
        this.updateBudgetDisplay();
    }
    
    bindEvents() {
        // Form submission
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });
        
        // Budget setting
        document.getElementById('setBudgetBtn').addEventListener('click', () => {
            this.setBudget();
        });
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Export functionality
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        // Filter controls
        document.getElementById('filterCategory').addEventListener('change', () => {
            this.renderExpenses();
        });
        
        document.getElementById('filterStartDate').addEventListener('change', () => {
            this.renderExpenses();
        });
        
        document.getElementById('filterEndDate').addEventListener('change', () => {
            this.renderExpenses();
        });
        
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Edit expense form
        document.getElementById('editExpenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExpenseEdit();
        });
        
        // Modal close events
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeModal(closeBtn.closest('.modal'));
            });
        });
        
        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }
    
    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }
    
    getDateString(date) {
        return date.toISOString().split('T')[0];
    }
    
    addExpense() {
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        
        if (!amount || !category || !date) {
            this.showNotification('Please fill in all required fields!', 'error');
            return;
        }
        
        const expense = {
            id: Date.now(),
            amount: amount,
            category: category,
            date: date,
            description: description || '',
            timestamp: new Date(date).getTime()
        };
        
        this.expenses.unshift(expense); // Add to beginning for recent first
        this.saveToLocalStorage();
        this.updateDashboard();
        this.renderExpenses();
        this.checkBudgetWarning(amount);
        this.clearForm();
        
        this.showNotification('Expense added successfully!', 'success');
    }
    
    editExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (!expense) return;
        
        this.currentEditId = id;
        document.getElementById('editAmount').value = expense.amount;
        document.getElementById('editCategory').value = expense.category;
        document.getElementById('editDate').value = expense.date;
        document.getElementById('editDescription').value = expense.description;
        
        this.showModal('editExpenseModal');
    }
    
    saveExpenseEdit() {
        const amount = parseFloat(document.getElementById('editAmount').value);
        const category = document.getElementById('editCategory').value;
        const date = document.getElementById('editDate').value;
        const description = document.getElementById('editDescription').value;
        
        if (!amount || !category || !date) {
            this.showNotification('Please fill in all required fields!', 'error');
            return;
        }
        
        const expenseIndex = this.expenses.findIndex(exp => exp.id === this.currentEditId);
        if (expenseIndex === -1) return;
        
        this.expenses[expenseIndex] = {
            ...this.expenses[expenseIndex],
            amount: amount,
            category: category,
            date: date,
            description: description,
            timestamp: new Date(date).getTime()
        };
        
        this.saveToLocalStorage();
        this.updateDashboard();
        this.renderExpenses();
        this.closeModal(document.getElementById('editExpenseModal'));
        
        this.showNotification('Expense updated successfully!', 'success');
    }
    
    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveToLocalStorage();
            this.updateDashboard();
            this.renderExpenses();
            
            this.showNotification('Expense deleted successfully!', 'success');
        }
    }
    
    setBudget() {
        const budgetInput = document.getElementById('budgetInput');
        const budget = parseFloat(budgetInput.value);
        
        if (budget && budget > 0) {
            this.budget = budget;
            localStorage.setItem('budget', budget.toString());
            this.updateBudgetDisplay();
            this.updateDashboard();
            budgetInput.value = '';
            
            this.showNotification('Budget updated successfully!', 'success');
        } else {
            this.showNotification('Please enter a valid budget amount!', 'error');
        }
    }
    
    updateBudgetDisplay() {
        const monthlySpent = this.getMonthlyTotal();
        const remaining = this.budget - monthlySpent;
        const percentage = this.budget > 0 ? (monthlySpent / this.budget) * 100 : 0;
        
        document.getElementById('progressBar').style.width = `${Math.min(percentage, 100)}%`;
        
        if (this.budget > 0) {
            document.getElementById('budgetInfo').innerHTML = `
                <span>Spent: ₹${monthlySpent.toFixed(2)}</span>
                <span>Budget: ₹${this.budget.toFixed(2)}</span>
            `;
            
            // Change progress bar color based on spending
            const progressBar = document.getElementById('progressBar');
            if (percentage > 90) {
                progressBar.style.background = '#ef4444';
            } else if (percentage > 75) {
                progressBar.style.background = '#f59e0b';
            } else {
                progressBar.style.background = 'linear-gradient(90deg, #10b981, #f59e0b)';
            }
        } else {
            document.getElementById('budgetInfo').innerHTML = '<span>Set a monthly budget to track your spending</span>';
        }
    }
    
    checkBudgetWarning(newExpenseAmount) {
        if (this.budget === 0) return;
        
        const monthlySpent = this.getMonthlyTotal();
        const percentage = (monthlySpent / this.budget) * 100;
        
        let message = '';
        if (percentage >= 100) {
            message = `You've exceeded your monthly budget! You've spent ₹${monthlySpent.toFixed(2)} out of ₹${this.budget.toFixed(2)}.`;
        } else if (percentage >= 90) {
            message = `Warning! You've used ${percentage.toFixed(1)}% of your monthly budget. Only ₹${(this.budget - monthlySpent).toFixed(2)} remaining.`;
        } else if (percentage >= 75) {
            message = `Heads up! You've used ${percentage.toFixed(1)}% of your monthly budget. Consider tracking your expenses more carefully.`;
        }
        
        if (message) {
            document.getElementById('warningMessage').textContent = message;
            this.showModal('budgetWarningModal');
        }
    }
    
    getMonthlyTotal() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return this.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && 
                       expenseDate.getFullYear() === currentYear;
            })
            .reduce((total, expense) => total + expense.amount, 0);
    }
    
    updateDashboard() {
        const monthlyTotal = this.getMonthlyTotal();
        const remaining = this.budget - monthlyTotal;
        const totalExpenses = this.expenses.length;
        
        document.getElementById('monthlyTotal').textContent = `₹${monthlyTotal.toFixed(2)}`;
        document.getElementById('budgetRemaining').textContent = `₹${remaining.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = totalExpenses;
        
        // Update colors based on budget status
        const budgetCard = document.querySelector('.stat-card:nth-child(2)');
        if (remaining < 0) {
            budgetCard.querySelector('.stat-icon').style.background = '#ef4444';
        } else if (remaining < this.budget * 0.1) {
            budgetCard.querySelector('.stat-icon').style.background = '#f59e0b';
        } else {
            budgetCard.querySelector('.stat-icon').style.background = '#10b981';
        }
    }
    
    renderExpenses() {
        const expensesList = document.getElementById('expensesList');
        let filteredExpenses = this.getFilteredExpenses();
        
        if (filteredExpenses.length === 0) {
            expensesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No expenses found</p>
                </div>
            `;
            return;
        }
        
        // Sort by date (newest first)
        filteredExpenses.sort((a, b) => b.timestamp - a.timestamp);
        
        expensesList.innerHTML = filteredExpenses.map(expense => {
            const categoryConfig = this.categoryConfig[expense.category];
            const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            return `
                <div class="expense-item fade-in">
                    <div class="expense-info">
                        <div class="expense-category category-${expense.category}">
                            ${categoryConfig.name.split(' ')[0]}
                        </div>
                        <div class="expense-details">
                            <h4>${expense.description || categoryConfig.name}</h4>
                            <p>${formattedDate}</p>
                        </div>
                    </div>
                    <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                    <div class="expense-actions">
                        <button class="edit-btn" onclick="expenseTracker.editExpense(${expense.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="expenseTracker.deleteExpense(${expense.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    getFilteredExpenses() {
        const categoryFilter = document.getElementById('filterCategory').value;
        const startDate = document.getElementById('filterStartDate').value;
        const endDate = document.getElementById('filterEndDate').value;
        
        return this.expenses.filter(expense => {
            let matchesCategory = !categoryFilter || expense.category === categoryFilter;
            let matchesStartDate = !startDate || expense.date >= startDate;
            let matchesEndDate = !endDate || expense.date <= endDate;
            
            return matchesCategory && matchesStartDate && matchesEndDate;
        });
    }
    
    clearFilters() {
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
        this.renderExpenses();
    }
    
    
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
        
    }
    
    
    exportData() {
        const data = {
            expenses: this.expenses,
            budget: this.budget,
            exportDate: new Date().toISOString(),
            summary: {
                totalExpenses: this.expenses.length,
                monthlyTotal: this.getMonthlyTotal(),
                categorySummary: this.getCategorySummary()
            }
        };
        
        const csvData = this.convertToCSV();
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }
    
    convertToCSV() {
        const headers = ['Date', 'Category', 'Amount', 'Description'];
        const rows = this.expenses.map(expense => [
            expense.date,
            this.categoryConfig[expense.category].name,
            expense.amount,
            expense.description || ''
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
            
        return csvContent;
    }
    
    getCategorySummary() {
        const summary = {};
        this.expenses.forEach(expense => {
            summary[expense.category] = (summary[expense.category] || 0) + expense.amount;
        });
        return summary;
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    clearForm() {
        document.getElementById('expenseForm').reset();
        this.setTodayDate();
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    saveToLocalStorage() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }
}

// Global functions for modal controls
function closeBudgetWarning() {
    document.getElementById('budgetWarningModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeEditModal() {
    document.getElementById('editExpenseModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Initialize the application
const expenseTracker = new ExpenseTracker();


// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
