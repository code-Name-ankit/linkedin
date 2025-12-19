import { acceptConnection, getMyconnectionsRequests } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";

export default function MyConnectionPage() {
  const dispatch = useDispatch();
  const { connectionRequest } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    dispatch(
      getMyconnectionsRequests({
        token: localStorage.getItem("token"),
      })
    );
  }, [dispatch]);

  // PENDING REQUESTS
  const pendingRequests = connectionRequest.filter(
    (req) => req.status_accepted === null
  );

  // ACCEPTED CONNECTIONS
  const acceptedConnections = connectionRequest.filter(
    (req) => req.status_accepted === true
  );

  return (
    <UserLayout>
      <DashboardLayout>
        <div>

          {/* ================= CONNECTION REQUESTS ================= */}
          {pendingRequests.length > 0 && (
            <>
              <h2>Connection Requests</h2>

              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className={styles.userCard}
                  onClick={() =>
                    router.push(`view_profile/${req.userId.username}`)
                  }
                >
                  <div className={styles.leftSection}>
                    <img
                      className={styles.avatar}
                      src={
                        req.userId?.profilePicture
                          ? `${BASE_URL}/uploads/${req.userId.profilePicture}`
                          : "/default-avatar.png"
                      }
                      alt="profile"
                    />

                    <div className={styles.userInfo}>
                      <p className={styles.name}>{req.userId?.name}</p>
                      <p className={styles.username}>
                        @{req.userId?.username}
                      </p>
                    </div>
                  </div>

                  <div
                    className={styles.rightSection}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={styles.acceptBtn}
                      onClick={() =>
                        dispatch(
                          acceptConnection({
                            token: localStorage.getItem("token"),
                            connectionId: req._id,
                            action: "accept",
                          })
                        )
                      }
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ================= MY NETWORK ================= */}
          <h2 style={{ marginTop: "30px" }}>My Network</h2>

          {acceptedConnections.length === 0 && (
            <p className={styles.emptyText}>No connections yet</p>
          )}

          {acceptedConnections.map((req) => (
            <div
              key={req._id}
              className={styles.userCard}
              onClick={() =>
                router.push(`view_profile/${req.userId.username}`)
              }
            >
              <div className={styles.leftSection}>
                <img
                  className={styles.avatar}
                  src={
                    req.userId?.profilePicture
                      ? `${BASE_URL}/uploads/${req.userId.profilePicture}`
                      : "/default-avatar.png"
                  }
                  alt="profile"
                />

                <div className={styles.userInfo}>
                  <p className={styles.name}>
                    {req.userId?.name}
                    <span className={styles.acceptedBadge}>✓ Accepted</span>
                  </p>

                  <p className={styles.username}>
                    @{req.userId?.username}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
