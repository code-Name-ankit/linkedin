import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "../layout/userLayout";

export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainConteiner_left}>
            <p>Connect with friends without Exaggeration</p>
            <p>A True social media plateform,with stories no blufs!</p>
            <div
              onClick={() => {
                router.push("/login");
              }}
              className={styles.buttonJoin}
            >
              join Now
            </div>
          </div>
          <div className={styles.mainConteiner_right}>
            <img
              src="/images/homemain_connection.jpg"
              alt="connection image"
              className={styles.heroImage}
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
