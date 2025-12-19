import { getAllUser, getAllUsers } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";

export default function Discoverpage() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!authState.all_profiles_fetched && !authState.isLoading) {
      dispatch(getAllUsers());
      
    }
  }, [authState.all_profiles_fetched, authState.isLoading, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1 className={styles.discoverTitle}>Discover</h1>

          <div className={styles.allUserProfile}>
            {authState.all_profiles_fetched &&
              authState.all_users.map((user) => {
                return (
                  <div 
                  onClick={() =>{
                    router.push(`/view_profile/${user.userId.username}`)
                  }}
                  key={user._id} className={styles.userCard}>
                    <img
                      className={styles.userCard_image}
                      src={`${BASE_URL}/uploads/${user.userId.profilePicture}`}
                      alt="profile"
                    />

                    <div className={styles.userCard_text}>
                      <p className={styles.userName}>{user.userId.name}</p>
                      <p className={styles.userUsername}>
                        @{user.userId.username}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
