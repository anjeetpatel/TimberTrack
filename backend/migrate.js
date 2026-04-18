/**
 * TimberTrack — One-time migration script.
 * 
 * Run ONCE after upgrading to the multi-tenant SaaS version:
 *   node migrate.js
 * 
 * This script is IDEMPOTENT — safe to run multiple times.
 * It will skip if an Organization already exists.
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timbertrack');
  console.log('✅ Connected to MongoDB\n');

  // Dynamically require models (schemas have changed so we need fresh models)
  const Organization = require('./models/Organization');
  const User = require('./models/User');
  const Inventory = require('./models/Inventory');
  const Customer = require('./models/Customer');
  const Rental = require('./models/Rental');
  const ReturnTransaction = require('./models/ReturnTransaction');
  const Payment = require('./models/Payment');

  // ── Check idempotency ──────────────────────────────────────────
  const existingOrg = await Organization.findOne();
  if (existingOrg) {
    console.log('⚠️  Organization already exists. This DB has already been migrated.');
    console.log(`   Organization: ${existingOrg.name} (${existingOrg._id})`);
    console.log('   Nothing to do. Exiting.\n');
    await mongoose.disconnect();
    return;
  }

  // ── Step 1: Create Default Organization ───────────────────────
  console.log('📦 Step 1: Creating default organization...');
  const org = await Organization.create({
    name: 'Default Business',
    ownerId: new mongoose.Types.ObjectId(), // placeholder, updated below
    plan: 'FREE',
    usageStats: { lastResetDate: new Date() },
  });
  console.log(`   Created: "${org.name}" (${org._id})`);
  console.log(`   Invite code: ${org.inviteCode}\n`);

  // ── Step 2: Update users ───────────────────────────────────────
  console.log('👤 Step 2: Updating users...');
  const users = await User.find({});
  if (users.length === 0) {
    console.log('   No users found — skipping user update.\n');
  } else {
    const firstUser = users[0];
    // Set first user as OWNER
    await User.updateOne(
      { _id: firstUser._id },
      { $set: { organizationId: org._id, role: 'OWNER', isActive: true } }
    );
    // Set remaining users as WORKER
    if (users.length > 1) {
      await User.updateMany(
        { _id: { $ne: firstUser._id } },
        { $set: { organizationId: org._id, role: 'WORKER', isActive: true } }
      );
    }
    // Update org.ownerId
    await Organization.updateOne({ _id: org._id }, { ownerId: firstUser._id });
    console.log(`   ${users.length} user(s) updated. Owner: ${firstUser.name} (${firstUser._id})\n`);
  }

  // ── Step 3: Stamp all data documents with organizationId ───────
  const models = [
    { model: Inventory, name: 'Inventory' },
    { model: Customer, name: 'Customer' },
    { model: Rental, name: 'Rental' },
    { model: ReturnTransaction, name: 'ReturnTransaction' },
    { model: Payment, name: 'Payment' },
  ];

  console.log('🗄️  Step 3: Stamping existing data with organizationId...');
  for (const { model, name } of models) {
    const result = await model.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId: org._id } }
    );
    console.log(`   ${name}: ${result.modifiedCount} document(s) updated`);
  }

  // ── Step 4: Update customer usage stat ────────────────────────
  console.log('\n📊 Step 4: Syncing usage stats...');
  const customerCount = await Customer.countDocuments({ organizationId: org._id, isDeleted: { $ne: true } });
  await Organization.updateOne({ _id: org._id }, { 'usageStats.totalCustomers': customerCount });
  console.log(`   totalCustomers set to: ${customerCount}`);

  console.log('\n✅ Migration complete!');
  console.log('────────────────────────────────────');
  console.log(`Organization ID : ${org._id}`);
  console.log(`Invite Code     : ${org.inviteCode}`);
  console.log('────────────────────────────────────');
  console.log('\nNext steps:');
  console.log('  1. Start the server: npm run dev');
  console.log('  2. Login with existing credentials');
  console.log('  3. Share invite code with workers\n');

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
