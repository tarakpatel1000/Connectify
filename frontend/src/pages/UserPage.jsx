import { useEffect } from "react"
import UserHeader from "../components/UserHeader"
import UserPost from "../components/UserPost"
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postAtom from "../atoms/postsAtom";

const UserPage = () => {
  const {user, loading} = useGetUserProfile();
  const {username} = useParams();
  const toast = useShowToast();
  const [posts, setPosts] = useRecoilState(postAtom);

  useEffect(() => {
   
    const getPosts = async () => {
      if(!user) {
        return;
      }
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();
        console.log(data)
        if(data.error) {
          return toast("Error", data.error, "error");
        }
        setPosts(data);
      } catch (error) {
        toast("Error", error, "error");
      }
    }
    getPosts();
  }, [username, toast, setPosts, user])

  if(!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"}/>
      </Flex>
    )
  }
  if(!user && !loading) {
    return <h1>User not found</h1>;
  }
  return (
    <>
    <UserHeader user = {user}/>
    {posts.length === 0 ? <h1>User haven't posted anything</h1> : (
      posts.map((post) => (
        <Post key = {post._id} post = {post} postedBy = {post.postedBy}/>
      ))
    )}
    
    </>
  )
}

export default UserPage