import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import Comment from "../models/comments.model.js";
// import Post from "../models/posts.model.js"

const active = async (req, res) => {
  return res.status(200).json({ message: "Posts controller is working" });
};
export default active;

export const createPost = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = new Post({
      userId: user._id,
      body: req.body.body,
      // media: req.file ? req.file.path : "",
      media: req.file ? req.file.path.replace(/\\/g, "/") : "",
      fileType: req.file ? req.file.mimetype.split("/")[1] : "",
    });

    await post.save();

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("CREATE POST ERROR:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      "userId",
      "name username email profilePicture"
    );

    return res.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;

  try {
    const user = await User.findOne({ token }).select("_id");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findById(post_id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Post.deleteOne({ _id: post_id });

    return res.json({ message: "Post Deleted Successfully" });
  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body; 

  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(post_id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = new Comment({
      userId: user._id,
      postId: post_id,
      body: commentBody, 
    });

    await comment.save();

    return res.status(200).json(comment); // ✅ comment return
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};


export const get_comments_by_post = async (req, res) => {
  const { post_id } = req.query;

  try {
    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId: post_id }).populate(
      "userId",
      "name username profilePicture"
    );

    return res.status(200).json(comments.reverse());
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const delete_comment_of_user = async (req, res) => {
  const { token, comment_id } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.find({ _id: comment_id });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await Comment.deleteOne({ _id: comment_id });

    return res.status(200).json({ message: "Comment Deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const increments_likes = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { post_id } = req.body;

  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likedBy.includes(user._id);

    if (alreadyLiked) {
      // 🔁 UNLIKE
      post.likes -= 1;
      post.likedBy = post.likedBy.filter(
        (id) => id.toString() !== user._id.toString()
      );
    } else {
      // ❤️ LIKE
      post.likes += 1;
      post.likedBy.push(user._id);
    }

    await post.save();

    return res.status(200).json({
      likes: post.likes,
      liked: !alreadyLiked,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};


import Post from "../models/posts.model.js";

export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const posts = await Post.find({
      userId,
      active: true,
    })
      .populate("userId", "name username profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const editPost = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { post_id, body } = req.body;

    if (!token || !post_id) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    post.body = body || post.body;
    await post.save();

    return res.status(200).json({ message: "Post updated", post });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
