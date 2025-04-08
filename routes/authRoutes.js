const express = require("express");
const router = express.Router();
const { getUsers, createUser } = require("../controllers/userController");

router.get("/get-users", getUsers);
router.post("/register-user", createUser);

module.exports = router;