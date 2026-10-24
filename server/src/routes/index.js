const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const {
  sectionRouter,
  subjectRouter,
  offeringRouter,
  studentRouter,
  sessionRouter,
  assessmentRouter,
  meRouter,
} = require('./scaffoldRoutes');

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/sections', sectionRouter);
router.use('/subjects', subjectRouter);
router.use('/offerings', offeringRouter);
router.use('/students', studentRouter);
router.use('/sessions', sessionRouter);
router.use('/assessments', assessmentRouter);
router.use('/me', meRouter);

module.exports = router;
