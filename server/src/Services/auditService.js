const AuditLog = require('../Models/AuditLog');

/**
 * Creates a new audit log record.
 * 
 * @param {Object} params
 * @param {string} params.complaintId - The ID of the affected complaint
 * @param {string} params.performedBy - The user ID who performed the action
 * @param {string} params.action - Action name (e.g., 'CREATE', 'STATUS_CHANGE')
 * @param {string} [params.oldValue] - Value before the change
 * @param {string} [params.newValue] - Value after the change
 * @param {string} [params.notes] - Additional contextual remarks
 * @returns {Promise<Object|null>} - Saved audit log or null on error
 */
const logAction = async ({ complaintId, performedBy, action, oldValue = null, newValue = null, notes = '' }) => {
  try {
    const auditEntry = new AuditLog({
      complaintId,
      performedBy,
      action,
      oldValue: oldValue ? String(oldValue) : null,
      newValue: newValue ? String(newValue) : null,
      notes
    });
    await auditEntry.save();
    return auditEntry;
  } catch (error) {
    console.error('Failed to save audit log:', error);
    return null;
  }
};

module.exports = { logAction };
