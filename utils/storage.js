// Storage utilities for IndexedDB persistence

const DB_NAME = 'checkManagerDB';
const DB_VERSION = 1;
const STORE_NAME = 'checks';

let db = null;

// Initialize IndexedDB
async function initDB() {
    if (db) {
        console.log('[Storage] Reusing existing IndexedDB connection');
        return db;
    }

    console.log(`[Storage] Initializing IndexedDB: ${DB_NAME} v${DB_VERSION}`);

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('[Storage] IndexedDB open failed:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log(`[Storage] IndexedDB opened successfully, version: ${db.version}`);
            console.log(`[Storage] Object stores:`, Array.from(db.objectStoreNames));
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            const oldVersion = event.oldVersion;
            const newVersion = event.newVersion;
            console.log(`[Storage] IndexedDB upgrade needed: ${oldVersion} -> ${newVersion}`);

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                console.log(`[Storage] Creating object store: ${STORE_NAME}`);
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            } else {
                console.log(`[Storage] Object store ${STORE_NAME} already exists`);
            }
        };

        request.onblocked = () => {
            console.warn('[Storage] IndexedDB open blocked');
        };
    });
}

export async function loadChecks() {
    console.log('[Storage] Starting loadChecks from IndexedDB');
    try {
        const database = await initDB();
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                let checks = request.result || [];
                console.log(`[Storage] Loaded ${checks.length} checks from IndexedDB`);

                // If no data loaded but migration was done, try backup
                if (checks.length === 0 && localStorage.getItem('checkManager_migration_done') === 'true') {
                    console.log('[Storage] No data in IndexedDB after migration, checking backup');
                    const backupData = localStorage.getItem('checkManager_backup_pre_migration');
                    if (backupData) {
                        try {
                            checks = JSON.parse(backupData);
                            console.log(`[Storage] Restored ${checks.length} checks from backup`);
                        } catch (backupError) {
                            console.error('[Storage] Failed to parse backup data:', backupError);
                        }
                    }
                }

                // Normalize date formats for backward compatibility
                checks = checks.map(check => ({
                    ...check,
                    dueDate: normalizeDate(check.dueDate),
                    receiveDate: check.receiveDate ? normalizeDate(check.receiveDate) : null
                }));
                console.log('[Storage] Normalized dates for checks');
                resolve(checks);
            };
            request.onerror = () => {
                console.error('[Storage] IndexedDB load request failed:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('[Storage] Error loading checks from IndexedDB:', error);
        // Try fallback from localStorage
        console.log('[Storage] Attempting fallback load from localStorage');
        try {
            const fallbackData = localStorage.getItem('checkManager_checks_fallback');
            if (fallbackData) {
                const checks = JSON.parse(fallbackData);
                console.log(`[Storage] Loaded ${checks.length} checks from localStorage fallback`);
                return checks.map(check => ({
                    ...check,
                    dueDate: normalizeDate(check.dueDate),
                    receiveDate: check.receiveDate ? normalizeDate(check.receiveDate) : null
                }));
            } else {
                console.log('[Storage] No fallback data found in localStorage');
            }
        } catch (fallbackError) {
            console.error('[Storage] Fallback load from localStorage also failed:', fallbackError);
        }
        console.log('[Storage] Returning empty array');
        return [];
    }
}

export async function saveChecks(checks) {
    console.log(`[Storage] Starting saveChecks with ${checks.length} checks`);
    try {
        const database = await initDB();
        console.log('[Storage] IndexedDB initialized for save');
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // Get current data count before clearing
        const currentCount = await new Promise((resolve) => {
            const countRequest = store.count();
            countRequest.onsuccess = () => {
                console.log(`[Storage] Current data count in IndexedDB: ${countRequest.result}`);
                resolve(countRequest.result);
            };
            countRequest.onerror = () => resolve(0);
        });

        // Prevent clearing if we're saving empty data and there's existing data
        if (checks.length === 0 && currentCount > 0) {
            console.warn(`[Storage] Refusing to clear ${currentCount} existing checks with empty save data`);
            return; // Don't save empty data over existing data
        }

        // Clear existing data
        console.log('[Storage] Clearing existing IndexedDB data');
        await new Promise((resolve, reject) => {
            const clearRequest = store.clear();
            clearRequest.onsuccess = () => {
                console.log('[Storage] Successfully cleared existing data');
                resolve();
            };
            clearRequest.onerror = () => {
                console.error('[Storage] Failed to clear existing data:', clearRequest.error);
                reject(clearRequest.error);
            };
        });

        // Add all checks
        if (checks.length > 0) {
            console.log('[Storage] Adding all checks to IndexedDB');
            const promises = checks.map((check, index) =>
                new Promise((resolve, reject) => {
                    const request = store.add(check);
                    request.onsuccess = () => {
                        console.log(`[Storage] Added check ${index + 1}/${checks.length}: ${check.id}`);
                        resolve();
                    };
                    request.onerror = () => {
                        console.error(`[Storage] Failed to add check ${index + 1}:`, request.error);
                        reject(request.error);
                    };
                })
            );

            await Promise.all(promises);
            console.log('[Storage] Successfully saved all checks to IndexedDB');
        } else {
            console.log('[Storage] No checks to save (empty array)');
        }
    } catch (error) {
        console.error('[Storage] Error saving checks to IndexedDB:', error);
        // Fallback to localStorage
        console.log('[Storage] Attempting fallback save to localStorage');
        try {
            const dataToSave = JSON.stringify(checks);
            localStorage.setItem('checkManager_checks_fallback', dataToSave);
            console.log('[Storage] Successfully saved to localStorage fallback');
        } catch (fallbackError) {
            console.error('[Storage] Fallback to localStorage also failed:', fallbackError);
        }
    }
}

export async function migrateFromLocalStorage() {
    const STORAGE_KEY = 'checkManager_checks';
    const FALLBACK_KEY = 'checkManager_checks_fallback';
    console.log('[Storage] Starting migration from localStorage');

    // Check if migration already completed
    if (localStorage.getItem('checkManager_migration_done') === 'true') {
        console.log('[Storage] Migration already completed, skipping');
        return;
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const checks = JSON.parse(stored);
            console.log(`[Storage] Found ${checks.length} checks in old localStorage`);
            if (checks.length > 0) {
                // Save a backup before migration
                console.log('[Storage] Creating backup before migration');
                localStorage.setItem('checkManager_backup_pre_migration', stored);

                await saveChecks(checks);
                console.log('[Storage] Migration to IndexedDB successful');

                // Keep backup for safety, only remove if load succeeds later
                // For now, just mark migration as done but preserve backup
                localStorage.setItem('checkManager_migration_done', 'true');
                console.log('[Storage] Migration completed, backup preserved');
            } else {
                console.log('[Storage] No data to migrate');
                localStorage.setItem('checkManager_migration_done', 'true');
            }
        } else {
            console.log('[Storage] No old localStorage data found');
            localStorage.setItem('checkManager_migration_done', 'true');
        }
    } catch (error) {
        console.error('[Storage] Error migrating data from localStorage:', error);
    }
}

