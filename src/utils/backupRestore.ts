/**
 * Utility functions for exporting and importing full application state from localStorage
 */

export interface SystemBackupData {
  metadata: {
    appName: string;
    exportTimestamp: string;
    exportedBy: {
      name: string;
      username: string;
      role: string;
    };
    version: string;
    keyCount: number;
    estimatedSizeBytes: number;
  };
  localStorageData: Record<string, any>;
}

export function downloadFullSystemBackup(
  appName: string = 'EduManage Portal',
  userName: string = 'Admin User',
  userUsername: string = 'admin',
  userRole: string = 'Administrator'
): { success: boolean; keyCount: number; fileName: string; sizeKB: number } {
  const localStorageData: Record<string, any> = {};

  // Extract all items from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const rawValue = localStorage.getItem(key);
      if (rawValue !== null) {
        try {
          // Store parsed JSON if possible, else raw string
          localStorageData[key] = JSON.parse(rawValue);
        } catch {
          localStorageData[key] = rawValue;
        }
      }
    }
  }

  const jsonString = JSON.stringify(
    {
      metadata: {
        appName,
        exportTimestamp: new Date().toISOString(),
        exportedBy: {
          name: userName,
          username: userUsername,
          role: userRole,
        },
        version: '1.0.0',
        keyCount: Object.keys(localStorageData).length,
        estimatedSizeBytes: new Blob([JSON.stringify(localStorageData)]).size,
      },
      localStorageData,
    },
    null,
    2
  );

  const sizeKB = Math.round((new Blob([jsonString]).size / 1024) * 10) / 10;
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const fileName = `${appName.replace(/[^a-zA-Z0-9]/g, '_')}_Full_Backup_${dateStr}_${timeStr}.json`;

  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    keyCount: Object.keys(localStorageData).length,
    fileName,
    sizeKB,
  };
}

export function getLocalStorageBackupSummary(): {
  totalKeys: number;
  estimatedSizeKB: number;
  edumanageKeys: { key: string; label: string; count?: number }[];
} {
  let totalKeys = localStorage.length;
  let totalBytes = 0;
  const edumanageKeys: { key: string; label: string; count?: number }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key) || '';
      totalBytes += key.length + val.length;

      if (key.startsWith('edumanage_')) {
        const cleanKey = key.replace('edumanage_', '');
        let count: number | undefined = undefined;
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            count = parsed.length;
          }
        } catch {
          // Not array
        }

        let label = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1);
        if (cleanKey === 'appName') label = 'Application Title';
        else if (cleanKey === 'currentUser') label = 'Active Session User';
        else if (cleanKey === 'schoolLogo') label = 'Custom School Branding';
        else if (cleanKey === 'attendance') label = 'Attendance Logs';
        else if (cleanKey === 'gradeScale') label = 'Grading Scale Config';
        else if (cleanKey === 'academicYears') label = 'Academic Terms & Years';
        else if (cleanKey === 'activityLogs') label = 'Audit Trail Activity Logs';

        edumanageKeys.push({ key, label, count });
      }
    }
  }

  return {
    totalKeys,
    estimatedSizeKB: Math.round((totalBytes / 1024) * 10) / 10,
    edumanageKeys,
  };
}

export function restoreSystemBackup(
  jsonText: string
): { success: boolean; keysRestored: number; message: string } {
  try {
    const parsed = JSON.parse(jsonText);
    const dataObj = parsed.localStorageData || parsed;

    if (!dataObj || typeof dataObj !== 'object') {
      return { success: false, keysRestored: 0, message: 'Invalid JSON backup format' };
    }

    let restoredCount = 0;
    Object.entries(dataObj).forEach(([key, val]) => {
      const valString = typeof val === 'string' ? val : JSON.stringify(val);
      localStorage.setItem(key, valString);
      restoredCount++;
    });

    return {
      success: true,
      keysRestored: restoredCount,
      message: `Successfully restored ${restoredCount} storage records from JSON backup file.`,
    };
  } catch (err: any) {
    return { success: false, keysRestored: 0, message: err.message || 'Error parsing backup JSON file' };
  }
}
