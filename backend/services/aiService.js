const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY' 
});

/**
 * Generates an AI-formatted WhatsApp billing summary based purely on rigorous backend data.
 * The AI is strictly instructed NOT to perform any math or translation of currencies.
 *
 * @param {Object} data Computed rental data object
 * @param {String} tone 'FRIENDLY' or 'STRICT'
 * @param {String} language e.g., 'English', 'Hindi', 'Marathi'
 * @returns {Promise<String>} Formatted text string
 */
exports.generateBillingSummary = async (data, tone = 'FRIENDLY', language = 'English') => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please add it to your .env file.');
  }

  const prompt = `
You are a professional billing assistant for a construction equipment rental business.
Generate a clear, simple, and professional rental summary that can be shared with customers via WhatsApp.

CRITICAL RULES YOU MUST FOLLOW:
1. DO NOT modify any numbers. Use strictly the numbers provided.
2. DO NOT perform any math or tax calculations.
3. DO NOT translate currency values or currency symbols. Keep amounts exactly as provided.
4. Keep the language simple and polite.
5. Provide the output in the requested language: ${language}.
6. Use the requested Tone: ${tone === 'STRICT' ? 'Urgent, direct, strict collection reminder' : 'Polite, friendly, appreciative'}.
7. Use WhatsApp formatting (* for bold, _ for italic). DO NOT use Markdown headers like "#" or "**" for bold.

INPUT DATA:
Customer Name: ${data.customerName}
Rental ID: ${data.rentalId}
Start Date: ${data.startDate}

Items Rented:
${data.items.map(i => `- ${i.name} (${i.totalQty} units): ₹${i.pricePerDay}/day`).join('\n')}

Financial Breakdown:
Gross Amount Generated (to date): ₹${data.grossAmount.toLocaleString('en-IN')}
Damage/Lost Charges: ₹${data.damageAndLostCharges.toLocaleString('en-IN')}
Total Outstanding Debt (Gross + Charges): ₹${data.totalDebt.toLocaleString('en-IN')}
Total Amount Paid (Credits): ₹${data.amountPaid.toLocaleString('en-IN')}
Remaining Due Final Balance: ₹${data.remainingBalance.toLocaleString('en-IN')}

Payment Status: ${data.paymentStatus}

OUTPUT FORMAT:
Start with a greeting matching the tone (in ${language}).
Then list the items.
Then list the financial breakdown.
End with a sign-off matching the tone.
Keep it clean, strictly WhatsApp formatted.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        temperature: 0.2, // Low temperature to heavily restrict creative hallucination of numbers
      }
    });

    return response.text;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error('Failed to generate summary from AI provider.');
  }
};
