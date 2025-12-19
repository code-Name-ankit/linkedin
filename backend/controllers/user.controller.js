import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import Profile from "../models/profile.model.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import ConnectionRequest from "../models/connections.model.js";
import sharp from "sharp";

export const convertToPDF = async (data) => {
  if (!data || !data.userId) {
    throw new Error("convertToPDF: data ya data.userId missing hai");
  }

  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });

  const outputFileName = crypto.randomBytes(16).toString("hex") + ".pdf";
  const outputPath = path.join("uploads", outputFileName);
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);

  /* ================= HEADER ================= */

  const profilePicPath = data.userId.profilePicture
    ? path.join("uploads", data.userId.profilePicture)
    : null;

  if (profilePicPath && fs.existsSync(profilePicPath)) {
    const ext = path.extname(profilePicPath).toLowerCase();

    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      doc.image(profilePicPath, doc.page.width - 150, 50, {
        fit: [80, 80],
        align: "right",
        valign: "top",
      });
    } else if ([".avif", ".webp"].includes(ext)) {
      const tempPngPath = profilePicPath + ".png";
      await sharp(profilePicPath).png().toFile(tempPngPath);

      doc.image(tempPngPath, doc.page.width - 150, 50, {
        fit: [80, 80],
        align: "right",
        valign: "top",
      });

      fs.unlinkSync(tempPngPath);
    }
  }

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(data.userId.name || "Unnamed User", 50, 50);

  doc
    .moveDown(0.5)
    .fontSize(12)
    .font("Helvetica")
    .text(`Username: ${data.userId.username || "N/A"}`)
    .text(`Email: ${data.userId.email || "N/A"}`);

  doc
    .moveDown(0.5)
    .moveTo(50, doc.y + 5)
    .lineTo(doc.page.width - 50, doc.y + 5)
    .stroke();

  doc.moveDown(1);

  /* ================= BIO ================= */

  doc.font("Helvetica-Bold").fontSize(16).text("Bio", { underline: true });

  doc
    .moveDown(0.3)
    .font("Helvetica")
    .fontSize(12)
    .text(data.bio || "N/A");

  doc.moveDown(1);

  /* ================= EDUCATION ================= */

  doc.font("Helvetica-Bold").fontSize(16).text("Education", {
    underline: true,
  });

  doc.moveDown(0.5);

  if (Array.isArray(data.education) && data.education.length > 0) {
    data.education.forEach((edu, index) => {
      if (doc.y > doc.page.height - 120) {
        doc.addPage();
      }

      const formattedDate = edu.startDate
        ? new Date(edu.startDate).toLocaleDateString("en-GB")
        : "N/A";

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(`${index + 1}. ${edu.degree || "Degree N/A"}`);

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Institute: ${edu.school || "N/A"}`)
        .text(`Field: ${edu.fieldOfStudy || "N/A"}`)
        .text(`Start Date: ${formattedDate}`);

      doc.moveDown(0.8);
    });
  } else {
    doc.font("Helvetica").fontSize(12).text("No education details added.");
  }

  doc.moveDown(1);

  /* ================= PAST WORK ================= */

  doc.font("Helvetica-Bold").fontSize(16).text("Past Work Experience", {
    underline: true,
  });

  doc.moveDown(0.5);

  if (Array.isArray(data.pastWorks) && data.pastWorks.length > 0) {
    data.pastWorks.forEach((work, index) => {
      if (doc.y > doc.page.height - 120) {
        doc.addPage();
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(`${index + 1}. ${work.position || "Position N/A"}`);

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Company: ${work.company || "N/A"}`)
        .text(`Year(s): ${work.years || "N/A"}`);

      doc.moveDown(0.8);
    });
  } else {
    doc.font("Helvetica").fontSize(12).text("No past work experience added.");
  }

  doc.end();

  return outputPath;
};

export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();

    const profile = new Profile({ userId: newUser._id });
    await profile.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    await User.findByIdAndUpdate(user._id, { token });
    // res.cookie("token", token, { httpOnly: true });
    return res.json({ token: token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { token: null });
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    user.profilePicture = req.file.filename;
    await user.save();
    return res
      .status(200)
      .json({ message: "Profile picture updated successfully" });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    const { username, email } = newUserData;

    if (username || email) {
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      // ✅ IMPORTANT FIX
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res
          .status(409)
          .json({ message: "Username or Email already in use" });
      }
    }

    Object.assign(user, newUserData);
    await user.save();

    return res
      .status(200)
      .json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getUserAndProfile = async (req, res) => {
  try {
    let { token } = req.query;

    if (typeof token === "object") {
      token = token.token;
    }

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    );

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("Error fetching user and profile:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    const profile = await Profile.findOne({ userId: user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    Object.assign(profile, newProfileData);
    await profile.save();

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllUserProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name username email profilePicture"
    );
    return res.status(200).json({ profiles });
  } catch (error) {
    console.error("Error fetching all user profiles:", error);
    res.status(500).json({ message: error.message });
  }
};

export const downloadProfle = async (req, res) => {
  const user_id = req.query.id;

  const user = await Profile.findOne({ userId: user_id }).populate(
    "userId",
    "name username email profilePicture"
  );

  let outputPath = await convertToPDF(user);

  return res.json({ message: outputPath });
};

export const sendConnectionRequest = async (req, res) => {
  try {
    const { token, connectionId } = req.body;

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const connectionUser = await User.findById(connectionId);
    if (!connectionUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const exististingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionId,
    });
    if (exististingRequest) {
      return res
        .status(409)
        .json({ message: "Connection request already sent" });
    }

    const newConnectionRequest = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionId,
      status_accepted: null,
    });
    await newConnectionRequest.save();

    return res
      .status(200)
      .json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("Error sending connection request:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getMyconnectionsRequests = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const connectionRequests = await ConnectionRequest.find({
      userId: user._id,
      status_accepted: null,
    }).populate("userId", "name username email profilePicture");

    return res.status(200).json({ connectionRequests });
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    res.status(500).json({ message: error.message });
  }
};

export const whatAreMyConnections = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");

    return res.status(200).json({ connections });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ message: error.message });
  }
};

export const acceptsConnectionRequest = async (req, res) => {
  try {
    const { token, requestId, action_type } = req.body;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const connection = await ConnectionRequest.findById(requestId);
    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (action_type === "accept") {
      connection.status_accepted = true;
    } else if (action_type === "reject") {
      connection.status_accepted = false;
    }

    // connectionRequest.status_accepted = true;
    await connection.save();
    return res
      .status(200)
      .json({ message: "Connection request accepted successfully" });
  } catch (error) {
    console.error("Error accepting connection request:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getuserProfileAndUserBasedOnUsername = async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    );

    return res.status(200).json({ profile: userProfile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllMyConnections = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const connections = await ConnectionRequest.find({
      $or: [{ userId: user._id }, { connectionId: user._id }],
    })
      .populate("userId", "name username email profilePicture")
      .populate("connectionId", "name username email profilePicture");

    return res.status(200).json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
