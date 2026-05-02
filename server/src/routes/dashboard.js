const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      select: { projectId: true }
    });
    const projectIds = memberships.map(m => m.projectId);

    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    const now = new Date();
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === 'TODO').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const done = tasks.filter(t => t.status === 'DONE').length;
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length;

    const overdueTasks = tasks
      .filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 10);

    const myTasks = tasks
      .filter(t => t.assignedToId === req.user.id && t.status !== 'DONE')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(0, 10);

    const projectSummary = {};
    tasks.forEach(t => {
      if (!projectSummary[t.projectId]) {
        projectSummary[t.projectId] = { name: t.project.name, id: t.projectId, todo: 0, inProgress: 0, done: 0 };
      }
      if (t.status === 'TODO') projectSummary[t.projectId].todo++;
      else if (t.status === 'IN_PROGRESS') projectSummary[t.projectId].inProgress++;
      else projectSummary[t.projectId].done++;
    });

    res.json({
      stats: { total, todo, inProgress, done, overdue, projectCount: projectIds.length },
      overdueTasks,
      myTasks,
      projectSummary: Object.values(projectSummary)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
