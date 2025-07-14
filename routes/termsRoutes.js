import express from "express";
import {
  createTerms,
  getAllTerms,
  getTermsById,
  updateTerms,
  getActiveTerms,
  getTermsByVersion,
  getAllVersions,
  acceptTerms,
  getUserAcceptedTerms,
  setActiveVersion,
} from "../controllers/index.js";
import { authMiddleware } from "../middlewares/index.js";

const termsRouter = express.Router();

// Public routes (no authentication required)
termsRouter.get("/active", getActiveTerms);
termsRouter.get("/public", getActiveTerms); // Alias for active
termsRouter.get("/public/:version", getTermsByVersion); // Public version access
termsRouter.get("/versions", getAllVersions);
termsRouter.get("/version/:version", getTermsByVersion);
termsRouter.post("/accept", acceptTerms);
termsRouter.get("/user/:userId/accepted", getUserAcceptedTerms);

// Protected routes (admin only)
termsRouter.use(authMiddleware);
termsRouter.post("/", createTerms);
termsRouter.get("/", getAllTerms);
termsRouter.get("/:id", getTermsById);
termsRouter.put("/:id", updateTerms);
termsRouter.post("/:id/activate", setActiveVersion);
// Note: No delete route - terms cannot be deleted, only deactivated

export { termsRouter };
