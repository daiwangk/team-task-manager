const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();
const prisma = new PrismaClient();

// List tasks for project
router.get('/:id/tasks', authenticate, requireRole(), async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const where = { projectId: req.params.id };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task
router.post('/:id/tasks', authenticate, requireRole(), async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required' });

    if (assignedTo) {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: req.params.id, userId: assignedTo } }
      });
      if (!isMember) return res.status(400).json({ error: 'Assignee is not a project member' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: req.params.id,
        assignedToId: assignedTo || null,
        createdById: req.user.id
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task
router.put('/:id/tasks/:taskId', authenticate, requireRole(), async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Members can only update tasks assigned to them
    if (req.membership.role === 'MEMBER' && task.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'You can only update tasks assigned to you' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedTo !== undefined) data.assignedToId = assignedTo;

    const updated = await prisma.task.update({
      where: { id: req.params.taskId },
      data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
router.delete('/:id/tasks/:taskId', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
