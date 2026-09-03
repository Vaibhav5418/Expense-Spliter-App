const cron = require('node-cron');
const Expense = require('../models/Expense');

const initRecurringJobs = () => {
    // Run daily at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('⏳ Running recurring expenses scheduler...');
        try {
            const recurringSeries = await Expense.find({ isRecurring: true });
            const now = new Date();

            for (const series of recurringSeries) {
                let nextDate = new Date(series.lastGeneratedDate || series.recurringStartDate);

                // Limit iteration to prevent infinite loops (max 365 days / 52 weeks / 12 months forward)
                let iterations = 0;

                while (true) {
                    if (iterations > 366) break; // Safety break

                    if (series.recurringFrequency === 'Daily') nextDate.setDate(nextDate.getDate() + 1);
                    else if (series.recurringFrequency === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
                    else if (series.recurringFrequency === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                    else if (series.recurringFrequency === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
                    else break;

                    // Stop if next date is in the future or past end date
                    if (nextDate > now || (series.recurringEndDate && nextDate > series.recurringEndDate)) break;

                    // Check if already generated
                    const existing = await Expense.findOne({
                        userId: series.userId,
                        parentRecurringId: series._id,
                        date: {
                            $gte: new Date(nextDate.setHours(0, 0, 0, 0)),
                            $lte: new Date(nextDate.setHours(23, 59, 59, 999))
                        }
                    });

                    if (!existing) {
                        const newExp = new Expense({
                            userId: series.userId,
                            title: `${series.title} (Recurring)`,
                            amount: series.amount,
                            date: new Date(nextDate),
                            category: series.category,
                            paymentMode: series.paymentMode,
                            parentRecurringId: series._id,
                            isRecurring: true, // Mark as part of recurring chain but not parent? Maybe false to avoid recursion
                            // Wait, checking original index.js logic: newExp didn't set isRecurring: true.
                            // Logic check: Child expenses shouldn't trigger new recursion. 
                            // Original logic in index.js: newExp didn't include isRecurring:true.
                            isRecurring: false
                        });
                        await newExp.save();

                        // Update parent last generated
                        series.lastGeneratedDate = nextDate;
                        await series.save();

                        console.log(`✅ Generated recurring expense: ${series.title} for ${nextDate.toDateString()}`);
                    }
                    iterations++;
                }
            }
        } catch (err) {
            console.error('❌ Scheduler error:', err.message);
        }
    });

    console.log('⏰ Recurring Job Scheduler Initialized');
};

module.exports = initRecurringJobs;
