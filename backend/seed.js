require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Organization = require('./models/Organization');
const User = require('./models/User');
const Inventory = require('./models/Inventory');
const Customer = require('./models/Customer');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Organization.deleteMany({});
  await User.deleteMany({});
  await Inventory.deleteMany({});
  await Customer.deleteMany({});

  // ── Step 1: Create Organization ───────────────────────────────
  const org = await Organization.create({
    name: 'TimberTrack Demo',
    ownerId: new mongoose.Types.ObjectId(), // placeholder
    plan: 'FREE',
    usageStats: { lastResetDate: new Date() },
  });
  console.log(`\n🏢 Organization created: "${org.name}"`);
  console.log(`   Invite Code: ${org.inviteCode}`);

  // ── Step 2: Create admin OWNER user ──────────────────────────
  const adminUser = await User.create({
    name: 'Admin',
    phone: '9999999999',
    pin: '1234',
    organizationId: org._id,
    role: 'OWNER',
    isActive: true,
  });
  // Update org ownerId
  org.ownerId = adminUser._id;
  await org.save();
  console.log('\n👤 Admin user created:');
  console.log('   Phone: 9999999999  |  PIN: 1234  |  Role: OWNER');

  // ── Step 3: Create sample inventory ──────────────────────────
  const items = await Inventory.insertMany([
    { organizationId: org._id, name: 'Wooden Balli (10ft)',   category: 'Scaffolding', pricePerDay: 8,  totalQuantity: 200, availableQuantity: 200, itemValue: 250 },
    { organizationId: org._id, name: 'Wooden Balli (12ft)',   category: 'Scaffolding', pricePerDay: 10, totalQuantity: 150, availableQuantity: 150, itemValue: 350 },
    { organizationId: org._id, name: 'Steel Plate (4x8)',     category: 'Shuttering',  pricePerDay: 25, totalQuantity: 100, availableQuantity: 100, itemValue: 1200 },
    { organizationId: org._id, name: 'Centering Sheet',       category: 'Shuttering',  pricePerDay: 15, totalQuantity: 80,  availableQuantity: 80,  itemValue: 800 },
    { organizationId: org._id, name: 'Adjustable Prop (3m)',  category: 'Props',       pricePerDay: 12, totalQuantity: 120, availableQuantity: 120, itemValue: 600 },
    { organizationId: org._id, name: 'Adjustable Prop (4m)',  category: 'Props',       pricePerDay: 15, totalQuantity: 90,  availableQuantity: 90,  itemValue: 750 },
    { organizationId: org._id, name: 'MS Channel (10ft)',     category: 'Channels',    pricePerDay: 18, totalQuantity: 60,  availableQuantity: 60,  itemValue: 900 },
    { organizationId: org._id, name: 'Wooden Plank (2x10)',   category: 'Planks',      pricePerDay: 6,  totalQuantity: 300, availableQuantity: 300, itemValue: 180 },
    { organizationId: org._id, name: 'Cup Lock Vertical (1.5m)', category: 'Cup Lock', pricePerDay: 20, totalQuantity: 100, availableQuantity: 100, itemValue: 500 },
    { organizationId: org._id, name: 'Cup Lock Ledger (1.2m)',  category: 'Cup Lock',  pricePerDay: 14, totalQuantity: 100, availableQuantity: 100, itemValue: 400 },
  ]);
  console.log(`\n📦 ${items.length} inventory items created`);

  // ── Step 4: Create sample customers ──────────────────────────
  const customers = await Customer.insertMany([
    { organizationId: org._id, name: 'Elias Woodworks',    phone: '9876500001', email: 'elias@woodworks.com' },
    { organizationId: org._id, name: 'Sharma Construction', phone: '9876500002', email: 'sharma@construction.in' },
    { organizationId: org._id, name: 'Patel Builders',     phone: '9876500003', email: 'patel@builders.com' },
    { organizationId: org._id, name: 'Singh Enterprises',  phone: '9876500004', email: 'singh@enterprises.in' },
    { organizationId: org._id, name: 'Kumar & Sons',       phone: '9876500005', email: 'kumar@sons.com' },
  ]);
  // Update usage stats
  org.usageStats.totalCustomers = customers.length;
  await org.save();
  console.log(`👥 ${customers.length} customers created`);

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('  Login: phone=9999999999, pin=1234');
  console.log(`  Invite code for workers: ${org.inviteCode}`);
  console.log('─────────────────────────────────────────\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
