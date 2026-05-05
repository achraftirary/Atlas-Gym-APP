const db = require('../config/db');

const subscriptionController = {
    // Get member's own subscription
    getMySubscription: async (req, res) => {
        try {
            const memberId = req.user.id;

            const [subscriptions] = await db.query(
                `SELECT * FROM subscriptions 
                 WHERE member_id = $1 
                 ORDER BY end_date DESC 
                 LIMIT 1`,
                [memberId]
            );

            if (subscriptions.length === 0) {
                return res.status(404).json({ message: 'No subscription found' });
            }

            // Calculate days remaining
            const subscription = subscriptions[0];
            const endDate = new Date(subscription.end_date);
            const today = new Date();
            const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

            res.json({
                ...subscription,
                days_remaining: daysRemaining
            });
        } catch (error) {
            console.error('Error fetching subscription:', error);
            res.status(500).json({ message: 'Error fetching subscription' });
        }
    }
};

module.exports = subscriptionController; 