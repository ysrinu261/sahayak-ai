const express = require("express");
const requireAuth = require("../middleware/auth");
const { createTriage, syncOfflineTriage, getHistory } = require("../controllers/triageController");

const router = express.Router();

router.use(requireAuth);

router.post("/", createTriage);
router.post("/sync", syncOfflineTriage);
router.get("/history", getHistory);

module.exports = router;
