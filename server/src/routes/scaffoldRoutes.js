const express = require('express');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/role');

const sectionController = require('../controllers/sectionController');
const subjectController = require('../controllers/subjectController');
const offeringController = require('../controllers/offeringController');
const studentController = require('../controllers/studentController');
const sessionController = require('../controllers/sessionController');
const assessmentController = require('../controllers/assessmentController');
const meController = require('../controllers/meController');

// Section routes
const sectionRouter = express.Router();
sectionRouter.use(auth, roleGuard('FACULTY'));
sectionRouter.get('/', sectionController.getSections);
sectionRouter.post('/', sectionController.createSection);
sectionRouter.get('/:id', sectionController.getSectionById);
sectionRouter.put('/:id', sectionController.updateSection);
sectionRouter.delete('/:id', sectionController.deleteSection);

// Subject routes
const subjectRouter = express.Router();
subjectRouter.use(auth, roleGuard('FACULTY'));
subjectRouter.get('/', subjectController.getSubjects);
subjectRouter.post('/', subjectController.createSubject);
subjectRouter.get('/:id', subjectController.getSubjectById);
subjectRouter.put('/:id', subjectController.updateSubject);
subjectRouter.delete('/:id', subjectController.deleteSubject);

// Offering routes
const offeringRouter = express.Router();
offeringRouter.use(auth, roleGuard('FACULTY'));
offeringRouter.get('/', offeringController.getOfferings);
offeringRouter.post('/', offeringController.createOffering);
offeringRouter.get('/:id', offeringController.getOfferingById);
offeringRouter.put('/:id', offeringController.updateOffering);
offeringRouter.delete('/:id', offeringController.deleteOffering);
offeringRouter.get('/:id/sessions', offeringController.getOfferingSessions);
offeringRouter.post('/:id/sessions', offeringController.createOfferingSession);
offeringRouter.get('/:id/assessments', offeringController.getOfferingAssessments);
offeringRouter.post('/:id/assessments', offeringController.createOfferingAssessment);
offeringRouter.get('/:id/stats', offeringController.getOfferingStats);
offeringRouter.get('/:id/at-risk', offeringController.getOfferingAtRisk);

// Student routes
const studentRouter = express.Router();
studentRouter.use(auth, roleGuard('FACULTY'));
studentRouter.get('/', studentController.getStudents);
studentRouter.post('/', studentController.createStudent);
studentRouter.post('/import', studentController.importStudents);
studentRouter.get('/:id', studentController.getStudentById);
studentRouter.put('/:id', studentController.updateStudent);
studentRouter.delete('/:id', studentController.deleteStudent);
studentRouter.get('/:id/remarks', studentController.getStudentRemarks);
studentRouter.post('/:id/remarks', studentController.createStudentRemark);

// Session attendance & lock routes
const sessionRouter = express.Router();
sessionRouter.use(auth, roleGuard('FACULTY'));
sessionRouter.get('/:sid/sheet', sessionController.getSessionSheet);
sessionRouter.put('/:sid/attendance', sessionController.updateSessionAttendance);
sessionRouter.put('/:sid/lock', sessionController.lockSession);
sessionRouter.post('/:sid/reopen', sessionController.reopenSession);

// Assessment marks & publish routes
const assessmentRouter = express.Router();
assessmentRouter.use(auth, roleGuard('FACULTY'));
assessmentRouter.put('/:aid', assessmentController.updateAssessment);
assessmentRouter.delete('/:aid', assessmentController.deleteAssessment);
assessmentRouter.post('/:aid/publish', assessmentController.publishAssessment);
assessmentRouter.get('/:aid/marks', assessmentController.getAssessmentMarks);
assessmentRouter.put('/:aid/marks', assessmentController.updateAssessmentMarks);

// Student dashboard me route
const meRouter = express.Router();
meRouter.use(auth, roleGuard('STUDENT'));
meRouter.get('/dashboard', meController.getStudentDashboard);

module.exports = {
  sectionRouter,
  subjectRouter,
  offeringRouter,
  studentRouter,
  sessionRouter,
  assessmentRouter,
  meRouter,
};

