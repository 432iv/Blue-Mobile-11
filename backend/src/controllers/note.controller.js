const noteService = require('../services/note.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json({ notes: await noteService.list(req.query.sessionId || '') });
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json({ note: await noteService.create(req.body) });
});

const remove = asyncHandler(async (req, res) => {
  res.json({ deleted: await noteService.remove(req.params.id) });
});

module.exports = { list, create, remove };
