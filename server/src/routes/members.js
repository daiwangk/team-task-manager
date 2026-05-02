const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();
const prisma = new PrismaClient();

// List members
router.get('/:id/members', authenticate, requireRole(), async (req, res) => {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId: req.params.id },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add member by email
router.post('/:id/members', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found with that email' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id, userId: user.id } }
    });
    if (existing) return res.status(400).json({ error: 'User is already a member' });

    const member = await prisma.projectMember.create({
      data: {
        projectId: req.params.id,
        userId: user.id,
        role: role || 'MEMBER'
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change member role
router.put('/:id/members/:userId', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const member = await prisma.projectMember.update({
      where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member
router.delete('/:id/members/:userId', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } }
    });
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
