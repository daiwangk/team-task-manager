const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireRole(...roles) {
  return async (req, res, next) => {
    const projectId = req.params.id;
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    try {
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId: req.user.id }
        }
      });

      if (!membership) return res.status(403).json({ error: 'Not a member of this project' });
      if (roles.length > 0 && !roles.includes(membership.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.membership = membership;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };
}

module.exports = { requireRole };
