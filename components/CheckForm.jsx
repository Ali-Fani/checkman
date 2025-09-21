import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { isCheckNumberUnique, generateUniqueCheckNumber } from '../utils/storage.js';
import Button from './Button.jsx';
import { useTheme } from '../utils/theme.jsx';

// Function to convert Gregorian date to Persian
function gregorianToPersian(gregorianDate) {
    if (!gregorianDate) return '';
    const date = new Date(gregorianDate);
    const persianDate = new DateObject({ date, calendar: persian });
    return persianDate.format("YYYY-MM-DD", { digits: 'en' });
}

// Styles will be generated dynamically inside the component


function CheckForm({ onSubmit, editingCheck, onCancel, existingChecks }) {
    const { theme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [formData, setFormData] = useState({
        type: 'Given',
        amount: '',
        dueDate: '',
        receiveDate: '',
        counterparty: '',
        bank: '',
        checkNumber: ''
    });
    const [errors, setErrors] = useState({});

    // Inject custom CSS for react-multi-date-picker input
    useEffect(() => {
        const styleId = 'rmdp-input-styles';
        let styleElement = document.getElementById(styleId);

        if (styleElement) {
            styleElement.remove();
        }

        const customRmdpStyles = `
            .rmdp-input {
                width: 100% !important;
                padding: 12px 16px !important;
                border: 2px solid ${theme === 'dark' ? '#475569' : '#d1d5db'} !important;
                border-radius: 8px !important;
                font-size: 16px !important;
                font-family: 'Vazir', sans-serif !important;
                background: ${theme === 'dark' ? '#1e293b' : '#ffffff'} !important;
                color: ${theme === 'dark' ? '#f1f5f9' : '#1f2937'} !important;
                transition: all 0.3s ease !important;
                direction: rtl !important;
                text-align: right !important;
                height: 48px !important;
                box-sizing: border-box !important;
            }

            .rmdp-input:focus {
                outline: none !important;
                border-color: ${theme === 'dark' ? '#3b82f6' : '#2563eb'} !important;
                box-shadow: 0 0 0 3px ${theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)'} !important;
                background: ${theme === 'dark' ? '#1e293b' : '#ffffff'} !important;
                transform: translateY(-1px) !important;
            }
        `;

        styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = customRmdpStyles;
        document.head.appendChild(styleElement);
    }, [theme]);

    useEffect(() => {
        if (editingCheck) {
            setFormData(editingCheck);
        } else {
            // Generate unique check number for new checks
            const newNumber = generateUniqueCheckNumber(existingChecks);
            setFormData({
                type: 'Given',
                amount: '',
                dueDate: '',
                receiveDate: '',
                counterparty: '',
                bank: '',
                checkNumber: newNumber
            });
        }
    }, [editingCheck, existingChecks]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        // Convert Persian digits to Latin digits for amount field
        if (name === 'amount') {
            processedValue = value.replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'لطفا مبلغ معتبر وارد کنید';
        }

        if (!formData.dueDate) {
            newErrors.dueDate = 'تاریخ سررسید الزامی است';
        }

        if (!formData.counterparty.trim()) {
            newErrors.counterparty = 'طرف حساب الزامی است';
        }

        if (!formData.bank.trim()) {
            newErrors.bank = 'بانک الزامی است';
        }

        if (!formData.checkNumber.trim()) {
            newErrors.checkNumber = 'شماره چک الزامی است';
        } else if (!isCheckNumberUnique(formData.checkNumber, existingChecks, editingCheck?.id)) {
            newErrors.checkNumber = 'شماره چک باید منحصر به فرد باشد';
        }

        const dueDate = new Date(formData.dueDate);
        const receiveDate = formData.receiveDate ? new Date(formData.receiveDate) : null;

        if (receiveDate && receiveDate > dueDate) {
            newErrors.receiveDate = 'تاریخ دریافت نمی‌تواند بعد از تاریخ سررسید باشد';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({
                ...formData,
                amount: parseFloat(formData.amount),
                dueDate: formData.dueDate,
                receiveDate: formData.receiveDate || null
            });
            if (!editingCheck) {
                // Reset form for new entry
                const newNumber = generateUniqueCheckNumber(existingChecks);
                setFormData({
                    type: 'Given',
                    amount: '',
                    dueDate: '',
                    receiveDate: '',
                    counterparty: '',
                    bank: '',
                    checkNumber: newNumber
                });
            }
        }
    };

    const handleCancel = () => {
        onCancel();
        if (!editingCheck) {
            setFormData({
                type: 'Given',
                amount: '',
                dueDate: '',
                receiveDate: '',
                counterparty: '',
                bank: '',
                checkNumber: ''
            });
        }
    };

    return (
        <form className={`check-form ${isCollapsed ? 'collapsed' : ''}`} onSubmit={handleSubmit}>
            <div
                className={`form-header ${isCollapsed ? 'clickable' : ''}`}
                onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
                role={isCollapsed ? 'button' : undefined}
                tabIndex={isCollapsed ? 0 : undefined}
                onKeyDown={isCollapsed ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsCollapsed(false);
                    }
                } : undefined}
                aria-label={isCollapsed ? 'باز کردن فرم افزودن چک' : undefined}
            >
                <h2>{editingCheck ? 'ویرایش چک' : 'افزودن چک جدید'}</h2>
            </div>
            
<AnimatePresence>
    {!isCollapsed && (
        <motion.div
            className="form-fields"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
                hidden: { opacity: 0, height: 0, overflow: 'hidden' },
                visible: {
                    opacity: 1,
                    height: 'auto',
                    transition: { duration: 0.4, staggerChildren: 0.1 }
                }
            }}
        >
            <motion.div className="form-group" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <label htmlFor="type">نوع:</label>
                <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                >
                    <option value="Given">پرداختی</option>
                    <option value="Taken">دریافتی</option>
                </select>
            </motion.div>

            <motion.div className="form-group" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <label htmlFor="amount">مبلغ (تومان):</label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                />
                {errors.amount && <div className="error">{errors.amount}</div>}
                {!errors.amount && formData.amount && parseFloat(formData.amount) > 0 && <div className="success">مبلغ معتبر است</div>}
            </motion.div>

            <div className="date-inputs-row">
                <motion.div className="form-group" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <label>تاریخ سررسید:</label>
                    <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={gregorianToPersian(formData.dueDate)}
                        onChange={(date) => {
                            const value = date ? date.toDate().toISOString().split('T')[0] : '';
                            handleChange({ target: { name: 'dueDate', value } });
                        }}
                        placeholder="انتخاب تاریخ سررسید"
                        className="rmdp-datepicker"
                    />
                    {errors.dueDate && <div className="error">{errors.dueDate}</div>}
                    {!errors.dueDate && formData.dueDate && <div className="success">تاریخ سررسید انتخاب شد</div>}
                </motion.div>

                <motion.div className="form-group" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <label>تاریخ دریافت (اختیاری):</label>
                    <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={gregorianToPersian(formData.receiveDate)}
                        onChange={(date) => {
                            const value = date ? date.toDate().toISOString().split('T')[0] : '';
                            handleChange({ target: { name: 'receiveDate', value } });
                        }}
                        placeholder="انتخاب تاریخ دریافت"
                        className="rmdp-datepicker"
                    />
                    {errors.receiveDate && <div className="error">{errors.receiveDate}</div>}
                    {!errors.receiveDate && formData.receiveDate && <div className="success">تاریخ دریافت انتخاب شد</div>}
                </motion.div>
            </div>

            <motion.div className="form-group" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <label htmlFor="counterparty">طرف حساب:</label>
                <input
                    type="text"
                    id="counterparty"
                    name="counterparty"
                    value={formData.counterparty}
                    onChange={handleChange}
                />
                {errors.counterparty && <div className="error">{errors.counterparty}</div>}
                {!errors.counterparty && formData.counterparty.trim() && <div className="success">طرف حساب انتخاب شد</div>}
            </motion.div>

            <motion.div className="form-group" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <label htmlFor="bank">بانک:</label>
                <input
                    type="text"
                    id="bank"
                    name="bank"
                    value={formData.bank}
                    onChange={handleChange}
                />
                {errors.bank && <div className="error">{errors.bank}</div>}
                {!errors.bank && formData.bank.trim() && <div className="success">بانک انتخاب شد</div>}
            </motion.div>

            <motion.div className="form-group" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <label htmlFor="checkNumber">شماره چک:</label>
                <input
                    type="text"
                    id="checkNumber"
                    name="checkNumber"
                    value={formData.checkNumber}
                    onChange={handleChange}
                />
                {errors.checkNumber && <div className="error">{errors.checkNumber}</div>}
                {!errors.checkNumber && formData.checkNumber.trim() && <div className="success">شماره چک معتبر است</div>}
            </motion.div>

            <motion.div className="form-buttons" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <Button type="submit" variant="primary" size="large">
                    {editingCheck ? 'به‌روزرسانی چک' : 'افزودن چک'}
                </Button>
                {editingCheck && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="large"
                        onClick={handleCancel}
                    >
                        لغو
                    </Button>
                )}
                <Button
                    type="button"
                    variant="secondary"
                    size="large"
                    onClick={() => setIsCollapsed(true)}
                >
                    بستن
                </Button>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>
        </form>
    );
}

export default CheckForm;