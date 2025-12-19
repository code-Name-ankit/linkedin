import { BASE_URL, clientServer } from "@/config";
import { getAboutUser } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { getPostsByUser } from "@/config/redux/action/postAction";
import { deletePost, editPost } from "@/config/redux/action/postAction";
import { resetPostId } from "@/config/redux/reducer/postReducer";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);

  const [profile, setProfile] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedText, setEditedText] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [inputData, setInputData] = useState({
    company: "",
    position: "",
    years: "",
  });

  const [educationInput, setEducationInput] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
  });

  const [editingWorkIndex, setEditingWorkIndex] = useState(null);
  const [editWorkData, setEditWorkData] = useState({
    company: "",
    position: "",
    years: "",
  });

  const [editingEducationIndex, setEditingEducationIndex] = useState(null);

  const [editEducationData, setEditEducationData] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
  });

  const handleWorkInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  const handleEducationInputChange = (e) => {
    const { name, value } = e.target;
    setEducationInput({ ...educationInput, [name]: value });
  };

  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  }, [dispatch]);

  useEffect(() => {
    if (authState.user) {
      setProfile(authState.user);
    }
  }, [authState.user]);

  useEffect(() => {
    if (authState?.user?.userId?._id) {
      dispatch(getPostsByUser(authState.user.userId._id));
    }
  }, [authState.user?.userId?._id, dispatch]);

  const updateProfilePicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);
      formData.append("token", localStorage.getItem("token"));

      await clientServer.post("/update_rofile_picture", formData);

      dispatch(getAboutUser(localStorage.getItem("token")));
    } catch (error) {
      console.error("Profile picture upload failed:", error);
    }
  };

  const updateProfileData = async () => {
    const request = await clientServer.post("/user_update", {
      token: localStorage.getItem("token"),
      name: profile.userId.name,
    });

    const response = await clientServer.post("/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: profile.bio,
      currentPost: profile.currentPost,
      pastWorks: profile.pastWorks,
      education: profile.education,
    });
    dispatch(getAboutUser(localStorage.getItem("token")));
  };

  if (!profile || !profile.userId) {
    return (
      <UserLayout>
        <DashboardLayout>
          <p>Loading profile...</p>
        </DashboardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop}
              src={
                profile.userId.profilePicture
                  ? `${BASE_URL}/uploads/${profile.userId.profilePicture}`
                  : "/default-cover.jpg"
              }
              alt="backdrop"
            />

            {/* PERMANENT EDIT ICON */}
            <button
              className={styles.profileEditBtn}
              onClick={() =>
                document.getElementById("profilePictureUpload").click()
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
            </button>

            <input
              id="profilePictureUpload"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => updateProfilePicture(e.target.files[0])}
            />
          </div>

          <div className={styles.profileContainer_details}>
            <div className={styles.profileFlex}>
              <div className={styles.leftSection}>
                <div className={styles.nameBlock}>
  <p className={styles.username}>@{profile.userId.username}</p>

  <input
    className={styles.nameEdit}
    type="text"
    value={profile.userId.name}
    onChange={(e) => {
      setProfile({
        ...profile,
        userId: { ...profile.userId, name: e.target.value },
      });
    }}
  />
</div>


                <textarea
                  className={styles.bioTextarea}
                  value={profile.bio || ""}
                  placeholder="Write something about yourself..."
                  onChange={(e) => {
                    setProfile({ ...profile, bio: e.target.value });
                  }}
                />
                {/* <p>{profile.bio || "No bio added"}</p> */}
              </div>
            </div>
          </div>

          <div className={styles.workHistory}>
            <h4>Work History</h4>
            <div className={styles.workHistoryContainer}>
              {profile?.pastWorks?.length > 0 ? (
                profile.pastWorks.map((work, index) => (
                  <div key={index} className={styles.workHistoryCard}>
                    {editingWorkIndex === index ? (
                      <>
                        <input
                          value={editWorkData.company}
                          onChange={(e) =>
                            setEditWorkData({
                              ...editWorkData,
                              company: e.target.value,
                            })
                          }
                          placeholder="Company"
                        />

                        <input
                          value={editWorkData.position}
                          onChange={(e) =>
                            setEditWorkData({
                              ...editWorkData,
                              position: e.target.value,
                            })
                          }
                          placeholder="Position"
                        />

                        <input
                          type="number"
                          value={editWorkData.years}
                          onChange={(e) =>
                            setEditWorkData({
                              ...editWorkData,
                              years: e.target.value,
                            })
                          }
                          placeholder="Years"
                        />

                        <button  className={styles.saveBtn}
                          onClick={() => {
                            const updatedWorks = [...profile.pastWorks];
                            updatedWorks[index] = editWorkData;

                            setProfile({
                              ...profile,
                              pastWorks: updatedWorks,
                            });

                            setEditingWorkIndex(null);
                          }}
                        >
                          Save
                        </button>

                        <button onClick={() => setEditingWorkIndex(null)} className={styles.cancelBtn}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <p style={{ fontWeight: "bold" }}>
                          {work.position || "No Position"}
                        </p>
                        <p>{work.company}</p>
                        <p>{work.years || 0} Years</p>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <button   className={styles.editBtn}
                            onClick={() => {
                              setEditingWorkIndex(index);
                              setEditWorkData(work);
                            }}
                          >
                            Edit
                          </button>

                          <button  className={styles.deleteBtn}
                            onClick={() => {
                              const filteredWorks = profile.pastWorks.filter(
                                (_, i) => i !== index
                              );

                              setProfile({
                                ...profile,
                                pastWorks: filteredWorks,
                              });
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className={styles.workHistoryEmpty}>No work history added</p>
              )}
            </div>

            <button
              className={styles.addWorkButton}
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              + Add Work
            </button>
          </div>

          <div className={styles.workHistory}>
            <h4>Education</h4>

            <div className={styles.workHistoryContainer}>
              {profile?.education?.length > 0 ? (
                profile.education.map((edu, index) => (
                  <div key={index} className={styles.workHistoryCard}>
                    {editingEducationIndex === index ? (
                      <>
                        <input
                          value={editEducationData.school}
                          placeholder="School / College"
                          onChange={(e) =>
                            setEditEducationData({
                              ...editEducationData,
                              school: e.target.value,
                            })
                          }
                        />

                        <input
                          value={editEducationData.degree}
                          placeholder="Degree"
                          onChange={(e) =>
                            setEditEducationData({
                              ...editEducationData,
                              degree: e.target.value,
                            })
                          }
                        />

                        <input
                          value={editEducationData.fieldOfStudy}
                          placeholder="Field of Study"
                          onChange={(e) =>
                            setEditEducationData({
                              ...editEducationData,
                              fieldOfStudy: e.target.value,
                            })
                          }
                        />

                        <input
                          type="date"
                          value={
                            editEducationData.startDate
                              ? editEducationData.startDate.split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setEditEducationData({
                              ...editEducationData,
                              startDate: e.target.value,
                            })
                          }
                        />

                        <button  className={styles.saveBtn}
                          onClick={() => {
                            const updatedEducation = [...profile.education];
                            updatedEducation[index] = editEducationData;

                            setProfile({
                              ...profile,
                              education: updatedEducation,
                            });

                            setEditingEducationIndex(null);
                          }}
                        >
                          Save
                        </button>

                        <button onClick={() => setEditingEducationIndex(null)}  className={styles.cancelBtn}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <p style={{ fontWeight: "bold" }}>{edu.degree}</p>
                        <p>{edu.fieldOfStudy}</p>
                        <p>{edu.school}</p>
                        <p>
                          Start:{" "}
                          {edu.startDate
                            ?.split("T")[0]
                            .split("-")
                            .reverse()
                            .join("/")}
                        </p>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <button  className={styles.editBtn}
                            onClick={() => {
                              setEditingEducationIndex(index);
                              setEditEducationData(edu);
                            }}
                          >
                            Edit
                          </button>

                          <button  className={styles.deleteBtn}
                            onClick={() => {
                              const filteredEducation =
                                profile.education.filter((_, i) => i !== index);

                              setProfile({
                                ...profile,
                                education: filteredEducation,
                              });
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className={styles.workHistoryEmpty}>No education added</p>
              )}
            </div>

            <button
              className={styles.addWorkButton}
              onClick={() => setIsEducationModalOpen(true)}
            >
              + Add Education
            </button>
          </div>

          {profile != authState.user && (
            <div
              onClick={() => {
                updateProfileData();
              }}
              className={styles.connectionButton}
            >
              Update Profile
            </div>
          )}

          {isModalOpen && (
            <div
              onClick={() => {
                setIsModalOpen(false);
              }}
              className={styles.commentContainer}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={styles.allCommentsConatainer}
              >
                <input
                  className={styles.inputFiled}
                  onChange={handleWorkInputChange}
                  name="company"
                  placeholder="Enter Company"
                  type="text"
                />
                <input
                  className={styles.inputFiled}
                  onChange={handleWorkInputChange}
                  name="position"
                  placeholder="Enter Position"
                  type="text"
                />
                <input
                  className={styles.inputFiled}
                  onChange={handleWorkInputChange}
                  name="years"
                  placeholder="Years"
                  type="number"
                />
                <div
                  onClick={() => {
                    setProfile({
                      ...profile,
                      pastWorks: [...profile.pastWorks, inputData],
                    });
                    setIsModalOpen(false);
                  }}
                  className={styles.connectionButton}
                >
                  Add Work
                </div>
              </div>
            </div>
          )}

          {isEducationModalOpen && (
            <div
              onClick={() => setIsEducationModalOpen(false)}
              className={styles.commentContainer}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className={styles.allCommentsConatainer}
              >
                <input
                  className={styles.inputFiled}
                  name="school"
                  placeholder="School / College"
                  onChange={handleEducationInputChange}
                />

                <input
                  className={styles.inputFiled}
                  name="degree"
                  placeholder="Degree"
                  onChange={handleEducationInputChange}
                />

                <input
                  className={styles.inputFiled}
                  name="fieldOfStudy"
                  placeholder="Field of Study"
                  onChange={handleEducationInputChange}
                />

                <input
                  className={styles.inputFiled}
                  name="startDate"
                  type="date"
                  onChange={handleEducationInputChange}
                />

                <div
                  className={styles.connectionButton}
                  onClick={() => {
                    setProfile({
                      ...profile,
                      education: [...(profile.education || []), educationInput],
                    });
                    setIsEducationModalOpen(false);
                  }}
                >
                  Add Education
                </div>
              </div>
            </div>
          )}

          <div className={styles.postsSection}>
            <h4>Posts</h4>

            {postState.userPosts.length === 0 ? (
              <p>No posts yet</p>
            ) : (
              postState.userPosts.map((post) => {
                const isOwner = post.userId._id === profile.userId._id;
                const isEditing = editingPostId === post._id;

                return (
                  <div key={post._id} className={styles.postCard}>
                    {/* ===== HEADER ===== */}
                    <div className={styles.postHeader}>
                      <img
                        src={
                          post.userId?.profilePicture
                            ? `${BASE_URL}/uploads/${post.userId.profilePicture}`
                            : "/default-avatar.png"
                        }
                        className={styles.postAvatar}
                      />

                      <div className={styles.postUserInfo}>
                        <p className={styles.postUserName}>
                          {post.userId.name}
                        </p>
                        <span className={styles.postUsername}>
                          @{post.userId.username}
                        </span>
                      </div>

                      {isOwner && (
                        <div className={styles.postActions}>
                          <button
                            onClick={() => {
                              setEditingPostId(post._id);
                              setEditedText(post.body);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              await dispatch(deletePost(post._id));

                              dispatch(getPostsByUser(profile.userId._id));
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ===== BODY / EDIT ===== */}
                    <div className={styles.postContent}>
                      {isEditing ? (
                        <>
                          <textarea
                            className={styles.editTextarea}
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                          />
                          <div className={styles.editActions}>
                            <button
                              onClick={() => {
                                dispatch(
                                  editPost({
                                    post_id: post._id,
                                    body: editedText,
                                  })
                                );
                                setEditingPostId(null);
                                dispatch(
                                  getAboutUser(localStorage.getItem("token"))
                                );
                              }}
                            >
                              Save
                            </button>
                            <button onClick={() => setEditingPostId(null)}>
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className={styles.postText}>{post.body}</p>
                      )}
                    </div>

                    {/* ===== IMAGE ===== */}
                    {post.media && (
                      <img
                        src={`${BASE_URL}/${post.media}`}
                        className={styles.postImage}
                        alt="post"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
