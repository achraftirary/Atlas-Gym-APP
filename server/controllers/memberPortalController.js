const db = require('../config/db');

const formatDateLabel = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBD';

    return date.toLocaleString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const calculateStreak = (dateRows) => {
    if (!dateRows.length) return 0;

    const dates = [...new Set(dateRows.map((row) => row.check_date))]
        .map((d) => new Date(d))
        .filter((d) => !Number.isNaN(d.getTime()))
        .sort((a, b) => b.getTime() - a.getTime());

    if (!dates.length) return 0;

    let streak = 1;
    for (let i = 1; i < dates.length; i += 1) {
        const prev = dates[i - 1];
        const current = dates[i];
        const diffDays = Math.round((prev - current) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak += 1;
        } else {
            break;
        }
    }

    return streak;
};

const memberPortalController = {
    getDashboard: async (req, res) => {
        try {
            if (req.user.user_type !== 'member') {
                return res.status(403).json({ message: 'Member access required' });
            }

            const memberId = req.user.id;

            const [memberRows] = await db.query(
                'SELECT id, first_name, last_name, email, created_at FROM members WHERE id = $1',
                [memberId]
            );

            if (!memberRows.length) {
                return res.status(404).json({ message: 'Member profile not found' });
            }

            const member = memberRows[0];

            const [subscriptionRows] = await db.query(
                `SELECT id, member_id, start_date, end_date, status
                 FROM subscriptions
                 WHERE member_id = $1
                 ORDER BY end_date DESC
                 LIMIT 1`,
                [memberId]
            );

            let subscription = null;
            if (subscriptionRows.length) {
                const current = subscriptionRows[0];
                const endDate = new Date(current.end_date);
                const now = new Date();
                const daysRemaining = Math.max(Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)), 0);
                subscription = {
                    ...current,
                    days_remaining: daysRemaining
                };
            }

            const [upcomingClasses] = await db.query(
                `SELECT
                    cs.id,
                    cs.title,
                    cs.coach,
                    cs.start_time,
                    cs.capacity,
                    COUNT(cb.id) FILTER (WHERE cb.status = 'booked')::int AS booked_count,
                    COALESCE(MAX(CASE WHEN cb.member_id = $1 AND cb.status = 'booked' THEN 1 ELSE 0 END), 0)::int AS is_booked
                 FROM class_sessions cs
                 LEFT JOIN class_bookings cb ON cb.class_session_id = cs.id
                 WHERE cs.start_time > NOW()
                 GROUP BY cs.id, cs.title, cs.coach, cs.start_time, cs.capacity
                 ORDER BY cs.start_time ASC
                 LIMIT 6`,
                [memberId]
            );

            const classes = upcomingClasses.map((item) => ({
                id: item.id,
                title: item.title,
                coach: item.coach,
                start: formatDateLabel(item.start_time),
                spots_left: Math.max(item.capacity - item.booked_count, 0),
                is_booked: item.is_booked === 1
            }));

            const [checkinRows] = await db.query(
                `SELECT DATE(checkin_at) AS check_date
                 FROM member_checkins
                 WHERE member_id = $1
                 ORDER BY DATE(checkin_at) DESC
                 LIMIT 30`,
                [memberId]
            );

            const [rewardRows] = await db.query(
                `SELECT COALESCE(SUM(points), 0)::int AS total_points
                 FROM member_rewards
                 WHERE member_id = $1`,
                [memberId]
            );

            const [referralRows] = await db.query(
                `SELECT COALESCE(SUM(reward_amount), 0)::float AS wallet
                 FROM member_referrals
                 WHERE referrer_member_id = $1
                   AND status = 'converted'`,
                [memberId]
            );

            const checkinStreak = calculateStreak(checkinRows);
            const totalPoints = rewardRows[0]?.total_points || 0;
            const referralWallet = referralRows[0]?.wallet || 0;
            const bookedCount = classes.filter((c) => c.is_booked).length;
            const visitsCount = checkinRows.length;
            const progressScore = Math.min(100, 20 + visitsCount * 4 + bookedCount * 8 + Math.floor(totalPoints / 100));

            const offers = [];
            if (!subscription || subscription.status !== 'active') {
                offers.push('Upgrade to an active plan to unlock premium classes.');
            }
            if (totalPoints >= 500) {
                offers.push(`You have ${totalPoints} points available. Redeem rewards this week.`);
            }
            if (referralWallet < 300) {
                offers.push('Invite 3 friends this month to boost your referral wallet.');
            }

            const dashboard = {
                member,
                subscription,
                kpis: {
                    checkin_streak: checkinStreak,
                    loyalty_points: totalPoints,
                    progress_score: progressScore,
                    referral_wallet: Number(referralWallet.toFixed(2))
                },
                referral: {
                    code: `ATLAS-${memberId}-2026`,
                    wallet: Number(referralWallet.toFixed(2))
                },
                upcoming_classes: classes,
                offers
            };

            return res.json(dashboard);
        } catch (error) {
            console.error('Error loading member dashboard:', error);
            return res.status(500).json({ message: 'Error loading member dashboard' });
        }
    },

    bookClass: async (req, res) => {
        try {
            if (req.user.user_type !== 'member') {
                return res.status(403).json({ message: 'Member access required' });
            }

            const memberId = req.user.id;
            const classId = Number(req.params.classId);

            if (!classId || Number.isNaN(classId)) {
                return res.status(400).json({ message: 'Invalid class session id' });
            }

            const [sessionRows] = await db.query(
                `SELECT id, capacity FROM class_sessions WHERE id = $1 AND start_time > NOW()`,
                [classId]
            );

            if (!sessionRows.length) {
                return res.status(404).json({ message: 'Class session not found or already started' });
            }

            const [countRows] = await db.query(
                `SELECT COUNT(*)::int AS booked
                 FROM class_bookings
                 WHERE class_session_id = $1 AND status = 'booked'`,
                [classId]
            );

            const currentBooked = countRows[0]?.booked || 0;
            if (currentBooked >= sessionRows[0].capacity) {
                return res.status(400).json({ message: 'No spots left for this class' });
            }

            await db.query(
                `INSERT INTO class_bookings (class_session_id, member_id, status)
                 VALUES ($1, $2, 'booked')
                 ON CONFLICT (class_session_id, member_id)
                 DO UPDATE SET status = 'booked'`,
                [classId, memberId]
            );

            return res.json({ message: 'Class booked successfully' });
        } catch (error) {
            console.error('Error booking class:', error);
            return res.status(500).json({ message: 'Error booking class' });
        }
    }
};

module.exports = memberPortalController;
