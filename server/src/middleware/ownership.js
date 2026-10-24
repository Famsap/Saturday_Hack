const ApiError = require('../utils/ApiError');
const prisma = require('../config/prisma');

const checkOfferingOwnership = async (req, res, next) => {
  try {
    const offeringId = parseInt(req.params.id || req.params.offeringId, 10);
    if (isNaN(offeringId)) {
      return next(new ApiError(400, 'Invalid offering ID'));
    }

    const offering = await prisma.offering.findUnique({
      where: { id: offeringId },
    });

    if (!offering) {
      return next(new ApiError(404, 'Offering not found'));
    }

    if (req.user.role !== 'FACULTY' || offering.facultyId !== req.user.id) {
      return next(new ApiError(403, 'Forbidden: You do not own this offering'));
    }

    req.offering = offering;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkOfferingOwnership };
