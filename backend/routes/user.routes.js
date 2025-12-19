import { Router } from "express";
import {  register } from "../controllers/user.controller.js";
import { login } from "../controllers/user.controller.js";
// import { logout } from "../controllers/user.controller.js";
import { uploadProfilePicture } from "../controllers/user.controller.js";
import { updateUserProfile } from "../controllers/user.controller.js";
import { getUserAndProfile } from "../controllers/user.controller.js";
import { updateProfileData } from "../controllers/user.controller.js";
import {getAllUserProfiles} from "../controllers/user.controller.js";
import {downloadProfle} from "../controllers/user.controller.js";
import { sendConnectionRequest } from "../controllers/user.controller.js";
import  { getMyconnectionsRequests } from "../controllers/user.controller.js";
import { whatAreMyConnections } from "../controllers/user.controller.js";
import { acceptsConnectionRequest } from "../controllers/user.controller.js";
import {getuserProfileAndUserBasedOnUsername} from "../controllers/user.controller.js";
import { getAllMyConnections } from "../controllers/user.controller.js";

import multer from "multer";  

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.route("/register").post(register);
router.route("/login").post(login);
// router.route("/logout").post(logout);
router.route("/update_rofile_picture").post(upload.single("profile_picture"),uploadProfilePicture);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_users").get(getAllUserProfiles);
router.route("/user/download_resume").get(downloadProfle);
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/get_connection_request").get(getMyconnectionsRequests);
router.route("/user/user_connection_request").get(whatAreMyConnections);
router.route("/user/accept_connection_request").post(acceptsConnectionRequest);
router.route("/user/get_profile_based_on_username").get(getuserProfileAndUserBasedOnUsername)
router.route("/user/all_connections").get(getAllMyConnections);




export default router;
