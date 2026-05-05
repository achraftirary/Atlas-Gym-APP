const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const memberController = require('../controllers/memberController');
const authController = require('../controllers/authController');
const subscriptionController = require('../controllers/subscriptionController');
const membershipController = require('../controllers/membershipController');
const memberPortalController = require('../controllers/memberPortalController');
const adminDataController = require('../controllers/adminDataController');

// Public Auth Routes
router.post('/auth/admin/login', authController.adminLogin);
router.post('/auth/member/login', authController.memberLogin);
router.post('/auth/register', authController.register);
router.post('/auth/logout', auth, authController.logout);

// Protected Member Routes
router.get('/members/profile', auth, memberController.getProfile);
router.put('/members/profile', auth, memberController.updateProfile);
router.get('/members/subscription', auth, subscriptionController.getMySubscription);
router.get('/members/dashboard', auth, memberPortalController.getDashboard);
router.post('/members/classes/:classId/book', auth, memberPortalController.bookClass);

// Protected Admin Routes
router.get('/members', adminAuth, memberController.getAllMembers);
router.post('/members', adminAuth, memberController.createMember);
router.get('/members/:id', adminAuth, memberController.getMember);
router.put('/members/:id', adminAuth, memberController.updateMember);
router.delete('/members/:id', adminAuth, memberController.deleteMember);

// Admin profile routes
router.get('/admin/profile', adminAuth, adminDataController.getAdminProfile);
router.put('/admin/profile', adminAuth, adminDataController.updateAdminProfile);
router.post('/admin/checkin', adminAuth, adminDataController.logCheckin);

// Admin data routes (live dashboard modules)
router.get('/admin/overview', adminAuth, adminDataController.getOverviewData);
router.get('/admin/payments', adminAuth, adminDataController.getPayments);
router.post('/admin/payments/:id/mark-paid', adminAuth, adminDataController.markPaymentPaid);
router.get('/admin/classes', adminAuth, adminDataController.getClasses);
router.get('/admin/attendance', adminAuth, adminDataController.getAttendance);
router.get('/admin/equipment', adminAuth, adminDataController.getEquipment);
router.get('/admin/leads', adminAuth, adminDataController.getLeads);
router.get('/admin/staff', adminAuth, adminDataController.getStaff);
router.get('/admin/branches', adminAuth, adminDataController.getBranches);
router.get('/admin/memberships', adminAuth, adminDataController.getMembershipPlans);
router.get('/admin/trainers', adminAuth, adminDataController.getTrainers);
router.get('/admin/audit-logs', adminAuth, adminDataController.getAuditLogs);
router.post('/admin/payments/:id/mark-paid', adminAuth, adminDataController.markPaymentPaid);
router.post('/admin/classes', adminAuth, adminDataController.createClass);
router.post('/admin/staff/invite', adminAuth, adminDataController.inviteStaff);
router.post('/admin/equipment/:id/log-maintenance', adminAuth, adminDataController.logEquipmentMaintenance);
router.post('/admin/branches', adminAuth, adminDataController.createBranch);
router.post('/admin/leads', adminAuth, adminDataController.createLead);
router.post('/admin/memberships', adminAuth, adminDataController.createMembershipPlan);
router.post('/admin/trainers', adminAuth, adminDataController.createTrainer);

// Membership Routes (Protected Admin Routes)
router.post('/memberships', adminAuth, membershipController.createMembership);
router.get('/memberships/member/:memberId', adminAuth, membershipController.getMembershipByMemberId);
router.put('/memberships/:id', adminAuth, membershipController.updateMembership);
router.put('/memberships/:id/cancel', adminAuth, membershipController.cancelMembership);

module.exports = router;