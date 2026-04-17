const Inventory = require('../models/Inventory');

// GET /api/inventory
exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const items = await Inventory.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// POST /api/inventory
exports.create = async (req, res, next) => {
  try {
    const { name, category, pricePerDay, totalQuantity, itemValue } = req.body;
    if (!name || !category || pricePerDay == null || totalQuantity == null) {
      return res.status(400).json({ success: false, message: 'Name, category, price, and quantity are required.' });
    }
    const item = await Inventory.create({
      name,
      category,
      pricePerDay,
      totalQuantity,
      availableQuantity: totalQuantity,
      itemValue: itemValue || 0,
    });
    res.status(201).json({ success: true, message: 'Item added successfully!', data: item });
  } catch (error) {
    next(error);
  }
};

// PUT /api/inventory/:id
exports.update = async (req, res, next) => {
  try {
    const { name, category, pricePerDay, totalQuantity, itemValue } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    // If totalQuantity changed, adjust availableQuantity proportionally
    if (totalQuantity != null && totalQuantity !== item.totalQuantity) {
      const rentedOut = item.totalQuantity - item.availableQuantity;
      const newAvailable = totalQuantity - rentedOut;
      if (newAvailable < 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce total quantity below ${rentedOut} (currently rented out).`,
        });
      }
      item.totalQuantity = totalQuantity;
      item.availableQuantity = newAvailable;
    }

    if (name) item.name = name;
    if (category) item.category = category;
    if (pricePerDay != null) item.pricePerDay = pricePerDay;
    if (itemValue != null) item.itemValue = itemValue;

    await item.save();
    res.json({ success: true, message: 'Item updated successfully!', data: item });
  } catch (error) {
    next(error);
  }
};
