import Head from "next/head";
import Feed from "../components/Feed";
import Sidebar from "../components/Sidebar";
import Widgets from "../components/Widgets";
import { getProviders, getSession, useSession } from "next-auth/react";
import Login from "../components/Login";
import Modal from "../components/Modal";
import { modalState } from "../atoms/modalAtom";
import { useRecoilState } from "recoil";

export default function Home({ trendingResults, followResults, providers }) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useRecoilState(modalState);

  // Handle different loading states
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) return <Login providers={providers} />;

  return (
    <div className="">
      <Head>
        <title>Home / weconnect</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-black min-h-screen flex max-w-[1500px] mx-auto">
        <Sidebar />
        <Feed />
        <Widgets
          trendingResults={trendingResults}
          followResults={followResults}
        />

        {isOpen && <Modal />}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    // Fetch trending results
    const trendingRes = await fetch("https://www.jsonkeeper.com/b/PM97");
    if (!trendingRes.ok) throw new Error("Failed to fetch trending results");
    const trendingResults = await trendingRes.json();

    // Fetch follow results
    const followRes = await fetch("https://www.jsonkeeper.com/b/ZI5D");
    if (!followRes.ok) throw new Error("Failed to fetch follow results");
    const followResults = await followRes.json();

    // Fetch authentication providers
    const providers = await getProviders();

    // Fetch session
    const session = await getSession(context);

    return {
      props: {
        trendingResults,
        followResults,
        providers,
        session,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        trendingResults: [],
        followResults: [],
        providers: {},
        session: null,
      },
    };
  }
}
