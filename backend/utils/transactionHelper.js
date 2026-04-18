/**
 * Session/Transaction helper.
 * 
 * MongoDB transactions REQUIRE a replica set. On a standalone instance
 * (typical local dev), sessions still work but transactions throw:
 * "Transaction numbers are only allowed on a replica set member or mongos"
 *
 * This module provides a resilient wrapper that:
 * - Uses full ACID transactions when running on a replica set
 * - Falls back to non-transactional (but still sequential) operations on standalone
 *
 * In production (Atlas or replica set), set MONGODB_REPLICA_SET=true in .env
 */

const mongoose = require('mongoose');

/**
 * Detect at runtime if the connected MongoDB supports transactions.
 * Cached after first check.
 */
let _supportsTransactions = null;

async function supportsTransactions() {
  if (_supportsTransactions !== null) return _supportsTransactions;
  try {
    const admin = mongoose.connection.db.admin();
    const info = await admin.serverInfo();
    // Replica set members and mongos show up in topology description
    const topology = mongoose.connection.client.topology;
    const isReplicaSet = topology && (
      topology.description?.type === 'ReplicaSetWithPrimary' ||
      topology.description?.type === 'ReplicaSetNoPrimary' ||
      topology.description?.type === 'Sharded'
    );
    _supportsTransactions = !!isReplicaSet;
    if (!_supportsTransactions) {
      console.warn('[TimberTrack] ⚠ Standalone MongoDB detected — transactions disabled. ' +
        'Set MONGODB_REPLICA_SET=true and use a replica set for production.');
    }
  } catch {
    _supportsTransactions = false;
  }
  return _supportsTransactions;
}

/**
 * Run an async function with a session.
 * On replica set: wraps in a real transaction (atomic).
 * On standalone: runs without a transaction (no session).
 *
 * @param {Function} fn - async (session) => result
 * @returns result of fn
 */
async function withTransaction(fn) {
  const hasTransactions = await supportsTransactions();

  if (hasTransactions) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } else {
    // Run without session on standalone — operations still execute in order,
    // but are not atomic. This is acceptable for local development only.
    return fn(null);
  }
}

module.exports = { withTransaction, supportsTransactions };
