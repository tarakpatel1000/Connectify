import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import Actions from "../components/Actions";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useEffect } from "react";
import useShowToast from "../hooks/useShowToast";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";
import Comment from "../components/Comment";
import postAtom from "../atoms/postsAtom";

const PostPage = () => {
  const { user, loading } = useGetUserProfile();
  const [posts, setPosts] = useRecoilState(postAtom);
  const toast = useShowToast();
  const { pid } = useParams();
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const currentPost = posts[0];

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post?")) {
      return;
    }
    try {
      const res = await fetch(`/api/posts/${currentPost._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      console.log(data);

      if (data.error) {
        return toast("Error", data.error, "error");
      }

      toast("Success", "Post deleted successfully", "success");
      navigate(`/${user.username}`);
    } catch (error) {
      toast("Error", error, "error");
    }
  };

  useEffect(() => {
    const getPosts = async () => {
      setPosts([]);
      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        console.log(data);
        if (data.error) {
          return toast("Error", data.error, "error");
        }
        setPosts([data]);
      } catch (error) {
        toast("Error", error.message, "error");
      }
    };
    getPosts();
  }, [toast, pid, setPosts]);

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!currentPost) {
    return (
      <Flex justifyContent={"center"} my={5}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }
  return (
    <>
      <Flex>
        <Flex w={"full"} alignItems={"center"} gap={3}>
          <Avatar src={user.profilePic} size={"md"} name="Mark Zuckerberg" />
          <Flex>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {user.username}
            </Text>
            <Image src="/verified.png" w={4} h={4} ml={4} />
          </Flex>
        </Flex>
        <Flex gap={4} alignItems={"center"}>
          <Text fontSize={"sm"} width={36} color={"gray.light"}>
            {formatDistanceToNow(new Date(currentPost.createdAt))} ago
          </Text>

          {currentUser?.id === user?._id && (
            <DeleteIcon
              size={20}
              onClick={handleDeletePost}
              cursor={"pointer"}
            />
          )}
        </Flex>
      </Flex>

      <Text my={3}>{currentPost?.text}</Text>
      {currentPost.img && (
        <Box
          borderRadius={6}
          overflow={"hidden"}
          border={"1px solid "}
          borderColor={"gray.light"}
        >
          <Image src={currentPost?.img} w={"full"} />
        </Box>
      )}
      <Flex gap={3} my={3}>
        <Actions post={currentPost} />
      </Flex>
      <Divider my={4} />

      <Flex justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text fontSize={"2xl"}>👋</Text>
          <Text color={"gray.light"}>Get the app to like, reply and post</Text>
        </Flex>
        <Button>Get</Button>
      </Flex>
      <Divider my={4} />
      {currentPost.replies.map((reply) => (
        <Comment key={reply._id} reply={reply} lastReply = {reply._id === currentPost.replies[currentPost.replies.length - 1]._id}/>
      ))}
    </>
  );
};

export default PostPage;