export async function verifyMigrationAndCleanup() {
    console.log('[Storage] Verifying migration success and cleaning up');
    try {
        const database = await initDB();
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        return new Promise((resolve) => {
            request.onsuccess = () => {
                const checks = request.result || [];
                console.log(`[Storage] Verification: Found ${checks.length} checks in IndexedDB`);

                if (checks.length > 0 && localStorage.getItem('checkManager_migration_done') === 'true') {
                    console.log('[Storage] Migration verified successful, cleaning up old data');
                    localStorage.removeItem('checkManager_checks');
                    localStorage.removeItem('checkManager_checks_fallback');
                    localStorage.removeItem('checkManager_backup_pre_migration');
                    localStorage.removeItem('checkManager_migration_done');
                    console.log('[Storage] Cleanup completed');
                } else if (checks.length === 0 && localStorage.getItem('checkManager_backup_pre_migration')) {
                    console.log('[Storage] Migration may have failed, keeping backup');
                }
                resolve(checks.length > 0);
            };
            request.onerror = () => {
                console.error('[Storage] Verification failed:', request.error);
                resolve(false);
            };
        });
    } catch (error) {
        console.error('[Storage] Error during verification:', error);
        return false;
    }
}

export async function exportChecksToJSON(checks) {
    console.log(`[Storage] Exporting ${checks.length} checks to JSON`);
    try {
        const dataStr = JSON.stringify(checks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `check-manager-backup-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        console.log(`[Storage] Successfully exported checks to ${exportFileDefaultName}`);
        return true;
    } catch (error) {
        console.error('[Storage] Error exporting checks:', error);
        return false;
    }
}

function persianToGregorian(persianDate) {
    // Basic Persian to Gregorian conversion
    // This is an approximation; for production, use a proper library
    const [year, month, day] = persianDate.split('-').map(Number);
    const gregorianYear = year + 621;
    const gregorianMonth = month;
    const gregorianDay = day;

    // Adjust for month differences (simplified)
    if (month > 6) {
        return `${gregorianYear}-${gregorianMonth.toString().padStart(2, '0')}-${gregorianDay.toString().padStart(2, '0')}`;
    } else {
        const adjustedYear = gregorianYear - 1;
        const adjustedMonth = gregorianMonth + 6;
        return `${adjustedYear}-${adjustedMonth.toString().padStart(2, '0')}-${gregorianDay.toString().padStart(2, '0')}`;
    }
}

function gregorianToPersian(gregorianDate) {
    // Basic Gregorian to Persian conversion
    const [year, month, day] = gregorianDate.split('-').map(Number);
    const persianYear = year - 621;
    const persianMonth = month;
    const persianDay = day;

    // Adjust for month differences (simplified)
    if (month > 6) {
        const adjustedYear = persianYear + 1;
        const adjustedMonth = persianMonth - 6;
        return `${adjustedYear}-${adjustedMonth.toString().padStart(2, '0')}-${persianDay.toString().padStart(2, '0')}`;
    } else {
        return `${persianYear}-${persianMonth.toString().padStart(2, '0')}-${persianDay.toString().padStart(2, '0')}`;
    }
}

function normalizeDate(dateValue) {
    if (typeof dateValue === 'string') {
        // If it's already Gregorian (year > 1300), return as is
        const year = parseInt(dateValue.split('-')[0]);
        if (year > 1300) {
            return dateValue;
        }
        // Old Persian dates with year < 1300 (unlikely), or if Persian, convert
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue) && year >= 1300) {
            // Wait, if year >=1300, it's Gregorian, so return as is
            return dateValue;
        }
        // For very old dates or other formats, return as is
        return dateValue;
    }
    if (dateValue && typeof dateValue === 'object' && dateValue.value) {
        // Handle {value: "2025-10-21T10:07:29.000Z"} format
        return dateValue.value.split('T')[0];
    }
    return dateValue;
}

// Function to generate unique check number
export function generateUniqueCheckNumber(existingChecks) {
    let number;
    do {
        number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    } while (existingChecks.some(check => check.checkNumber === number));
    return number;
}

// Function to validate check number uniqueness
export function isCheckNumberUnique(number, existingChecks, excludeId = null) {
    return !existingChecks.some(check => check.checkNumber === number && check.id !== excludeId);
}