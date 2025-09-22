import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from './Button.jsx';
import { SkeletonTable } from './Skeleton.jsx';

function CheckList({ checks, onEdit, onDelete, loading = false }) {
    const [sortBy, setSortBy] = useState('dueDate');
    const [filterType, setFilterType] = useState('all');

    const sortedAndFilteredChecksWithBalance = useMemo(() => {
        let filtered = checks;

        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(check => check.type === filterType);
        }

        // Apply sort
        filtered.sort((a, b) => {
            if (sortBy === 'dueDate') {
                const aDate = new Date(a.dueDate);
                const bDate = new Date(b.dueDate);
                const aValid = !isNaN(aDate.getTime());
                const bValid = !isNaN(bDate.getTime());
                if (!aValid && !bValid) return 0;
                if (!aValid) return 1;
                if (!bValid) return -1;
                return aDate - bDate;
            } else if (sortBy === 'amount') {
                return b.amount - a.amount;
            } else if (sortBy === 'type') {
                return a.type.localeCompare(b.type);
            } else if (sortBy === 'balance') {
                // For balance sorting, we'll calculate balance and sort by it
                return 0; // Will be handled after balance calculation
            }
            return 0;
        });

        // Calculate running balance
        let runningBalance = 0;
        const checksWithBalance = filtered.map(check => {
            const amount = check.amount;
            if (check.type === 'Given') {
                runningBalance -= amount;
            } else if (check.type === 'Taken') {
                runningBalance += amount;
            }

            return {
                ...check,
                balance: runningBalance
            };
        });

        // If sorting by balance, sort again after balance calculation
        if (sortBy === 'balance') {
            checksWithBalance.sort((a, b) => b.balance - a.balance);
        }

        // Calculate totals
        const totals = {
            given: 0,
            taken: 0,
            total: 0
        };

        checksWithBalance.forEach(check => {
            if (check.type === 'Given') {
                totals.given += check.amount;
            } else if (check.type === 'Taken') {
                totals.taken += check.amount;
            }
            totals.total += check.amount;
        });

        return { checks: checksWithBalance, totals };
    }, [checks, sortBy, filterType]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fa-IR', {
            style: 'currency',
            currency: 'IRR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'تنظیم نشده';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'تاریخ نامعتبر';
        return date.toLocaleDateString('fa-IR');
    };

    const getBalanceClass = (balance) => {
        if (balance > 0) return 'positive-balance';
        if (balance < 0) return 'negative-balance';
        return 'zero-balance';
    };

    return (
        <div className="check-list">
            <div className="list-controls" style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                    <label htmlFor="sortBy">مرتب‌سازی بر اساس:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ marginLeft: '10px' }}
                    >
                        <option value="dueDate">تاریخ سررسید</option>
                        <option value="amount">مبلغ</option>
                        <option value="type">نوع</option>
                        <option value="balance">تراز</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="filterType">فیلتر بر اساس نوع:</label>
                    <select
                        id="filterType"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ marginLeft: '10px' }}
                    >
                        <option value="all">همه</option>
                        <option value="Given">پرداختی</option>
                        <option value="Taken">دریافتی</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="check-grid-container">
                    <SkeletonTable rows={5} columns={10} />
                </div>
            ) : sortedAndFilteredChecksWithBalance.checks.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    هیچ چکی یافت نشد.
                </p>
            ) : (
                <div className="check-grid-container">
                    <table className="check-grid">
                        <thead>
                            <tr>
                                <th>شماره ردیف</th>
                                <th>نوع</th>
                                <th>مبلغ</th>
                                <th>تاریخ سررسید</th>
                                <th>تاریخ دریافت</th>
                                <th>طرف حساب</th>
                                <th>بانک</th>
                                <th>شماره چک</th>
                                <th>تراز</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
<motion.tbody
    initial="hidden"
    animate="visible"
    variants={{
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.05 }
        }
    }}
>
    <AnimatePresence>
        {sortedAndFilteredChecksWithBalance.checks.map((check, index) => (
            <motion.tr
                key={check.id}
                layoutId={check.id}
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
            <td className="row-number">{index + 1}</td>
            <td>{check.type === 'Given' ? 'پرداختی' : 'دریافتی'}</td>
            <td>
                {formatCurrency(check.amount)}
                {check.type === 'Given' ? ' (پرداختی)' : ' (دریافتی)'}
            </td>
            <td>{formatDate(check.dueDate)}</td>
            <td>{formatDate(check.receiveDate)}</td>
            <td>{check.counterparty}</td>
            <td>{check.bank}</td>
            <td>{check.checkNumber}</td>
            <td className={getBalanceClass(check.balance)}>
                {formatCurrency(Math.abs(check.balance))}
                {check.balance > 0 ? ' (بستانکار)' : check.balance < 0 ? ' (بدهکار)' : ' (متعادل)'}
            </td>
            <td>
                <div className="grid-actions">
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => onEdit(check)}
                    >
                        ویرایش
                    </Button>
                    <Button
                        variant="danger"
                        size="small"
                        onClick={() => {
                            if (window.confirm('آیا مطمئن هستید که می‌خواهید این چک را حذف کنید؟')) {
                                onDelete(check.id);
                            }
                        }}
                    >
                        حذف
                    </Button>
                </div>
            </td>
        </motion.tr>
        ))}

        {/* Total Row */}
        {sortedAndFilteredChecksWithBalance.checks.length > 0 && (
            <motion.tr
                key="totals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                style={{
                    backgroundColor: 'var(--background-light)',
                    fontWeight: 'bold',
                    borderTop: '2px solid var(--primary-blue)'
                }}
            >
                <td style={{ fontWeight: 'bold', color: 'var(--primary-blue)' }}>جمع کل</td>
                <td></td>
                <td>
                    {formatCurrency(sortedAndFilteredChecksWithBalance.totals.total)}
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className={getBalanceClass(sortedAndFilteredChecksWithBalance.totals.total - sortedAndFilteredChecksWithBalance.totals.given)}>
                    {formatCurrency(Math.abs(sortedAndFilteredChecksWithBalance.totals.total - sortedAndFilteredChecksWithBalance.totals.given))}
                    {sortedAndFilteredChecksWithBalance.totals.total - sortedAndFilteredChecksWithBalance.totals.given > 0 ?
                        ' (بستانکار)' : sortedAndFilteredChecksWithBalance.totals.total - sortedAndFilteredChecksWithBalance.totals.given < 0 ?
                        ' (بدهکار)' : ' (متعادل)'}
                </td>
                <td></td>
            </motion.tr>
        )}
    </AnimatePresence>
</motion.tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CheckList;