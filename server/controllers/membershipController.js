const db = require('../config/db');

const membershipController = {
    // Create a new membership
    createMembership: async (req, res) => {
        try {
            const { member_id, start_date, end_date } = req.body;

            // Validate input
            if (!member_id || !start_date || !end_date) {
                return res.status(400).json({ message: 'Please provide all required fields' });
            }

            // Check if member exists
            const [members] = await db.query('SELECT id FROM members WHERE id = $1', [member_id]);
            if (members.length === 0) {
                return res.status(404).json({ message: 'Member not found' });
            }

            // Create membership
            const [rows] = await db.query(
                'INSERT INTO subscriptions (member_id, start_date, end_date, status) VALUES ($1, $2, $3, $4) RETURNING id',
                [member_id, start_date, end_date, 'active']
            );

            res.status(201).json({ 
                message: 'Membership created successfully',
                membershipId: rows[0].id 
            });
        } catch (error) {
            console.error('Error creating membership:', error);
            res.status(500).json({ 
                message: 'Error creating membership',
                error: error.message 
            });
        }
    },

    // Get membership by member ID
    getMembershipByMemberId: async (req, res) => {
        try {
            const [memberships] = await db.query(
                'SELECT * FROM subscriptions WHERE member_id = $1 ORDER BY end_date DESC',
                [req.params.memberId]
            );

            if (memberships.length === 0) {
                return res.status(404).json({ message: 'No memberships found for this member' });
            }

            res.json(memberships);
        } catch (error) {
            console.error('Error fetching membership:', error);
            res.status(500).json({ 
                message: 'Error fetching membership',
                error: error.message 
            });
        }
    },

    // Update membership
    updateMembership: async (req, res) => {
        try {
            const { start_date, end_date, status } = req.body;
            const membershipId = req.params.id;

            // Validate input
            if (!start_date || !end_date || !status) {
                return res.status(400).json({ message: 'Please provide all required fields' });
            }

            // Update membership
            const [, result] = await db.query(
                'UPDATE subscriptions SET start_date = $1, end_date = $2, status = $3 WHERE id = $4',
                [start_date, end_date, status, membershipId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Membership not found' });
            }

            res.json({ message: 'Membership updated successfully' });
        } catch (error) {
            console.error('Error updating membership:', error);
            res.status(500).json({ 
                message: 'Error updating membership',
                error: error.message 
            });
        }
    },

    // Cancel membership
    cancelMembership: async (req, res) => {
        try {
            const membershipId = req.params.id;

            // Update membership status to expired
            const [, result] = await db.query(
                'UPDATE subscriptions SET status = $1 WHERE id = $2',
                ['expired', membershipId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Membership not found' });
            }

            res.json({ message: 'Membership cancelled successfully' });
        } catch (error) {
            console.error('Error cancelling membership:', error);
            res.status(500).json({ 
                message: 'Error cancelling membership',
                error: error.message 
            });
        }
    }
};

module.exports = membershipController; 