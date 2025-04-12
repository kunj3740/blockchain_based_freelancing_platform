import jwt from "jsonwebtoken";
import ClientModel from "../models/client.model.js";
import FreelancerModel from "../models/freelancer.model.js";
import bcrypt from "bcrypt";

// Util to generate token
function generateAuthToken(payload) {
  console.log(payload, "payload");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Register Client (Buyer)
export async function registerBuyer(req, res) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      country,
      city,
      address,
    } = req.body;

    let existingClient = await ClientModel.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = new ClientModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      country,
      city,
      address,
    });

    const verificationToken = jwt.sign(
      { id: client._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    client.verificationToken = verificationToken;
    await client.save();

    const token = generateAuthToken({ _id: client._id, role: "client" });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        success: true,
        token,
        user: {
          id: client._id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
          country: client.country,
          city: client.city,
          address: client.address,
          avatar: client.avatar,
          role: "client",
        },
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function registerFreelancer(req, res) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      professionalTitle,
      description,
      skills,
      country,
      hourlyRate,
    } = req.body;

    // Check if user already exists
    const existingFreelancer = await FreelancerModel.findOne({ email });
    if (existingFreelancer) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new freelancer
    const freelancer = new FreelancerModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      professionalTitle,
      description,
      skills,
      country,
      hourlyRate,
    });

    console.log(freelancer);

    await freelancer.save();

    // Generate auth token
    const token = generateAuthToken({
      _id: freelancer._id,
      role: "freelancer",
    });

    // Set cookie and respond
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        success: true,
        token,
        user: {
          id: freelancer._id,
          email: freelancer.email,
          firstName: freelancer.firstName,
          lastName: freelancer.lastName,
          professionalTitle: freelancer.professionalTitle,
          role: "freelancer",
        },
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
}

// Login for Client
export async function loginClient(req, res) {
  try {
    const { email, password } = req.body;

    const client = await ClientModel.findOne({ email }).select("+password");
    if (!client || !(await bcrypt.compare(password, client.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateAuthToken({ _id: client._id, role: "client" });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        token,
        user: {
          id: client._id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          role: "client",
        },
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Login for Freelancer
export async function loginFreelancer(req, res) {
  try {
    const { email, password } = req.body;

    const freelancer = await FreelancerModel.findOne({ email }).select(
      "+password"
    );
    if (!freelancer || !(await bcrypt.compare(password, freelancer.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateAuthToken({
      _id: freelancer._id,
      role: "freelancer",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        token,
        user: {
          id: freelancer._id,
          email: freelancer.email,
          firstName: freelancer.firstName,
          lastName: freelancer.lastName,
          professionalTitle: freelancer.professionalTitle,
          role: "freelancer",
        },
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get current logged-in user
export async function getMe(req, res) {
  try {
    const Model =
      req.user.role === "freelancer" ? FreelancerModel : ClientModel;
    const user = await Model.findById(req.user._id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
