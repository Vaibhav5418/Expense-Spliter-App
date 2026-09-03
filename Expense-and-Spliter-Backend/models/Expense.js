const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, default: 'Others' }, // Maps to 'sector' concept
  paymentMode: {
    type: String,
    enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'],
    default: 'Cash'
  }, // Maps to 'channel' concept
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly', null],
    default: null
  },
  recurringStartDate: { type: Date },
  recurringEndDate: { type: Date },
  lastGeneratedDate: { type: Date },
  parentRecurringId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  isAIComputed: { type: Boolean, default: false },
  predictedCategory: String,
  aiConfidenceScore: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes for performance
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, amount: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
