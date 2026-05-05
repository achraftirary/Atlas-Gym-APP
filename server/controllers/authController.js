const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Define JWT secret locally
const JWT_SECRET = 'gym_management_secure_jwt_secret_key_2024';

// Store active sessions
const activeSessions = new Map();

const authController = {
  adminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
      }

      // Check admin in users table first, then join with admins
      const [admins] = await db.query(`
        SELECT 
          u.id,
          u.email,
          u.password,
          u.first_name,
          u.last_name,
          u.user_type,
          a.user_id as admin_id,
          a.role,
          a.last_login
        FROM users u
        INNER JOIN admins a ON u.id = a.user_id
        WHERE u.email = $1 AND u.user_type = 'admin'
      `, [email]);

      const admin = admins[0];
      
      if (!admin) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      // Update last login time
      await db.query(`
        UPDATE admins 
        SET last_login = CURRENT_TIMESTAMP 
        WHERE user_id = $1
      `, [admin.id]);

      // Create token
      const token = jwt.sign(
        { 
          id: admin.id,
          email: admin.email,
          user_type: 'admin'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Store session
      activeSessions.set(admin.id, {
        token,
        loginTime: new Date(),
        lastActivity: new Date()
      });

      // Send response
      res.json({
        token,
        user_type: 'admin',
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        admin_id: admin.admin_id,
        role: admin.role,
        last_login: admin.last_login,
        shouldRefresh: true
      });

    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Server error during admin login' });
    }
  },

  memberLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
      }

      // Get member directly from members table
      const [members] = await db.query(`
        SELECT * FROM members 
        WHERE email = $1
      `, [email]);

      const member = members[0];
      
      if (!member) {
        return res.status(401).json({ message: 'Invalid member credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, member.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid member credentials' });
      }

      // Create token
      const token = jwt.sign(
        { 
          id: member.id,
          email: member.email,
          user_type: 'member'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Store session
      activeSessions.set(member.id, {
        token,
        loginTime: new Date(),
        lastActivity: new Date()
      });

      // Get subscription status
      const [subscriptions] = await db.query(
        'SELECT * FROM subscriptions WHERE member_id = $1 ORDER BY end_date DESC LIMIT 1',
        [member.id]
      );

      // Send response
      res.json({
        token,
        user_type: 'member',
        id: member.id,
        email: member.email,
        first_name: member.first_name,
        last_name: member.last_name,
        subscription: subscriptions[0] || null,
        shouldRefresh: true
      });

    } catch (error) {
      console.error('Member login error:', error);
      res.status(500).json({ message: 'Server error during member login' });
    }
  },

  logout: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Remove session
      activeSessions.delete(userId);
      
      // Send response with refresh flag
      res.json({ 
        message: 'Logged out successfully',
        shouldRefresh: true
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error during logout' });
    }
  },

  register: async (req, res) => {
    try {
      const { first_name, last_name, email, password } = req.body;

      // Validate input
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }

      // Check if member already exists
      const [existingMembers] = await db.query('SELECT id FROM members WHERE email = $1', [email]);
      if (existingMembers.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert directly into members table
        const [memberRows] = await connection.query(
          `INSERT INTO members (
            first_name,
            last_name,
            email,
            password
          ) VALUES ($1, $2, $3, $4)
          RETURNING id`,
          [first_name, last_name, email, hashedPassword]
        );

        // Create default 1-month subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        await connection.query(
          `INSERT INTO subscriptions (member_id, start_date, end_date, status)
           VALUES ($1, $2, $3, 'pending')`,
          [memberRows[0].id, startDate, endDate]
        );

        // Get the created subscription
        const [subscriptions] = await db.query(
          'SELECT * FROM subscriptions WHERE member_id = $1',
          [memberRows[0].id]
        );

        // Create token
        const token = jwt.sign(
          { 
            id: memberRows[0].id,
            email: email,
            user_type: 'member'
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Store session
        activeSessions.set(memberRows[0].id, {
          token,
          loginTime: new Date(),
          lastActivity: new Date()
        });

        // Commit transaction
        await connection.commit();

        // Send response with refresh flag
        res.status(201).json({
          token,
          user_type: 'member',
          id: memberRows[0].id,
          email,
          first_name,
          last_name,
          subscription: subscriptions[0],
          shouldRefresh: true
        });

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  },

  // Function to check if a token is valid and belongs to an active session
  isValidSession: (userId, token) => {
    const session = activeSessions.get(userId);
    return session && session.token === token;
  }
};

module.exports = authController; 