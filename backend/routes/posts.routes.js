import { Router } from "express";
import active from "../controllers/posts.controller.js";
const router = Router();
import multer from "multer";
import { createPost } from "../controllers/posts.controller.js";
import { getAllPost } from "../controllers/posts.controller.js";
import { deletePost } from "../controllers/posts.controller.js";
import { commentPost } from "../controllers/posts.controller.js";
import { get_comments_by_post } from "../controllers/posts.controller.js";
import { delete_comment_of_user } from "../controllers/posts.controller.js";
import { increments_likes } from "../controllers/posts.controller.js";
import {getPostsByUser } from "../controllers/posts.controller.js"
import { editPost } from "../controllers/posts.controller.js";  
router.route("/").get(active);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.route("/post").post(upload.single("media"), createPost);
router.route("/posts").get(getAllPost);
router.route("/delete_post").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").get(get_comments_by_post);
router.route("/delete_comment").delete(delete_comment_of_user);
router.route("/increment_post_likes").post(increments_likes);
router.route("/user-posts").get(getPostsByUser);
router.route("/edit_post").put(editPost);


export default router;
