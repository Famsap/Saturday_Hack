const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/role');

const notImplemented = (resource) => (req, res) => {
  res.status(501).json({
    success: false,
    message: `Endpoint for ${resource} is scaffolded. Logic pending implementation.`,
  });
};

// Section routes
const sectionRouter = express.Router();
sectionRouter.use(auth, roleGuard('FACULTY'));
sectionRouter.get('/', notImplemented('GET /api/sections'));
sectionRouter.post('/', notImplemented('POST /api/sections'));
sectionRouter.get('/:id', notImplemented('GET /api/sections/:id'));
sectionRouter.put('/:id', notImplemented('PUT /api/sections/:id'));
sectionRouter.delete('/:id', notImplemented('DELETE /api/sections/:id'));

// Subject routes
const subjectRouter = express.Router();
subjectRouter.use(auth, roleGuard('FACULTY'));
subjectRouter.get('/', notImplemented('GET /api/subjects'));
subjectRouter.post('/', notImplemented('POST /api/subjects'));
subjectRouter.get('/:id', notImplemented('GET /api/subjects/:id'));
subjectRouter.put('/:id', notImplemented('PUT /api/subjects/:id'));
subjectRouter.delete('/:id', notImplemented('DELETE /api/subjects/:id'));

// Offering routes
const offeringRouter = express.Router();
offeringRouter.use(auth, roleGuard('FACULTY'));
offeringRouter.get('/', notImplemented('GET /api/offerings'));
offeringRouter.post('/', notImplemented('POST /api/offerings'));
offeringRouter.get('/:id', notImplemented('GET /api/offerings/:id'));
offeringRouter.put('/:id', notImplemented('PUT /api/offerings/:id'));
offeringRouter.delete('/:id', notImplemented('DELETE /api/offerings/:id'));
offeringRouter.post('/:id/sessions', notImplemented('POST /api/offerings/:id/sessions'));
offeringRouter.get('/:id/sessions', notImplemented('GET /api/offerings/:id/sessions'));
offeringRouter.post('/:id/assessments', notImplemented('POST /api/offerings/:id/assessments'));
offeringRouter.get('/:id/assessments', notImplemented('GET /api/offerings/:id/assessments'));
offeringRouter.get('/:id/stats', notImplemented('GET /api/offerings/:id/stats'));
offeringRouter.get('/:id/at-risk', notImplemented('GET /api/offerings/:id/at-risk'));

// Student routes
const studentRouter = express.Router();
studentRouter.use(auth, roleGuard('FACULTY'));
studentRouter.get('/', notImplemented('GET /api/students'));
studentRouter.post('/', notImplemented('POST /api/students'));
studentRouter.post('/import', notImplemented('POST /api/students/import'));
studentRouter.get('/:id', notImplemented('GET /api/students/:id'));
studentRouter.put('/:id', notImplemented('PUT /api/students/:id'));
studentRouter.delete('/:id', notImplemented('DELETE /api/students/:id'));
studentRouter.get('/:id/remarks', notImplemented('GET /api/students/:id/remarks'));
studentRouter.post('/:id/remarks', notImplemented('POST /api/students/:id/remarks'));
studentRouter.get('/:id/dashboard', notImplemented('GET /api/students/:id/dashboard'));

// Session attendance & lock routes
const sessionRouter = express.Router();
sessionRouter.use(auth, roleGuard('FACULTY'));
sessionRouter.get('/:sid/sheet', notImplemented('GET /api/sessions/:sid/sheet'));
sessionRouter.put('/:sid/attendance', notImplemented('PUT /api/sessions/:sid/attendance'));
sessionRouter.post('/:sid/reopen', notImplemented('POST /api/sessions/:sid/reopen'));
sessionRouter.put('/:sid/lock', notImplemented('PUT /api/sessions/:sid/lock'));

// Assessment marks & publish routes
const assessmentRouter = express.Router();
assessmentRouter.use(auth, roleGuard('FACULTY'));
assessmentRouter.put('/:aid', notImplemented('PUT /api/assessments/:aid'));
assessmentRouter.delete('/:aid', notImplemented('DELETE /api/assessments/:aid'));
assessmentRouter.post('/:aid/publish', notImplemented('POST /api/assessments/:aid/publish'));
assessmentRouter.get('/:aid/marks', notImplemented('GET /api/assessments/:aid/marks'));
assessmentRouter.put('/:aid/marks', notImplemented('PUT /api/assessments/:aid/marks'));

// Student dashboard me route
const meRouter = express.Router();
meRouter.use(auth, roleGuard('STUDENT'));
meRouter.get('/dashboard', notImplemented('GET /api/me/dashboard'));

module.exports = {
  sectionRouter,
  subjectRouter,
  offeringRouter,
  studentRouter,
  sessionRouter,
  assessmentRouter,
  meRouter,
};
