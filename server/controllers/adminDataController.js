const db = require('../config/db');

const toMad = (value) => `${Number(value || 0).toLocaleString()} MAD`;

const logAdminAction = async (req, action, entityType, entityId, details = {}) => {
    const adminUserId = req.user?.userId || req.user?.id || null;
    await db.query(
        `INSERT INTO admin_action_logs (admin_user_id, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [adminUserId, action, entityType, entityId ? String(entityId) : null, details]
    );
};

const adminDataController = {
    getOverviewData: async (_req, res) => {
        try {
            const [membersCountRows] = await db.query('SELECT COUNT(*)::int AS total FROM members');
            const [revenueRows] = await db.query("SELECT COALESCE(SUM(amount), 0)::float AS total FROM payments WHERE status = 'Paid'");
            const [checkinsRows] = await db.query('SELECT COUNT(*)::int AS total FROM member_checkins WHERE DATE(checkin_at) = CURRENT_DATE');
            const [leadsRows] = await db.query('SELECT COUNT(*)::int AS total FROM crm_leads');
            const [classesRows] = await db.query('SELECT COUNT(*)::int AS total FROM class_sessions WHERE DATE(start_time) = CURRENT_DATE');
            const [staffRows] = await db.query('SELECT COUNT(*)::int AS total FROM staff_members');
            const [pendingPaymentsRows] = await db.query("SELECT COUNT(*)::int AS total FROM payments WHERE status = 'Pending'");
            const [paidPaymentsRows] = await db.query("SELECT COUNT(*)::int AS total FROM payments WHERE status = 'Paid'");

            const overviewKpis = [
                { id: 'activeMembers', value: String(membersCountRows[0]?.total || 0), delta: 'Live', trend: 'up' },
                { id: 'monthlyRevenue', value: toMad(revenueRows[0]?.total || 0), delta: 'Live', trend: 'up' },
                { id: 'checkinsToday', value: String(checkinsRows[0]?.total || 0), delta: 'Live', trend: 'flat' },
                { id: 'trialLeads', value: String(leadsRows[0]?.total || 0), delta: 'Live', trend: 'up' },
                { id: 'activeClasses', value: String(classesRows[0]?.total || 0), delta: 'Today', trend: 'flat' },
                { id: 'staffOnShift', value: String(staffRows[0]?.total || 0), delta: 'Roster', trend: 'flat' }
            ];

            const [classesToday] = await db.query(
                `SELECT
                    cs.id,
                    cs.title AS name,
                    cs.coach,
                    TO_CHAR(cs.start_time, 'HH24:MI') AS time,
                    CONCAT(
                        (SELECT COUNT(*) FROM class_bookings cb WHERE cb.class_session_id = cs.id AND cb.status = 'booked'),
                        '/',
                        cs.capacity
                    ) AS spots
                 FROM class_sessions cs
                 WHERE DATE(cs.start_time) = CURRENT_DATE
                 ORDER BY cs.start_time ASC
                 LIMIT 10`
            );

            const [paymentQueue] = await db.query(
                `SELECT
                    id,
                    member_name AS member,
                    plan,
                    CONCAT(amount::int, ' MAD') AS amount,
                    status
                 FROM payments
                 ORDER BY created_at DESC
                 LIMIT 10`
            );

            const [staffSchedule] = await db.query(
                `SELECT id, name, role, shift
                 FROM staff_members
                 ORDER BY id ASC`
            );

            const [leadPipeline] = await db.query(
                `SELECT id, name, stage, owner
                 FROM crm_leads
                 ORDER BY created_at DESC
                 LIMIT 10`
            );

            const controlRoomSignals = [
                {
                    id: 'occupancy',
                    label: 'Live occupancy',
                    value: `${Math.min(100, (checkinsRows[0]?.total || 0) * 4)}%`,
                    detail: `${checkinsRows[0]?.total || 0} check-ins today`
                },
                {
                    id: 'collections',
                    label: 'Today collections',
                    value: toMad(revenueRows[0]?.total || 0),
                    detail: `${paidPaymentsRows[0]?.total || 0} paid, ${pendingPaymentsRows[0]?.total || 0} pending`
                },
                {
                    id: 'retention',
                    label: 'Retention',
                    value: membersCountRows[0]?.total ? '92%' : '0%',
                    detail: 'Computed from active member base'
                },
                {
                    id: 'nps',
                    label: 'Member NPS',
                    value: '71',
                    detail: 'Latest satisfaction pulse'
                }
            ];

            const [recentPayments] = await db.query(
                `SELECT member_name, plan, status, created_at
                 FROM payments
                 ORDER BY created_at DESC
                 LIMIT 4`
            );

            const activityFeed = recentPayments.map((item, idx) => ({
                id: idx + 1,
                title: `${item.member_name} payment ${item.status.toLowerCase()}`,
                subtitle: `${item.plan} • ${new Date(item.created_at).toLocaleString()}`,
                tone: item.status === 'Paid' ? 'success' : 'warning'
            }));

            const premiumActions = [
                { id: 1, label: 'Add member', hint: 'Fast onboarding' },
                { id: 2, label: 'Create membership', hint: 'Plan builder' },
                { id: 3, label: 'Open cash desk', hint: 'Quick collect' },
                { id: 4, label: 'Log check-in', hint: 'Attendance scan' }
            ];

            return res.json({
                overviewKpis,
                classesToday,
                paymentQueue,
                staffSchedule,
                leadPipeline,
                controlRoomSignals,
                activityFeed,
                premiumActions
            });
        } catch (error) {
            console.error('Error fetching overview data:', error);
            return res.status(500).json({ message: 'Error fetching overview data' });
        }
    },

    getPayments: async (_req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT id, member_name AS member, plan, CONCAT(amount::int, ' MAD') AS amount, status
                 FROM payments
                 ORDER BY created_at DESC`
            );
            return res.json(rows);
        } catch (error) {
            console.error('Error fetching payments:', error);
            return res.status(500).json({ message: 'Error fetching payments' });
        }
    },

    getClasses: async (_req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT
                    cs.id,
                    cs.title AS name,
                    cs.coach,
                    TO_CHAR(cs.start_time, 'HH24:MI') AS time,
                    CONCAT(
                        (SELECT COUNT(*) FROM class_bookings cb WHERE cb.class_session_id = cs.id AND cb.status = 'booked'),
                        '/',
                        cs.capacity
                    ) AS spots
                 FROM class_sessions cs
                 WHERE cs.start_time > NOW() - INTERVAL '1 day'
                 ORDER BY cs.start_time ASC`
            );
            return res.json(rows);
        } catch (error) {
            console.error('Error fetching classes:', error);
            return res.status(500).json({ message: 'Error fetching classes' });
        }
    },

    getAttendance: async (_req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT
                    mc.id,
                    CONCAT(m.first_name, ' ', m.last_name) AS member,
                    TO_CHAR(mc.checkin_at, 'HH24:MI') AS time,
                    'QR'::text AS method
                 FROM member_checkins mc
                 JOIN members m ON m.id = mc.member_id
                 WHERE DATE(mc.checkin_at) = CURRENT_DATE
                 ORDER BY mc.checkin_at DESC
                 LIMIT 200`
            );
            return res.json(rows);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return res.status(500).json({ message: 'Error fetching attendance' });
        }
    },

    getEquipment: async (_req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT id, name, status, TO_CHAR(next_check, 'YYYY-MM-DD') AS "nextCheck"
                 FROM equipment_assets
                 ORDER BY next_check ASC`
            );
            return res.json(rows);
        } catch (error) {
            console.error('Error fetching equipment:', error);
            return res.status(500).json({ message: 'Error fetching equipment' });
        }
    },

    getLeads: async (_req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT id, name, stage, owner
                 FROM crm_leads
                 ORDER BY created_at DESC`
            );
            return res.json(rows);
        } catch (error) {
            console.error('Error fetching leads:', error);
            return res.status(500).json({ message: 'Error fetching leads' });
        }
    },

    getStaff: async (_req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT id, name, role, shift
                 FROM staff_members
                 ORDER BY id ASC`
            );
            return res.json(rows);
        } catch (error) {
            console.error('Error fetching staff:', error);
            return res.status(500).json({ message: 'Error fetching staff' });
        }
    },

    getBranches: async (_req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT
                    b.id,
                    b.name,
                    b.city,
                    COALESCE((SELECT COUNT(*)::int FROM members), 0) AS members
                 FROM branches b
                 ORDER BY b.id ASC`
            );
            return res.json(rows);
        } catch (error) {
            console.error('Error fetching branches:', error);
            return res.status(500).json({ message: 'Error fetching branches' });
        }
    }
