import { Avatar, Box, Flex, Image, Text } from "@chakra-ui/react";
import { BsThreeDots } from "react-icons/bs";
import { Link } from "react-router-dom";
import Actions from "./Actions";
import { useState } from "react";

const UserPost = ({likes, replies, postImage, postTitle}) => {
  const [liked, setLiked] = useState(false);
  return (
    <Link to={"/markzuckerberg/post/1"}>
      <Flex gap={3} mb={4} py={5}>
        <Flex flexDirection={"column"} alignItems={"center"}>
          <Avatar size={"md"} name="mark zuckerberg" src="/zuck-avatar.png" />
          <Box w="1px" h={"full"} bg={"gray.light"} my={2}></Box>
          <Box position={"relative"} w={"full"}>
            <Avatar
              size={"xs"}
              name="Tarak"
              src="https://i.pravatar.cc/300?u=iu"
              position={"absolute"}
              top={"0px"}
              left={"15px"}
              padding={"2px"}
            />

            <Avatar
              size={"xs"}
              name="Dummy"
              src="https://i.pravatar.cc/300?u=po"
              position={"absolute"}
              bottom={"0px"}
              right={"-5px"}
              padding={"2px"}
            />

            <Avatar
              size={"xs"}
              name="mellisa"
              src="https://i.pravatar.cc/300?u=iu"
              position={"absolute"}
              bottom={"0px"}
              left={"4px"}
              padding={"2px"}
            />
          </Box>
        </Flex>
        <Flex flex={1} flexDirection={"column"} gap={2}>
            <Flex justifyContent={"space-between"} w={"full"}>
                <Flex w={"full"} alignItems={"center"}>
                    <Text fontSize={"sm"} fontWeight={"bold"}>mark zuckerberg</Text>
                    <Image src="/verified.png" w={4} h={4} ml={1}/>
                </Flex>
                <Flex gap={4} alignItems={"center"}>
                <Text fontSize={"sm"} color={"gray.light"}>1d</Text>
                <BsThreeDots/>
                </Flex>
            </Flex>
            <Text fontSize={"sm"}>{postTitle}</Text>
            {postImage && (
            <Box
            borderRadius={6}
            overflow={"hidden"}
            border={"1px solid "}
            borderColor={"gray.light"}
            >
                <Image src={postImage} w={"full"}/>
            </Box>
            )}
            <Flex gap={3} my={1}>
              <Actions liked={liked} setLiked={setLiked}/>
            </Flex>

            <Flex gap={2} alignItems={"center"} >
              <Text color={"gray.light"} fontSize={"sm"}>{replies} replies</Text>
              <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
              <Text color={"gray.light"} fontSize={"sm"}>{likes} likes</Text>
            </Flex>
        </Flex>
      </Flex>
    </Link>
  );
};

export default UserPost;
