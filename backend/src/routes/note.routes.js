const { Router } = require('express');
const noteController = require('../controllers/note.controller');
const { verifyAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { noteSchema, noteListQuery } = require('../validators/note.validator');
const { idParam } = require('../validators/common');

const router = Router();

router.use(verifyAuth);

router.get('/', validate({ query: noteListQuery }), noteController.list);
router.post('/', validate({ body: noteSchema }), noteController.create);
router.delete('/:id', validate({ params: idParam }), noteController.remove);

module.exports = router;