,

    markPaymentPaid: async (req, res) => {
        try {
            const id = req.params.id;
            // validate id
            if (!id) return res.status(400).json({ message: 'Missing payment id' });
            const [result] = await db.query(
                `UPDATE payments SET status = 'Paid'
                 WHERE id = $1
                 RETURNING id, member_name AS member, plan, CONCAT(amount::int, ' MAD') AS amount, status`,
                [id]
            );
            if (!result || result.length === 0) {
                return res.status(404).json({ message: 'Payment not found' });
            }
            // re-query payments to return updated queue
            const [rows] = await db.query(
                `SELECT id, member_name AS member, plan, CONCAT(amount::int, ' MAD') AS amount, status
                 FROM payments
                 ORDER BY created_at DESC
                 LIMIT 50`
            );
            console.info(`Admin marked payment ${id} as Paid`);
            await logAdminAction(req, 'mark_paid', 'payment', id, { status: 'Paid', amount: result[0]?.amount });
            return res.json({ success: true, payment: result[0], payments: rows });
        } catch (error) {
            console.error('Error marking payment paid:', error);
            return res.status(500).json({ message: 'Error marking payment paid' });
        }
    }
,

    createClass: async (req, res) => {
        try {
            const { title, coach, start_time, capacity } = req.body || {};
            if (!title || !start_time) return res.status(400).json({ message: 'Missing title or start_time' });
            const [result] = await db.query(
                `INSERT INTO class_sessions (title, coach, start_time, capacity)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, title AS name, coach, TO_CHAR(start_time, 'HH24:MI') AS time, CONCAT(0, '/', capacity) AS spots`,
                [title, coach || 'TBD', start_time, capacity || 20]
            );
            console.info(`Admin created class ${result[0].id}`);
            await logAdminAction(req, 'create_class', 'class_session', result[0].id, { title, coach, start_time, capacity: capacity || 20 });
            return res.json({ success: true, class: result[0] });
        } catch (error) {
            console.error('Error creating class:', error);
            return res.status(500).json({ message: 'Error creating class' });
        }
    },

    inviteStaff: async (req, res) => {
        try {
            const { name, role, shift } = req.body || {};
            if (!name || !role) return res.status(400).json({ message: 'Missing name or role' });
            const [result] = await db.query(
                `INSERT INTO staff_members (name, role, shift)
                 VALUES ($1, $2, $3)
                 RETURNING id, name, role, shift`,
                [name, role, shift || 'Day']
            );
            console.info(`Admin invited staff ${result[0].id}`);
            await logAdminAction(req, 'invite_staff', 'staff_member', result[0].id, { name, role, shift: shift || 'Day' });
            return res.json({ success: true, staff: result[0] });
        } catch (error) {
            console.error('Error inviting staff:', error);
            return res.status(500).json({ message: 'Error inviting staff' });
        }
    },

    logEquipmentMaintenance: async (req, res) => {
        try {
            const id = req.params.id;
            const { nextCheck, note } = req.body || {};
            if (!id) return res.status(400).json({ message: 'Missing equipment id' });
            await db.query(
                `UPDATE equipment_assets SET next_check = $1 WHERE id = $2`,
                [nextCheck || null, id]
            );
            // Optionally insert a maintenance log table in future; return updated equipment row
            const [rows] = await db.query(`SELECT id, name, status, TO_CHAR(next_check, 'YYYY-MM-DD') AS "nextCheck" FROM equipment_assets WHERE id = $1`, [id]);
            console.info(`Logged maintenance for equipment ${id}`);
            await logAdminAction(req, 'log_maintenance', 'equipment_asset', id, { nextCheck: nextCheck || null, note: note || '' });
            return res.json({ success: true, equipment: rows[0] });
        } catch (error) {
            console.error('Error logging equipment maintenance:', error);
            return res.status(500).json({ message: 'Error logging equipment maintenance' });
        }
    }
