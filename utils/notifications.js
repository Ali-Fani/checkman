// Notification utilities for check reminders

export function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            return true;
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                }
            });
        }
    }
    return false;
}

export function scheduleReminders(checks) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const now = new Date();

    checks.forEach(check => {
        const dueDate = new Date(check.dueDate);

        // Schedule 3 notifications: 3 days before, 1 day before, and on due date
        const reminderTimes = [
            { days: 3, message: '۳ روز تا سررسید چک' },
            { days: 1, message: '۱ روز تا سررسید چک' },
            { days: 0, message: 'چک امروز سررسید می‌شود' }
        ];

        reminderTimes.forEach(reminder => {
            const reminderDate = new Date(dueDate.getTime() - (reminder.days * 24 * 60 * 60 * 1000));

            if (reminderDate > now) {
                const timeUntilReminder = reminderDate - now;

                // Schedule notification
                setTimeout(() => {
                    showNotification(check, reminder.message);
                }, Math.max(1000, timeUntilReminder));
            }
        });
    });
}

function showNotification(check, message = 'یادآور سررسید چک') {
    const options = {
        body: `${message}\nچک شماره ${check.checkNumber} - ${new Date(check.dueDate).toLocaleDateString('fa-IR')}\nمبلغ: ${check.amount.toLocaleString('fa-IR')} تومان`,
        icon: '/pwa-192x192.png', // Use PWA icon
        badge: '/pwa-192x192.png',
        tag: `check-${check.id}`, // Unique tag to prevent duplicate notifications
        requireInteraction: true, // Keep notification until user interacts
        silent: false
    };

    const notification = new Notification('مدیریت چک', options);

    notification.onclick = () => {
        window.focus();
        notification.close();
    };

    // Auto close after 10 seconds for reminders, 30 seconds for due date
    const isDueToday = new Date(check.dueDate).toDateString() === new Date().toDateString();
    const timeout = isDueToday ? 30000 : 10000;

    setTimeout(() => {
        notification.close();
    }, timeout);
}