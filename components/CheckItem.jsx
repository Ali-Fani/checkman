import React from 'react';

function CheckItem({ check, onEdit, onDelete }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'تنظیم نشده';
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fa-IR', {
            style: 'currency',
            currency: 'IRR'
        }).format(amount);
    };

    return (
        <div className="check-item">
            <div className="check-details">
                <div className="check-amount">{formatCurrency(check.amount)}</div>
                <div><strong>نوع:</strong> {check.type === 'Given' ? 'پرداختی' : 'دریافتی'}</div>
                <div><strong>تاریخ سررسید:</strong> {formatDate(check.dueDate)}</div>
                <div><strong>تاریخ دریافت:</strong> {formatDate(check.receiveDate)}</div>
                <div><strong>طرف حساب:</strong> {check.counterparty}</div>
                <div><strong>بانک:</strong> {check.bank}</div>
                <div><strong>شماره چک:</strong> {check.checkNumber}</div>
            </div>
            <div className="check-actions">
                <button
                    className="btn btn-secondary"
                    onClick={() => onEdit(check)}
                >
                    ویرایش
                </button>
                <button
                    className="btn btn-danger"
                    onClick={() => {
                        if (window.confirm('آیا مطمئن هستید که می‌خواهید این چک را حذف کنید؟')) {
                            onDelete(check.id);
                        }
                    }}
                >
                    حذف
                </button>
            </div>
        </div>
    );
}

export default CheckItem;