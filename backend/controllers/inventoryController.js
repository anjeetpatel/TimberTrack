const Inventory = require('../models/Inventory');
const Rental = require('../models/Rental');
const { logActivity } = require('../utils/activityLogger');

const ORG_FILTER = (req) => ({
  organizationId: req.user.organizationId,
  isDeleted: { $ne: true },
});

// GET /api/inventory
exports.getAll = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const filter = ORG_FILTER(req);

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Inventory.find(filter).sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
      Inventory.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/inventory
exports.create = async (req, res, next) => {
  try {
    const { name, category, pricePerDay, totalQuantity, itemValue, description } = req.body;
    if (!name || !category || pricePerDay === undefined || !totalQuantity) {
      return res.status(400).json({ success: false, message: 'Name, category, pricePerDay, and totalQuantity are required.' });
    }
    if (pricePerDay < 0) return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
    if (totalQuantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });

    const item = await Inventory.create({
      organizationId: req.user.organizationId,
      name: name.trim(),
      category: category.trim(),
      pricePerDay: Number(pricePerDay),
      totalQuantity: Number(totalQuantity),
      availableQuantity: Number(totalQuantity),
      itemValue: Number(itemValue) || 0,
      description: description?.trim() || '',
    });

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'INVENTORY_ADDED',
      resourceType: 'Inventory',
      resourceId: item._id,
      meta: { itemName: item.name, itemCount: item.totalQuantity },
    });

    res.status(201).json({ success: true, message: 'Inventory item added!', data: item });
  } catch (error) {
    next(error);
  }
};

// PUT /api/inventory/:id
exports.update = async (req, res, next) => {
  try {
    const item = await Inventory.findOne({ _id: req.params.id, ...ORG_FILTER(req) });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const { totalQuantity, pricePerDay, name, category, itemValue, description } = req.body;

    // Protect against reducing totalQuantity below rented amount
    if (totalQuantity !== undefined) {
      const rentedOut = item.totalQuantity - item.availableQuantity;
      const newTotal = Number(totalQuantity);
      if (newTotal < rentedOut) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce total quantity to ${newTotal} — ${rentedOut} units are currently on rent.`,
        });
      }
      const qtyDiff = newTotal - item.totalQuantity;
      item.totalQuantity = newTotal;
      item.availableQuantity = Math.max(0, item.availableQuantity + qtyDiff);
    }

    if (pricePerDay !== undefined) {
      if (Number(pricePerDay) < 0) return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
      item.pricePerDay = Number(pricePerDay);
    }
    if (name) item.name = name.trim();
    if (category) item.category = category.trim();
    if (itemValue !== undefined) item.itemValue = Number(itemValue);
    if (description !== undefined) item.description = description.trim();

    await item.save();

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'INVENTORY_UPDATED',
      resourceType: 'Inventory',
      resourceId: item._id,
      meta: { itemName: item.name },
    });

    res.json({ success: true, message: 'Item updated!', data: item });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/inventory/:id — OWNER only, soft delete with guard
exports.delete = async (req, res, next) => {
  try {
    const item = await Inventory.findOne({ _id: req.params.id, ...ORG_FILTER(req) });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const rentedOut = item.totalQuantity - item.availableQuantity;
    if (rentedOut > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete "${item.name}" — ${rentedOut} unit(s) are currently on rent. Process all returns first.`,
      });
    }

    item.isDeleted = true;
    item.deletedAt = new Date();
    await item.save();

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'INVENTORY_DELETED',
      resourceType: 'Inventory',
      resourceId: item._id,
      meta: { itemName: item.name },
    });

    res.json({ success: true, message: `"${item.name}" has been removed from inventory.` });
  } catch (error) {
    next(error);
  }
};
