import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './components/Dashboard.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { ThemeProvider } from './utils/theme.jsx';
import { ToastProvider } from './components/ToastContainer.jsx';
import { loadChecks, saveChecks, migrateFromLocalStorage, verifyMigrationAndCleanup } from './utils/storage.js';
import { registerSW } from 'virtual:pwa-register';
import { requestNotificationPermission, scheduleReminders } from './utils/notifications.js';

function App() {
    const [checks, setChecks] = useState([]);
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [updateSW, setUpdateSW] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            console.log('[App] Starting data load process');
            // First, migrate any existing localStorage data to IndexedDB
            console.log('[App] Running migration from localStorage');
            await migrateFromLocalStorage();

            console.log('[App] Loading checks from storage');
            const loadedChecks = await loadChecks();
            console.log(`[App] Loaded ${loadedChecks.length} checks, setting state`);
            setChecks(loadedChecks);

            // Verify migration success and cleanup if needed
            console.log('[App] Verifying migration and cleaning up');
            await verifyMigrationAndCleanup();

            // Request notification permission and schedule reminders
            console.log('[App] Setting up notifications');
            requestNotificationPermission();
            scheduleReminders(loadedChecks);
            console.log('[App] Data load process completed');
        };

        loadData();
    }, []);

    useEffect(() => {
        const saveData = async () => {
            console.log(`[App] Saving ${checks.length} checks to storage`);
            await saveChecks(checks);
            console.log('[App] Save operation completed');
        };
        saveData();
    }, [checks]);

    useEffect(() => {
        const updateSWInstance = registerSW({
            onNeedRefresh() {
                setShowUpdatePopup(true);
                setUpdateSW(() => updateSWInstance);
            },
            onOfflineReady() {
                console.log('App ready to work offline');
            },
        });
    }, []);

    const addCheck = (newCheck) => {
        // Validate dueDate
        if (!newCheck.dueDate || newCheck.dueDate === '' || isNaN(new Date(newCheck.dueDate).getTime())) {
            console.error('Invalid dueDate for new check:', newCheck.dueDate);
            alert('تاریخ سررسید نامعتبر است');
            return;
        }
        const updatedChecks = [...checks, { ...newCheck, id: Date.now().toString() }];
        setChecks(updatedChecks);
        // Reschedule notifications for the new check
        scheduleReminders(updatedChecks);
    };

    const updateCheck = (updatedCheck) => {
        setChecks(checks.map(check => check.id === updatedCheck.id ? updatedCheck : check));
    };

    const deleteCheck = (id) => {
        setChecks(checks.filter(check => check.id !== id));
    };

    const handleUpdateNow = () => {
        if (updateSW) {
            updateSW(true);
        }
        setShowUpdatePopup(false);
    };

    const handleUpdateLater = () => {
        setShowUpdatePopup(false);
    };

    return (
        <div className="app">
            <ThemeToggle />
            <h1>مدیریت چک</h1>
            <Dashboard
                checks={checks}
                addCheck={addCheck}
                updateCheck={updateCheck}
                deleteCheck={deleteCheck}
            />
            <footer className="app-footer">
                <div className="version-info">
                    نسخه ۱.۱.۰ - مدیریت چک
                </div>
            </footer>

            {showUpdatePopup && (
                <div className="update-popup-overlay">
                    <div className="update-popup">
                        <h3>به‌روزرسانی موجود است</h3>
                        <p>نسخه جدیدی از برنامه موجود است. آیا می‌خواهید اکنون به‌روزرسانی کنید؟</p>
                        <div className="update-popup-buttons">
                            <button onClick={handleUpdateNow} className="update-now-btn">
                                به‌روزرسانی کن
                            </button>
                            <button onClick={handleUpdateLater} className="update-later-btn">
                                بعداً
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <ThemeProvider>
        <ToastProvider>
            <App />
        </ToastProvider>
    </ThemeProvider>
);