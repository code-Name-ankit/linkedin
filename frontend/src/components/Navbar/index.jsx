import React, { useState } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";

export default function NavBarComponent() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        {/* LOGO */}
        <h1 className={styles.logo} onClick={() => router.push("/")}>
          ProConnect
        </h1>

        {/* DESKTOP MENU */}
        <div className={styles.desktopMenu}>
          {authState.profileFetched ? (
            <>
              <p
                className={styles.profileLink}
                onClick={() => router.push("/profile")}
              >
                Profile
              </p>
              <p
                className={styles.logoutButton}
                onClick={() => {
                  localStorage.removeItem("token");
                  dispatch(reset());
                  router.push("/login?mode=signin");
                }}
              >
                Logout
              </p>
            </>
          ) : (
            <div
              className={styles.buttonJoin}
              onClick={() => router.push("/login?mode=signup")}
            >
              Be a Part
            </div>
          )}
        </div>

        {/* HAMBURGER (MOBILE) */}
        <div
          className={styles.hamburger}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ☰
        </div>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {authState.profileFetched ? (
            <>
              <p
                onClick={() => {
                  router.push("/profile");
                  setMenuOpen(false);
                }}
              >
                Profile
              </p>
              <p
                className={styles.logoutMobile}
                onClick={() => {
                  localStorage.removeItem("token");
                  dispatch(reset());
                  router.push("/login?mode=signin");
                  setMenuOpen(false);
                }}
              >
                Logout
              </p>
            </>
          ) : (
            <>
              <p
                onClick={() => {
                  router.push("/login?mode=signin");
                  setMenuOpen(false);
                }}
              >
                Sign In
              </p>
              <p
                onClick={() => {
                  router.push("/login?mode=signup");
                  setMenuOpen(false);
                }}
              >
                Sign Up
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
