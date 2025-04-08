const express = require("express");
const router = express.Router();
const { getUsers, createUser ,loginUser ,atciveDeactiveUser} = require("../controllers/userController");

router.get("/get-users", getUsers);
router.post("/register-user", createUser);
router.post("/login", loginUser);
router.post("/active-Deactive-User-by-id", atciveDeactiveUser);

module.exports = router;
