const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

/**
 * Daily notes belong to a sales day (session). They are independent
 * of products/sales/inventory — just time-stamped free text.
 */

async function list(sessionId) {
  let targetSessionId = sessionId;
  if (!targetSessionId) {
    const open = await prisma.daySession.findFirst({ where: { status: 'open' } });
    targetSessionId = open ? open.id : null;
  }
  if (!targetSessionId) return [];

  return prisma.dailyNote.findMany({
    where: { sessionId: targetSessionId },
    orderBy: { createdAt: 'asc' },
  });
}

async function create({ sessionId, text }) {
  let targetSessionId = sessionId;
  if (!targetSessionId) {
    const open = await prisma.daySession.findFirst({ where: { status: 'open' } });
    if (!open) throw new AppError(400, 'No day is open. Start a new day first.', 'NO_OPEN_SESSION');
    targetSessionId = open.id;
  }

  return prisma.dailyNote.create({
    data: { sessionId: targetSessionId, text },
  });
}

async function remove(id) {
  const note = await prisma.dailyNote.findUnique({ where: { id } });
  if (!note) throw new AppError(404, 'Note not found.', 'NOTE_NOT_FOUND');
  await prisma.dailyNote.delete({ where: { id } });
  return { id };
}

module.exports = { list, create, remove };
