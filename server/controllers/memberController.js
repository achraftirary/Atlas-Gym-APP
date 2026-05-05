const bcrypt = require('bcryptjs');
const db = require('../config/db');

const memberController = {
  getAllMembers: async (req, res) => {
    try {
      const [members] = await db.query(
        `SELECT id, first_name, last_name, email, created_at, 'member'::text as user_type FROM members ORDER BY created_at DESC`
      );
      res.json(members);
    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ message: 'Error fetching members' });
    }
  },

  getMember: async (req, res) => {
    try {
      const [members] = await db.query(
        `SELECT id, first_name, last_name, email, created_at FROM members WHERE id = $1`,
        [req.params.id]
      );
      if (members.length === 0) return res.status(404).json({ message: 'Member not found' });
      res.json(members[0]);
    } catch (error) {
      console.error('Error fetching member:', error);
      res.status(500).json({ message: 'Error fetching member' });
    }
  },

  createMember: async (req, res) => {
    try {
      const { first_name, last_name, email, password } = req.body;
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }
      const [existing] = await db.query('SELECT id FROM members WHERE email = $1', [email]);
      if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const [rows] = await db.query(
        'INSERT INTO members (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id',
        [first_name, last_name, email, hashedPassword]
      );
      res.status(201).json({ id: rows[0].id, first_name, last_name, email });
    } catch (error) {
      console.error('Error creating member:', error);
      res.status(500).json({ message: 'Error creating member' });
    }
  },

  updateMember: async (req, res) => {
    try {
      const { first_name, last_name, email, password } = req.body;
      const memberId = req.params.id;
      if (!first_name || !last_name || !email) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }
      const [existing] = await db.query('SELECT id FROM members WHERE id = $1', [memberId]);
      if (existing.length === 0) return res.status(404).json({ message: 'Member not found' });

      if (password) {
        const hashed = await bcrypt.hash(password, 10);
        await db.query(
          'UPDATE members SET first_name=$1, last_name=$2, email=$3, password=$4, updated_at=NOW() WHERE id=$5',
          [first_name, last_name, email, hashed, memberId]
        );
      } else {
        await db.query(
          'UPDATE members SET first_name=$1, last_name=$2, email=$3, updated_at=NOW() WHERE id=$4',
          [first_name, last_name, email, memberId]
        );
      }
      res.json({ id: memberId, first_name, last_name, email });
    } catch (error) {
      console.error('Error updating member:', error);
      res.status(500).json({ message: 'Error updating member' });
    }
  },

  deleteMember: async (req, res) => {
    try {
      const memberId = req.params.id;
      const [existing] = await db.query('SELECT id FROM members WHERE id = $1', [memberId]);
      if (existing.length === 0) return res.status(404).json({ message: 'Member not found' });
      await db.query('DELETE FROM members WHERE id = $1', [memberId]);
      res.json({ message: 'Member deleted successfully' });
    } catch (error) {
      console.error('Error deleting member:', error);
      res.status(500).json({ message: 'Error deleting member' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const [users] = await db.query(
        `SELECT id, first_name, last_name, email, created_at FROM members WHERE id = $1`,
        [req.user.id]
      );
      if (users.length === 0) return res.status(404).json({ message: 'Profile not found' });
      res.json(users[0]);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { first_name, last_name, email, current_password, new_password } = req.body;
      const userId = req.user.id;

      const [users] = await db.query('SELECT password FROM members WHERE id = $1', [userId]);
      if (users.length === 0) return res.status(404).json({ message: 'User not found' });

      if (new_password) {
        if (!current_password) {
          return res.status(400).json({ message: 'Current password is required to set a new password' });
        }
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

      values.push(userId);
      await db.query(
        `UPDATE members SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx}`,
        values
      );

      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  }
};

module.exports = memberController;