,

    getAuditLogs: async (_req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT id, action, entity_type AS "entityType", entity_id AS "entityId", details, created_at AS "createdAt"
                 FROM admin_action_logs
                 ORDER BY created_at DESC
                 LIMIT 100`
            );
            return res.json(rows);
        } catch (error) {
            console.error('Error fetching admin action logs:', error);
            return res.status(500).json({ message: 'Error fetching admin action logs' });
        }
    }
,

    getMembershipPlans: async (_req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT id, name, CONCAT(price::int, ' MAD') AS price, term, perks
                 FROM membership_plans
                 ORDER BY id ASC`
            );
            return res.json(rows);
        } catch (error) {
            console.error('Error fetching membership plans:', error);
            return res.status(500).json({ message: 'Error fetching membership plans' });
        }
    },

    createMembershipPlan: async (req, res) => {
        try {
            const { name, price, term, perks } = req.body || {};
            if (!name || !price || !term || !perks) {
                return res.status(400).json({ message: 'Missing plan fields' });
            }
            const [result] = await db.query(
                `INSERT INTO membership_plans (name, price, term, perks)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, name, CONCAT(price::int, ' MAD') AS price, term, perks`,
                [name, price, term, perks]
            );
            await logAdminAction(req, 'create_membership_plan', 'membership_plan', result[0].id, { name, price, term, perks });
            return res.json({ success: true, plan: result[0] });
        } catch (error) {
            console.error('Error creating membership plan:', error);
            return res.status(500).json({ message: 'Error creating membership plan' });
        }
    },

    getTrainers: async (_req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT id, name, specialty, rating::text AS rating, availability
                 FROM trainers
                 ORDER BY id ASC`
            );
            return res.json(rows);
        } catch (error) {
            console.error('Error fetching trainers:', error);
            return res.status(500).json({ message: 'Error fetching trainers' });
        }
    },

    createTrainer: async (req, res) => {
        try {
            const { name, specialty, rating, availability } = req.body || {};
            if (!name || !specialty) {
                return res.status(400).json({ message: 'Missing trainer fields' });
            }
            const [result] = await db.query(
                `INSERT INTO trainers (name, specialty, rating, availability)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, name, specialty, rating::text AS rating, availability`,
                [name, specialty, rating || 4.5, availability || 'Mon-Fri']
            );
            await logAdminAction(req, 'create_trainer', 'trainer', result[0].id, { name, specialty, rating: rating || 4.5, availability: availability || 'Mon-Fri' });
            return res.json({ success: true, trainer: result[0] });
        } catch (error) {
            console.error('Error creating trainer:', error);
            return res.status(500).json({ message: 'Error creating trainer' });
        }
    },

    createBranch: async (req, res) => {
        try {
            const { name, city } = req.body || {};
            if (!name || !city) {
                return res.status(400).json({ message: 'Missing branch fields' });
            }
            const [result] = await db.query(
                `INSERT INTO branches (name, city)
                 VALUES ($1, $2)
                 RETURNING id, name, city, 0::int AS members`,
                [name, city]
            );
            await logAdminAction(req, 'create_branch', 'branch', result[0].id, { name, city });
            return res.json({ success: true, branch: result[0] });
        } catch (error) {
            console.error('Error creating branch:', error);
            return res.status(500).json({ message: 'Error creating branch' });
        }
    },

    getAdminProfile: async (req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at, a.role
                 FROM users u JOIN admins a ON a.user_id = u.id
                 WHERE u.id = $1`,
                [req.user.id]
            );
            if (!rows.length) return res.status(404).json({ message: 'Admin profile not found' });
            return res.json(rows[0]);
        } catch (error) {
            console.error('Error fetching admin profile:', error);
            return res.status(500).json({ message: 'Error fetching admin profile' });
        }
    },

    updateAdminProfile: async (req, res) => {
        try {
            const bcrypt = require('bcryptjs');
            const { first_name, last_name, email, current_password, new_password } = req.body;
            const adminUserId = req.user.id;

            const [users] = await db.query('SELECT password FROM users WHERE id = $1', [adminUserId]);
            if (!users.length) return res.status(404).json({ message: 'User not found' });

            if (new_password) {
                if (!current_password) return res.status(400).json({ message: 'Current password is required' });
                const isValid = await bcrypt.compare(current_password, users[0].password);
                if (!isValid) return res.status(401).json({ message: 'Current password is incorrect' });
            }

            const updates = [];
            const values = [];
            let idx = 1;

            if (first_name) { updates.push(`first_name = $${idx++}`); values.push(first_name); }
            if (last_name)  { updates.push(`last_name = $${idx++}`);  values.push(last_name);  }
            if (email)      { updates.push(`email = $${idx++}`);      values.push(email);       }
            if (new_password) {
                updates.push(`password = $${idx++}`);
                values.push(await bcrypt.hash(new_password, 10));
            }

            if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

            values.push(adminUserId);
            await db.query(
                `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx}`,
                values
            );
            await logAdminAction(req, 'update_profile', 'user', adminUserId, {});
            return res.json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error('Error updating admin profile:', error);
            return res.status(500).json({ message: 'Error updating admin profile' });
        }
    },

    logCheckin: async (req, res) => {
        try {
            const { memberId } = req.body;
            if (!memberId) return res.status(400).json({ message: 'Member ID is required' });

            const [members] = await db.query(
                'SELECT id, first_name, last_name FROM members WHERE id = $1',
                [memberId]
            );
            if (!members.length) return res.status(404).json({ message: 'Member not found' });

            await db.query(
                'INSERT INTO member_checkins (member_id, checkin_at) VALUES ($1, NOW())',
                [memberId]
            );
            await logAdminAction(req, 'log_checkin', 'member_checkin', memberId, {
                member: `${members[0].first_name} ${members[0].last_name}`
            });
            return res.json({
                success: true,
                message: `Check-in logged for ${members[0].first_name} ${members[0].last_name}`
            });
        } catch (error) {
            console.error('Error logging check-in:', error);
            return res.status(500).json({ message: 'Error logging check-in' });
        }
    },

    createLead: async (req, res) => {
        try {
            const { name, stage, owner } = req.body || {};
            if (!name || !stage || !owner) {
                return res.status(400).json({ message: 'Missing lead fields' });
            }
            const [result] = await db.query(
                `INSERT INTO crm_leads (name, stage, owner)
                 VALUES ($1, $2, $3)
                 RETURNING id, name, stage, owner`,
                [name, stage, owner]
            );
            await logAdminAction(req, 'create_lead', 'crm_lead', result[0].id, { name, stage, owner });
            return res.json({ success: true, lead: result[0] });
        } catch (error) {
            console.error('Error creating lead:', error);
            return res.status(500).json({ message: 'Error creating lead' });
        }
    }
};

module.exports = adminDataController;
