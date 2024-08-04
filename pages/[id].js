import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "@firebase/firestore";
import { getProviders, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { modalState } from "../atoms/modalAtom";
import Modal from "../components/Modal";
import Sidebar from "../components/Sidebar";
import Widgets from "../components/Widgets";
import Post from "../components/Post";
import { db } from "../firebase";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import Comment from "../components/Comment";
import Head from "next/head";
import Login from "../components/Login";

function PostPage({ trendingResults, followResults, providers }) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useRecoilState(modalState);
  const [post, setPost] = useState();
  const [comments, setComments] = useState([]);
  const router = useRouter();
  const { id } = router.query;

  // Handle loading state for session
  if (status === "loading") return <div>Loading...</div>;

  // Redirect to login if not authenticated
  if (!session) return <Login providers={providers} />;

  // Fetch the post data when id changes
  useEffect(() => {
    if (!id) return; // Skip fetching if id is not present

    const unsubscribePost = onSnapshot(doc(db, "posts", id), (snapshot) => {
      setPost(snapshot.data());
    });

    // Cleanup subscription on unmount
    return () => unsubscribePost();
  }, [id]);

  // Fetch comments when id changes
  useEffect(() => {
    if (!id) return; // Skip fetching if id is not present

    const unsubscribeComments = onSnapshot(
      query(
        collection(db, "posts", id, "comments"),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => setComments(snapshot.docs)
    );

    // Cleanup subscription on unmount
    return () => unsubscribeComments();
  }, [id]);

  return (
    <div>
      <Head>
        <title>
          {post?.username} on weconnect: "{post?.text}"
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-black min-h-screen flex max-w-[1500px] mx-auto">
        <Sidebar />
        <div className="flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[370px]">
          <div className="flex items-center px-1.5 py-2 border-b border-gray-700 text-[#d9d9d9] font-semibold text-xl gap-x-4 sticky top-0 z-50 bg-black">
            <div
              className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0"
              onClick={() => router.push("/")}
            >
              <ArrowLeftIcon className="h-5 text-white" />
            </div>
            Tweet
          </div>

          <Post id={id} post={post} postPage />
          {comments.length > 0 && (
            <div className="pb-72">
              {comments.map((comment) => (
                <Comment
                  key={comment.id}
                  id={comment.id}
                  comment={comment.data()}
                />
              ))}
            </div>
          )}
        </div>
        <Widgets
          trendingResults={trendingResults}
          followResults={followResults}
        />

        {isOpen && <Modal />}
      </main>
    </div>
  );
}

export default PostPage;

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
