// Central Transaction Registry to prevent re-validation & duplicate reuse of completed Transaction IDs / UTRs

const STORAGE_KEY = 'vpm_completed_transaction_ids';

// Initial pre-registered sample completed transaction IDs (simulating existing records in database/ledger)
const DEFAULT_COMPLETED_IDS = [
  '123456789012',
  '987654321098',
  '423910293841',
  'PAY_VPM_N9X2K1L8',
  'TXN-8829104',
  'TXN-9912034',
  'TXN-99881122'
];

/**
 * Normalizes a transaction ID for clean comparison.
 * Extracts digits if present, and returns both clean digits and normalized raw string.
 */
export function normalizeTxnId(rawId: string): { cleanDigits: string; normalizedRaw: string } {
  if (!rawId) return { cleanDigits: '', normalizedRaw: '' };
  const trimmed = rawId.trim().toUpperCase();
  const digitsOnly = trimmed.replace(/\D/g, '');
  return {
    cleanDigits: digitsOnly,
    normalizedRaw: trimmed
  };
}

/**
 * Gets the set of all completed transaction IDs from localStorage + default list.
 */
export function getCompletedTransactionIds(): Set<string> {
  const set = new Set<string>();
  DEFAULT_COMPLETED_IDS.forEach(id => {
    const { cleanDigits, normalizedRaw } = normalizeTxnId(id);
    if (cleanDigits) set.add(cleanDigits);
    if (normalizedRaw) set.add(normalizedRaw);
  });

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: string[] = JSON.parse(stored);
      parsed.forEach(id => {
        const { cleanDigits, normalizedRaw } = normalizeTxnId(id);
        if (cleanDigits) set.add(cleanDigits);
        if (normalizedRaw) set.add(normalizedRaw);
      });
    }
  } catch (e) {
    console.error('Failed to load completed transaction IDs from storage:', e);
  }

  return set;
}

/**
 * Checks if a transaction ID / UTR has ALREADY been used and completed in a previous transaction.
 */
export function isTransactionIdAlreadyUsed(rawTxnId: string): boolean {
  if (!rawTxnId || !rawTxnId.trim()) return false;
  const completedSet = getCompletedTransactionIds();
  const { cleanDigits, normalizedRaw } = normalizeTxnId(rawTxnId);

  // Check if 12-digit UTR exists in completed set
  if (cleanDigits.length === 12 && completedSet.has(cleanDigits)) {
    return true;
  }

  // Check if normalized raw string exists in completed set
  if (normalizedRaw && completedSet.has(normalizedRaw)) {
    return true;
  }

  return false;
}

/**
 * Registers a transaction ID / UTR as COMPLETED once payment/booking is successfully completed.
 */
export function registerCompletedTransactionId(rawTxnId: string): void {
  if (!rawTxnId || !rawTxnId.trim()) return;
  const { cleanDigits, normalizedRaw } = normalizeTxnId(rawTxnId);
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let list: string[] = stored ? JSON.parse(stored) : [];
    
    if (cleanDigits && !list.includes(cleanDigits)) {
      list.push(cleanDigits);
    }
    if (normalizedRaw && !list.includes(normalizedRaw)) {
      list.push(normalizedRaw);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to register completed transaction ID:', e);
  }
}
