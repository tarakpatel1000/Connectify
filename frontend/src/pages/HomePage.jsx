
import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";

const HomePage = () => {
  const toast = useShowToast();
  const [posts, setPosts] = useRecoilState(postAtom);
  const [loading, setLoading] = useState(false);
  


  useEffect(() => {
    const getFeedPosts = async () => {
      try {
        setLoading(true);
        setPosts([]);
        const res = await fetch("/api/posts/feed");
        const data = await res.json();
        if(data.error) {
          toast("Error", data.error, "error");
          return;
        }

        console.log(data);
        setPosts(data);
        
      } catch (error) {
        toast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    }
    getFeedPosts();
  }, [toast,setPosts])
  return (
    <Flex gap={10} alignItems={"flex-start"}>
    <Box flex={70}>
    {loading && (
      <Flex justify={"center"}>
        <Spinner size={"xl"}/>
      </Flex>
    )}

    {!loading && posts.length === 0 && (
      <h1 style={{textAlign : "center"}}>Follow some users to see the feed</h1>
    )}

    {posts.map((posts) => (
      <Post key={posts._id} post={posts} postedBy = {posts.postedBy}/>
    ))}
    </Box>

    <Box flex={30}
    display={{base : "none", md : "block"}}
    >
      <SuggestedUsers/>
    </Box>
    </Flex>
  );
};

export default HomePage;
