const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';



exports.createUser = async (req, res) => {
  const { name, email, mobile, password } = req.body;
  try {
    //validate the data
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create new user with hashed password
    const newUser = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword
    });

    return res.status(201).json({
      status: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id.toString(),
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // -1 means descending order
    return res.status(200).json({
      status: true,
      message: 'Users fetched successfully',
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};


//login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    //validate the data 
    if (!email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      JWT_SECRET,
      { expiresIn: '1d' } // token valid for 1 day
    );
    // Save token in user model
    existingUser.token = token;
    await existingUser.save();
    return res.status(200).json({
      status: true,
      message: 'User logged in successfully',
      user: {
        id: existingUser.id.toString(),
        name: existingUser.name,
        email: existingUser.email,
        token: existingUser.token,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
}
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate the data
    if (!id) {
      return res.status(400).json({ error: "Please provide a user ID" });
    }
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(400).json({ error: "User not found" });
    }
    // Delete user
    await User.findByIdAndDelete(id);
    return res.status(200).json({
      status: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error in delete:', error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, password } = req.body;
  try {
    // Validate the data
    if (!id || !name || !email || !mobile || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(400).json({ error: "User not found" });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Update user
    await User.findByIdAndUpdate(id, {
      name,
      email,
      mobile,
      password: hashedPassword
    });
    return res.status(200).json({
      status: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error in update:', error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};exports.atciveDeactiveUser = async (req, res) => {
  const { id ,status } = req.body;

  try {
    // Validate status
    if (typeof status !== "number" || ![0, 1].includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status value. Must be 0 or 1.",
      });
    }

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Update user status
    await User.findByIdAndUpdate(id, {
      status: status === 1 ? true : false,
    });

    return res.status(200).json({
      status: true,
      message: `User status updated to ${status === 1 ? "Active" : "Inactive"}`,
    });
  } catch (error) {
    console.error('Error in update:', error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate the data
    if (!id) {
      return res.status(400).json({ error: "Please provide a user ID" });
    }
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(400).json({ error: "User not found" });
    }
    return res.status(200).json({
      status: true,
      message: 'User fetched successfully',
      user: existingUser
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
exports.getUserByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    // Validate the data
    if (!email) {
      return res.status(400).json({ error: "Please provide an email" });
    }
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ error: "User not found" });
    }
    return res.status(200).json({
      status: true,
      message: 'User fetched successfully',
      user: existingUser
    });
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
exports.getUserByMobile = async (req, res) => {
  const { mobile } = req.params;
  try {
    // Validate the data
    if (!mobile) {
      return res.status(400).json({ error: "Please provide a mobile number" });
    }
    // Check if user exists
    const existingUser = await User.findOne({ mobile });
    if (!existingUser) {
      return res.status(400).json({ error: "User not found" });
    }
    return res.status(200).json({
      status: true,
      message: 'User fetched successfully',
      user: existingUser
    });
  } catch (error) {
    console.error('Error in getUserByMobile:', error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

