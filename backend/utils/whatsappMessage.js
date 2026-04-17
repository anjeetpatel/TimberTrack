const { formatDate } = require('./dateUtils');

/**
 * Generate a WhatsApp message for a new rental.
 */
const rentalCreatedMessage = (customerName, items, startDate) => {
  const itemList = items
    .map((item) => `  • ${item.itemName} × ${item.issuedQty}`)
    .join('\n');

  return (
    `Hello ${customerName},\n\n` +
    `You have rented the following items:\n${itemList}\n\n` +
    `Start Date: ${formatDate(startDate)}\n\n` +
    `Please return on time to avoid extra charges.\n` +
    `— TimberTrack`
  );
};

/**
 * Generate a WhatsApp message for a return summary.
 */
const returnSummaryMessage = (customerName, totalAmount, amountPaid) => {
  const balance = Math.max(0, totalAmount - amountPaid);
  return (
    `Hello ${customerName},\n\n` +
    `Your return has been processed.\n\n` +
    `Total Amount: ₹${totalAmount.toLocaleString('en-IN')}\n` +
    `Paid: ₹${amountPaid.toLocaleString('en-IN')}\n` +
    `Balance: ₹${balance.toLocaleString('en-IN')}\n\n` +
    `Thank you for your business!\n` +
    `— TimberTrack`
  );
};

/**
 * Generate a WhatsApp payment reminder message.
 */
const paymentReminderMessage = (customerName, pendingAmount) => {
  return (
    `Reminder: ₹${pendingAmount.toLocaleString('en-IN')} is pending for your rental.\n\n` +
    `Dear ${customerName}, please clear your dues at the earliest.\n\n` +
    `Thank you!\n` +
    `— TimberTrack`
  );
};

/**
 * Generate a wa.me URL.
 * @param {String} phone - Phone number (with country code, e.g., 91XXXXXXXXXX)
 * @param {String} message - Pre-filled message
 */
const generateWhatsAppLink = (phone, message) => {
  // Strip non-digits and ensure country code
  const cleanPhone = phone.replace(/\D/g, '');
  const withCountryCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
};

module.exports = {
  rentalCreatedMessage,
  returnSummaryMessage,
  paymentReminderMessage,
  generateWhatsAppLink,
};
