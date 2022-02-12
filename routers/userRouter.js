const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    const { email, password, passwordVerify } = req.body;

    //validation
    if (!email || !password || !passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter all required fields.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        errorMessage: "Please enter a password of at least 6 characters.",
      });
    }

    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter the same password twice for verification.",
      });
    }

    //check if there is another account with the same email
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        errorMessage: "An account with this email already exists.",
      });
    }

    //hash the password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    //save the user in DB
    const newUser = new User({
      email: email,
      passwordHash: passwordHash,
      userTags: ["js", "php", "c#", "java"],
    });

    const savedUser = await newUser.save();

    //create a JWT token )(json web token)
    const token = jwt.sign(
      {
        id: savedUser._id,
      },
      process.env.JWT_SECRET
    );

    //set cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite:
          process.env.NODE_ENV === "development"
            ? "lax"
            : process.env.NODE_ENV === "production" && "none",
        secure:
          process.env.NODE_ENV === "development"
            ? false
            : process.env.NODE_ENV === "production" && true,
      })
      .send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(400).json({
        errorMessage: "Please enter all required fields.",
      });
    }

    //get user account
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(401).json({
        errorMessage: "Wrong email or password.",
      });
    }

    const correctPassword = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!correctPassword) {
      return res.status(401).json({
        errorMessage: "Wrong email or password.",
      });
    }

    //create a JWT token
    const token = jwt.sign(
      {
        id: existingUser._id,
        username: existingUser.email,
        userTags: existingUser.userTags,
      },
      process.env.JWT_SECRET
    );

    //set cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite:
          process.env.NODE_ENV === "development"
            ? "lax"
            : process.env.NODE_ENV === "production" && "none",
        secure:
          process.env.NODE_ENV === "development"
            ? false
            : process.env.NODE_ENV === "production" && true,
      })
      .send();
  } catch (err) {
    res.status(500).send();
  }
});

//check if the user is logedin and returns the user id (usefull in frontend)
router.get("/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.json(null);

    const validatedUser = jwt.verify(token, process.env.JWT_SECRET);

    res.json(validatedUser.id);
  } catch (err) {
    return res.json(null);
  }
});

router.get("/userName", (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.json(null);

    const validatedUser = jwt.verify(token, process.env.JWT_SECRET);

    res.json(validatedUser.username);
    // console.log(validatedUser.username);
  } catch (err) {
    return res.json(null);
  }
});

router.get("/userTags", (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.json(null);

    const validatedUser = jwt.verify(token, process.env.JWT_SECRET);

    res.json(validatedUser.userTags);
  } catch (err) {
    return res.json(null);
  }
});

router.put("/addTag/:id", async (req, res) => {
  try {
    const { tag } = req.body;
    console.log(tag);
    const userId = req.params.id;

    const userData = await User.findById(userId);

    userData.userTags.push(tag);
    userData.save();
  } catch (err) {
    res.status(500).send();
  }
});

//logout user
router.get("/logOut", (req, res) => {
  try {
    res
      .cookie("token", "", {
        httpOnly: true,
        sameSite:
          process.env.NODE_ENV === "development"
            ? "lax"
            : process.env.NODE_ENV === "production" && "none",
        secure:
          process.env.NODE_ENV === "development"
            ? false
            : process.env.NODE_ENV === "production" && true,
        expires: new Date(0),
      })
      .send();
  } catch (err) {
    return res.json(null);
  }
});

module.exports = router;
