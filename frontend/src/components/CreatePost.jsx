import {
  Button,
  CloseButton,
  Flex,
  FormControl,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon, useColorModeValue } from "@chakra-ui/icons";
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import { BsFillImageFill } from "react-icons/bs";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postAtom from "../atoms/postsAtom";
import { useParams } from "react-router-dom";

const MAX_CHAR = 500;

const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [postText, setPostText] = useState("");
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR);
  const [loading, setIsLoading] = useState(false);
  const [posts, setPosts] = useRecoilState(postAtom);
  const user = useRecoilValue(userAtom);
  const toast = useShowToast();
  const {username} = useParams();

  const handleTextChange = (e) => {
    const inputText = e.target.value;
    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChars(0);
    } else {
      setPostText(inputText);
      setRemainingChars(MAX_CHAR - inputText.length);
    }
  };

  const handleCreatePost = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postedBy: user.id,
          text: postText,
          img: imgUrl,
        }),
      });

      const data = await res.json();
      if (data.error) {
        toast("Error", data.error, "error");
        return;
      }

      toast("Success", "Post created successfully", "success");
      if(username === user.username) {
        setPosts([data, ...posts]);
      }
      
      onClose();
      setPostText("");
      setImgUrl("");
    } catch (error) {
      toast("Error", error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const imageRef = useRef(null);
  return (
    <>
      <Button
        position={"fixed"}
        bottom={10}
        right={5}
        size={{base : "sm", sm : "md"}}
        bg={useColorModeValue("gray.300", "gray.dark")}
        onClick={onOpen}
      ><AddIcon /></Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Textarea
                placeholder="Write a post..."
                onChange={handleTextChange}
                value={postText}
              />
              <Text
                fontSize={"xs"}
                font
                fontWeight={"bold"}
                textAlign={"right"}
                m={1}
                color={"gray.800"}
              >
                {remainingChars}/{MAX_CHAR}
              </Text>
              <Input
                type="file"
                ref={imageRef}
                hidden
                onChange={handleImageChange}
              />
              <BsFillImageFill
                style={{ marginLeft: "5px", cursor: "pointer" }}
                size={16}
                onClick={() => imageRef.current.click()}
              />
            </FormControl>

            {imgUrl && (
              <Flex mt={5} w={"full"} position={"relative"}>
                <Image src={imgUrl} alt="selected-Image" />
                <CloseButton
                  onClick={() => setImgUrl("")}
                  bg={"gray.800"}
                  position={"absolute"}
                  top={2}
                  right={2}
                />
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleCreatePost}
              isLoading={loading}
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
