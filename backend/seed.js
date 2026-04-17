require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Inventory = require('./models/Inventory');
const Customer = require('./models/Customer');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Inventory.deleteMany({});
  await Customer.deleteMany({});

  // Create default user
  const user = await User.create({
    phone: '9999999999',
    name: 'Admin',
    pin: '1234',
  });
  console.log('Default user created: phone=9999999999, pin=1234');

  // Create sample inventory
  const items = await Inventory.insertMany([
    { name: 'Wooden Balli (10ft)', category: 'Scaffolding', pricePerDay: 8, totalQuantity: 200, availableQuantity: 200, itemValue: 250 },
    { name: 'Wooden Balli (12ft)', category: 'Scaffolding', pricePerDay: 10, totalQuantity: 150, availableQuantity: 150, itemValue: 350 },
    { name: 'Steel Plate (4x8)', category: 'Shuttering', pricePerDay: 25, totalQuantity: 100, availableQuantity: 100, itemValue: 1200 },
    { name: 'Centering Sheet', category: 'Shuttering', pricePerDay: 15, totalQuantity: 80, availableQuantity: 80, itemValue: 800 },
    { name: 'Adjustable Prop (3m)', category: 'Props', pricePerDay: 12, totalQuantity: 120, availableQuantity: 120, itemValue: 600 },
    { name: 'Adjustable Prop (4m)', category: 'Props', pricePerDay: 15, totalQuantity: 90, availableQuantity: 90, itemValue: 750 },
    { name: 'MS Channel (10ft)', category: 'Channels', pricePerDay: 18, totalQuantity: 60, availableQuantity: 60, itemValue: 900 },
    { name: 'Wooden Plank (2x10)', category: 'Planks', pricePerDay: 6, totalQuantity: 300, availableQuantity: 300, itemValue: 180 },
    { name: 'Cup Lock Vertical (1.5m)', category: 'Cup Lock', pricePerDay: 20, totalQuantity: 100, availableQuantity: 100, itemValue: 500 },
    { name: 'Cup Lock Ledger (1.2m)', category: 'Cup Lock', pricePerDay: 14, totalQuantity: 100, availableQuantity: 100, itemValue: 400 },
  ]);
  console.log(`${items.length} inventory items created`);

  // Create sample customers
  const customers = await Customer.insertMany([
    { name: 'Elias Woodworks', phone: '9876543210', email: 'elias@woodworks.com' },
    { name: 'Sharma Construction', phone: '9876543211', email: 'sharma@construction.in' },
    { name: 'Patel Builders', phone: '9876543212', email: 'patel@builders.com' },
    { name: 'Singh Enterprises', phone: '9876543213', email: 'singh@enterprises.in' },
    { name: 'Kumar & Sons', phone: '9876543214', email: 'kumar@sons.com' },
  ]);
  console.log(`${customers.length} customers created`);

  console.log('Seed complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
