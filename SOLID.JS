// ########################################################

// ! 🧱 SOLID PRINCIPLE IN NODE JS

// SOLID is an acronym for 5 design principles that make software easier to:

//* Maintain

//* Extend

//* Refactor

//* Test

// ! 1. S - Single Responsibility Principle (SRP)

// * A class/module should have only one reason to change.

// * Split logic into separate files/functions based on responsibility.

// ❌ Bad:
// userController.js
exports.createUser = async (req, res) => {
  const { name, email } = req.body;

  // Validation
  if (!email.includes("@")) return res.status(400).send("Invalid email");

  // DB save
  const user = await User.create({ name, email });

  // Email sending
  sendWelcomeEmail(email);

  res.status(201).json(user);
};

// ✅ Good:
// controllers/userController.js
exports.createUser = async (req, res) => {
  const { name, email } = req.body;
  validateUser({ name, email });
  const user = await userService.createUser({ name, email });
  await emailService.sendWelcomeEmail(email);
  res.status(201).json(user);
};

// services/userService.js
exports.createUser = (userData) => User.create(userData);

// validators/userValidator.js
exports.validateUser = ({ email }) => {
  if (!email.includes("@")) throw new Error("Invalid email");
};

// ❌ Bad:
// register
const registerUser = async (req, res) => {
  const { fullname, email, roleName } = req.body;

  if (!fullname || !email || !roleName) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const userEmail = email.toLowerCase();
  console.log("Registering user with email:", userEmail);

  try {
    const checkUserRole = await Roles.findOne({
      roleName,
    });

    if (!checkUserRole) {
      return res.status(400).json({
        message: "Role does not exist",
      });
    }

    const mailExists = await User.findOne({
      email: userEmail,
    });

    if (mailExists) {
      return res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }

    const defaultPassword = crypto.randomBytes(8).toString("hex");
    const salt = await genSalt(10);
    const hashedPassword = await hash(defaultPassword, salt);

    const user = await User.create({
      fullname,
      email: userEmail,
      roleName,
      password: hashedPassword,
    });

    if (user) {
      // Log user creation
      await logActivity(
        user._id.toString(),
        "CREATE_USER",
        `User ${fullname} was created with role ${roleName}`,
        req
      );

      const subject = "Welcome onboard";
      const text = ``;
      const html = `<html>
        <h5>Hello ${fullname}</h5>,
        Your account has been created successfully. <br />
        Here are your login details: Email: ${email}\nPassword: ${defaultPassword} <br />
        Please change your password after logging in. <br /> 
        Best regards, <br />
        Your Team.
       </html>`;

      await sendEmail(email, subject, text, html);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          fullname: user.fullname,
          email: user.email,
          role: user.roleName,
          token: generateToken(user._id.toString()), // Convert ObjectId to string
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Good

// validate Input
const validateRegisterInput = ({ fullname, email, roleName }) => {
  if (!fullname || !email || !roleName) {
    throw new Error("All fields are required");
  }
};

// service layer
const createUser = async ({ fullname, email, roleName }) => {
  const userEmail = email.toLowerCase();

  const role = await Roles.findOne({ roleName });
  if (!role) throw new Error("Role does not exist");

  const exists = await User.findOne({ email: userEmail });
  if (exists) throw new Error("User already exists");

  const defaultPassword = crypto.randomBytes(8).toString("hex");
  const hashedPassword = await hash(defaultPassword, await genSalt(10));

  const user = await User.create({
    fullname,
    email: userEmail,
    roleName,
    password: hashedPassword,
  });

  return { user, defaultPassword };
};

// Email service

const sendWelcome = async ({ fullname, email, password }) => {
  const subject = "Welcome onboard";
  const html = `
      <html>
        <h5>Hello ${fullname}</h5>,
        Your account has been created successfully.<br />
        Login: ${email}<br />
        Password: ${password}<br />
        Please change your password after logging in.<br />
        Best regards,<br />Your Team.
      </html>
    `;
  await sendEmail(email, subject, "", html);
};

// Improved Controller
const ImprovedRegisterUser = async (req, res) => {
  const { fullname, email, roleName } = req.body;

  try {
    validateRegisterInput({ fullname, email, roleName });

    const { user, defaultPassword } = await createUser({
      fullname,
      email,
      roleName,
    });

    await logActivity(
      user._id.toString(),
      "CREATE_USER",
      `User ${fullname} was created with role ${roleName}`,
      req
    );

    await sendWelcome({ fullname, email, password: defaultPassword });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        fullname: user.fullname,
        email: user.email,
        role: user.roleName,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ✅ Benefits of SRP-compliant Refactor
// * Easier to test each part individually.

// * If email format changes, only update the email service.

// * If business logic changes, you don’t touch controller.

// * Easier to reuse in CLI, cron jobs, or queue processors.

// ! SRP FOLDER STRUCTURE

// src/
// │
// ├── controllers/
// │   └── userController.js     # Request handling only
// │
// ├── services/
// │   └── userService.js        # Business logic
// │
// ├── models/
// │   └── userModel.js          # DB schema
// │
// ├── validators/
// │   └── userValidator.js      # Input validation
// │
// ├── utils/
// │   └── emailSender.js        # Utility functions
// │
// └── routes/
//     └── userRoutes.js         # Route definitions

// ########################################################

// ! 🧱 SOLID PRINCIPLE IN NODE JS
