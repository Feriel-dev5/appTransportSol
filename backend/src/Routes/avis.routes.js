const { Router } = require("express");
const { createAvis, listAvis } = require("../Controllers/avis.controller");
const { validateRequest } = require("../utils/validateRequest");
const {
  createAvisSchema,
  listAvisSchema,
} = require("../Validation/avis.validation");
const { verifyToken } = require("../middlewares/verifyToken");
const router = Router();

router.post("/", verifyToken, validateRequest(createAvisSchema), createAvis);
router.get("/", verifyToken, validateRequest(listAvisSchema), listAvis);

module.exports = router;
