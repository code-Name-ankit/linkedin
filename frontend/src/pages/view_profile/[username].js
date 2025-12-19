import React, { useEffect, useState } from "react";
import { BASE_URL, clientServer } from "@/config";
import UserLayout from "@/layout/userLayout";
import DashboardLayout from "@/layout/dashboardLayout";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionsRequest,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

/* ---------- PAGE ---------- */
export default function ViewProfilePage({ profile }) {
  const router = useRouter();
  const postReducer = useSelector((state) => state.post);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);

  const getUserPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionsRequest({ token: localStorage.getItem("token") })
    );
  };

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });
    setUserPosts(post);
  }, [postReducer.posts]);

  useEffect(() => {
    // console.log("Connections:", authState.connections);
    // console.log("Profile ID:", profile.userId._id);

    if (!authState.connections?.length) {
      setIsCurrentUserInConnection(false);
      setIsConnectionNull(true);
      return;
    }

    const profileId = profile.userId._id.toString();

    const connection = authState.connections.find((conn) => {
      return (
        conn.userId?._id?.toString() === profileId ||
        conn.connectionId?._id?.toString() === profileId
      );
    });

    if (!connection) {
      setIsCurrentUserInConnection(false);
      setIsConnectionNull(true);
      return;
    }

    setIsCurrentUserInConnection(true);

    // 🔥 FINAL STATUS CHECK
    setIsConnectionNull(connection.status_accepted !== true);
  }, [authState.connections, profile]);

  useEffect(() => {
    getUserPost();
  }, []);

  useEffect(() => {
    dispatch(getConnectionsRequest());
  }, [dispatch]);
  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop}
              src={`${BASE_URL}/uploads/${profile.userId.profilePicture}`}
              alt="backdrop"
            />
          </div>
          <div className={styles.profileContainer_details}>
            <div className={styles.profileFlex}>
              <div className={styles.leftSection}>
                <div
                  style={{
                    display: "flex",
                    width: "fit-content",
                    alignItems: "center",
                    gap: "1.2rem",
                  }}
                >
                  <h2>{profile.userId.name}</h2>
                  <p>@{profile.userId.username}</p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem",
                  }}
                >
                  {isCurrentUserInConnection ? (
                    <button className={styles.connectedButton}>
                      {isConnectionNull ? "Pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            user_id: profile.userId._id,
                          })
                        );
                      }}
                      className={styles.connectBtn}
                    >
                      Connect
                    </button>
                  )}

                  <div
                    className={styles.downloadIcon}
                    onClick={async () => {
                      try {
                        const response = await clientServer.get(
                          `/user/download_resume?id=${profile.userId._id}`
                        );

                        // backend returns: { message: "uploads/xyz.pdf" }
                        const filePath = response.data.message.replace(
                          /\\/g,
                          "/"
                        );

                        // open PDF in new tab
                        window.open(`${BASE_URL}/${filePath}`, "_blank");
                      } catch (error) {
                        console.error("Resume download error:", error);
                        alert("Resume download failed");
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <svg
                      style={{ width: "1.2em" }}
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
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <p>{profile.bio ? profile.bio : "Not Bio in your profile"}</p>
                </div>
              </div>

              <div className={styles.rightSection}>
                <h3>Recent Activity</h3>

                {[...userPosts].slice(0, 3).map((post) => {
                  return (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card_profileContainer}>
                          {post.media !== " " && (
                            <img
                              src={`${BASE_URL}/${post.media}`}
                              alt="postImage"
                            />
                          )}
                        </div>
                        <p>{post.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className={styles.workHistory}>
            <h4>Work History</h4>

            <div className={styles.workHistoryContainer}>
              {profile?.pastWorks?.length > 0 ? (
                profile.pastWorks.map((work, index) => (
                  <div key={index} className={styles.workHistoryCard}>
                    <p
                      style={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                      }}
                    >
                      {work.position || "No Position"}
                    </p>

                    <p>{work.years || "No"} Years</p>
                  </div>
                ))
              ) : (
                <p className={styles.workHistoryEmpty}>No work history added</p>
              )}
            </div>
          </div>

          <div className={styles.workHistory}>
            <h4>Education</h4>

            <div className={styles.workHistoryContainer}>
              {profile?.education?.length > 0 ? (
                profile.education.map((edu, index) => (
                  <div key={index} className={styles.workHistoryCard}>
                    <p style={{ fontWeight: "bold" }}>
                      {edu.degree || "No Degree"}
                    </p>

                    <p>{edu.fieldOfStudy || "No Field"}</p>

                    <p>{edu.school || "No School"}</p>

                    <p style={{ fontSize: "0.85rem", color: "#666" }}>
                      Start Date:{" "}
                      {edu.startDate
                        ? new Date(edu.startDate).toLocaleDateString("en-GB")
                        : "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className={styles.workHistoryEmpty}>
                  No education details added
                </p>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

/* ---------- SSR ---------- */
export async function getServerSideProps(context) {
  try {
    const { username } = context.query;

    const response = await clientServer.get(
      "/user/get_profile_based_on_username",
      {
        params: { username },
      }
    );

    return {
      props: {
        profile: response.data.profile,
      },
    };
  } catch (error) {
    return {
      props: {
        profile: null,
      },
    };
  }
}
