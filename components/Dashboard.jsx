import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CheckList from './CheckList.jsx';
import CheckForm from './CheckForm.jsx';
import Summary from './Summary.jsx';
import { requestNotificationPermission, scheduleReminders } from '../utils/notifications.js';
import { exportChecksToJSON } from '../utils/storage.js';

function Dashboard({ checks, addCheck, updateCheck, deleteCheck }) {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [editingCheck, setEditingCheck] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Request notification permission on mount
        requestNotificationPermission();
        // Schedule reminders for upcoming checks
        scheduleReminders(checks);
    }, [checks]);

    const upcomingChecks = checks.filter(check => {
        const dueDate = new Date(check.dueDate);
        return !isNaN(dueDate.getTime()) && dueDate > new Date();
    });
    const pastDueChecks = checks.filter(check => {
        const dueDate = new Date(check.dueDate);
        return !isNaN(dueDate.getTime()) && dueDate <= new Date();
    });

    const handleEdit = (check) => {
        setEditingCheck(check);
    };

    const handleFormSubmit = async (checkData) => {
        setLoading(true);
        try {
            if (editingCheck) {
                updateCheck({ ...checkData, id: editingCheck.id });
                setEditingCheck(null);
            } else {
                addCheck(checkData);
            }
            // Simulate a brief loading delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300));
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingCheck(null);
    };

    const handleBackup = async () => {
        const success = await exportChecksToJSON(checks);
        if (success) {
            alert('پشتیبان‌گیری با موفقیت انجام شد');
        } else {
            alert('خطا در پشتیبان‌گیری');
        }
    };

    return (
        <div className="dashboard">
            <Summary checks={checks} />

            <CheckForm
                onSubmit={handleFormSubmit}
                editingCheck={editingCheck}
                onCancel={handleCancelEdit}
                existingChecks={checks}
            />

            <div className="tabs">
                <motion.button
                    className={`tab ${activeTab === 'past-due' ? 'active' : ''}`}
                    onClick={() => setActiveTab('past-due')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    چک‌های سررسید گذشته ({pastDueChecks.length})
                </motion.button>
                <motion.button
                    className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    چک‌های پیش رو ({upcomingChecks.length})
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'past-due' && (
                    <motion.div
                        key="past-due"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CheckList
                            checks={pastDueChecks}
                            onEdit={handleEdit}
                            onDelete={deleteCheck}
                            loading={loading}
                        />
                    </motion.div>
                )}
                {activeTab === 'upcoming' && (
                    <motion.div
                        key="upcoming"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CheckList
                            checks={upcomingChecks}
                            onEdit={handleEdit}
                            onDelete={deleteCheck}
                            loading={loading}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="dashboard-actions">
                <motion.button
                    className="backup-btn"
                    onClick={handleBackup}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    📦 پشتیبان‌گیری
                </motion.button>
            </div>
        </div>
    );
}

export default Dashboard;