import React, { useEffect, useState } from "react";
import UserLayout from "../../layout/userLayout";
import style from "./style.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  loginUser,
} from "../../config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducer/authReducer";

export default function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [userLoginMethod, setUserLoginMethod] = useState(false);

  // ================== FORM STATES ==================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  // ================== RESET INPUTS ==================
  const resetInputs = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setName("");
  };

  // ================== REDIRECT AFTER LOGIN ==================
  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

  // ================== CLEAR MESSAGE + INPUTS ON MODE CHANGE ==================
  useEffect(() => {
    dispatch(emptyMessage());
    resetInputs();
  }, [userLoginMethod, dispatch]);

  // ================== AUTO REDIRECT IF TOKEN ==================
  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, [router]);

  // ================== HANDLERS ==================
  const handleRegister = () => {
    dispatch(registerUser({ username, password, email, name }));
    resetInputs();
  };

  const handleLogin = () => {
    dispatch(loginUser({ email, password }));
    resetInputs();
  };

  // ================== JSX ==================
  return (
    <UserLayout>
      <div className={style.container}>
        <div className={style.cardContainer}>
          {/* ================== LEFT ================== */}
          <div className={style.cardContainer_left}>
            <p className={style.cardLeft_heading}>
              {userLoginMethod ? "Sign In" : "Sign Up"}
            </p>

            {authState.message && (
              <p style={{ color: authState.isError ? "red" : "green" }}>
                {authState.message}
              </p>
            )}

            <div className={style.inputContainer}>
              {!userLoginMethod && (
                <div className={style.inputRow}>
                  <input
                    className={style.inputFiled}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    type="text"
                  />
                  <input
                    className={style.inputFiled}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    type="text"
                  />
                </div>
              )}

              <input
                className={style.inputFiled}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
              />

              <input
                className={style.inputFiled}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
              />

              <div
                onClick={userLoginMethod ? handleLogin : handleRegister}
                className={style.buttonWithOutline}
              >
                {userLoginMethod ? "Sign In" : "Sign Up"}
              </div>
            </div>
          </div>

          {/* ================== RIGHT ================== */}
          <div className={style.cardContainer_right}>
            <p>
              {userLoginMethod
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>

            <div
              onClick={() => setUserLoginMethod((prev) => !prev)}
              className={style.switchButton}
            >
              {userLoginMethod ? "Sign Up" : "Sign In"}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
