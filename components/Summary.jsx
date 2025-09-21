import React from 'react';

function Summary({ checks }) {
    const now = new Date();

    const upcomingChecks = checks.filter(check => {
        const dueDate = new Date(check.dueDate);
        return !isNaN(dueDate.getTime()) && dueDate > now;
    });
    const pastDueChecks = checks.filter(check => {
        const dueDate = new Date(check.dueDate);
        return !isNaN(dueDate.getTime()) && dueDate <= now;
    });

    const upcomingTotal = upcomingChecks.reduce((sum, check) => sum + check.amount, 0);
    const pastDueTotal = pastDueChecks.reduce((sum, check) => sum + check.amount, 0);

    // Calculate total balance
    const totalBalance = checks.reduce((balance, check) => {
        return check.type === 'Given' ? balance - check.amount : balance + check.amount;
    }, 0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fa-IR', {
            style: 'currency',
            currency: 'IRR'
        }).format(Math.abs(amount));
    };

    const getBalanceLabel = (balance) => {
        if (balance > 0) return 'تراز مثبت (بستانکاری)';
        if (balance < 0) return 'تراز منفی (بدهکاری)';
        return 'تراز صفر';
    };

    return (
        <div className="summary">
            <div className="summary-item">
                <h3>{upcomingChecks.length}</h3>
                <p>چک‌های پیش رو</p>
                <p>مجموع: {formatCurrency(upcomingTotal)}</p>
            </div>
            <div className="summary-item">
                <h3>{pastDueChecks.length}</h3>
                <p>چک‌های سررسید گذشته</p>
                <p>مجموع: {formatCurrency(pastDueTotal)}</p>
            </div>
            <div className={`summary-item balance-item ${totalBalance > 0 ? 'positive' : totalBalance < 0 ? 'negative' : 'zero'}`}>
                <h3>{formatCurrency(totalBalance)}</h3>
                <p>تراز کل</p>
                <p>{getBalanceLabel(totalBalance)}</p>
            </div>
        </div>
    );
}

export default Summary;