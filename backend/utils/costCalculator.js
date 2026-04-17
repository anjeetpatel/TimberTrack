const { daysBetween } = require('./dateUtils');

/**
 * Calculate return cost for a set of returned items.
 * Uses lastCalculatedDate per item to prevent double-billing.
 *
 * @param {Array} rentalItems - The rental's items array
 * @param {Array} returnedItems - Array of { itemId, quantityReturned }
 * @param {Date} returnDate - Date of return
 * @returns {Object} { lineItems, totalCost }
 */
const calculateReturnCost = (rentalItems, returnedItems, returnDate) => {
  const lineItems = [];
  let totalCost = 0;

  for (const ri of returnedItems) {
    const rentalItem = rentalItems.find(
      (item) => item.itemId.toString() === ri.itemId.toString()
    );

    if (!rentalItem) {
      throw new Error(`Item ${ri.itemId} not found in this rental.`);
    }

    const remaining = rentalItem.issuedQty - rentalItem.returnedQty;
    if (ri.quantityReturned > remaining) {
      throw new Error(
        `Cannot return ${ri.quantityReturned} of "${rentalItem.itemName}". Only ${remaining} remaining.`
      );
    }

    if (ri.quantityReturned <= 0) {
      throw new Error(`Return quantity must be at least 1.`);
    }

    const daysCharged = daysBetween(rentalItem.lastCalculatedDate, returnDate);
    const lineCost = ri.quantityReturned * rentalItem.pricePerDay * daysCharged;

    lineItems.push({
      itemId: ri.itemId,
      quantityReturned: ri.quantityReturned,
      daysCharged,
      lineCost,
    });

    totalCost += lineCost;
  }

  return { lineItems, totalCost };
};

/**
 * Calculate lost item charges.
 * @param {Number} lostQty - How many items lost
 * @param {Number} itemValue - Replacement cost per item
 * @returns {Number} total lost charges
 */
const calculateLostCharges = (lostQty, itemValue) => {
  if (lostQty <= 0 || itemValue <= 0) return 0;
  return lostQty * itemValue;
};

module.exports = { calculateReturnCost, calculateLostCharges };
