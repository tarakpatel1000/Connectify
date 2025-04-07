import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Conversation from "../components/Conversation";
import {GiConversation} from "react-icons/gi"
import MessageContainer from "../components/MessageContainer";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../socketContext/SocketContext";

const ChatPage = () => {
  const toast = useShowToast();
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
  const [searchText, setSearchText] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const currentUser = useRecoilValue(userAtom);
  const {socket, onlineUsers} = useSocket();
 
  

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    setLoadingState(true);
    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const data = await res.json();

      if(data.error) {
        return toast("Error", data.error, "error");
      }

      //if user is trying to message or search themselves
      if(data._id === currentUser.id) {
        return toast("Error", "You cannot message/search yourself", "error")
      }

      //if user is already in a conversation with the searched user
      const conversationAlreadyExists = conversations.find(conversation => conversation.participants[0]._id === data._id);
      if(conversationAlreadyExists) {
        setSelectedConversation({
          _id : conversations.find(conversation => conversation.participants[0]._id === data._id)._id,
          userId : data._id,
          username : data.username,
          userProfilePic : data.profilePic,
        })
        return;
      }

      const mockConversation = {
        mock : true,
        lastMessage : {
          text : "",
          sender : ""
        },
        _id : Date.now(),
        participants : [
          {
            _id : data._id,
            username : data.username,
            profilePic : data.profilepic
          }
        ]
      }

      setConversations((prevConversation) => [...prevConversation, mockConversation]);
    } catch (error) {
      toast("Error", error.message, "error");
    } finally {
      setLoadingState(false)
    }
  }

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();
        console.log(data);
        if(data.error) {
          toast("Error", data.error, "error");
          return;
        }
        setConversations(data);
      } catch (error) {
        toast("Error", error.message, "error");
      } finally {
        setLoadingConversations(false);
      }
    }
    getConversations();
  }, [toast, setConversations])
  return (
    <Box
      position={"absolute"}
      left={"50%"}
      w={{ base: "100%", md: "80%", lg: "750px" }}
      p={4}
      transform={"translateX(-50%)"}
    >
      <Flex
        gap={4}
        flexDirection={{ base: "column", md: "row" }}
        maxW={{ sm: "400px", md: "full" }}
        mx={"auto"}
      >
        <Flex
          flex={30}
          gap={2}
          flexDirection={"column"}
          maxW={{ sm: "250px", md: "full" }}
          mx={"auto"}
        >
          <Text
            fontWeight={700}
            color={useColorModeValue("gray.600", "gray.400")}
          >
            Your Conversations
          </Text>
          <form onSubmit={handleConversationSearch}>
            <Flex alignItems={"center"} gap={2}>
              <Input placeholder="Search for a user" onChange={(e) => setSearchText(e.target.value)} value={searchText}/>
              <Button size={"sm"} onClick={handleConversationSearch} isLoading={loadingState}>
                <SearchIcon />
              </Button>
            </Flex>
          </form>

          {loadingConversations &&
            [0, 1, 2, 3, 4, 5].map((_, i) => (
              <Flex
                key={i}
                gap={4}
                alignItems={"center"}
                p={1}
                borderRadius={"md"}
              >
                <Box>
                  <SkeletonCircle size={10} />
                </Box>
                <Flex w={"full"} flexDirection={"column"} gap={3}>
                  <Skeleton h={"10px"} w={"80px"} />
                  <Skeleton h={"8px"} w={"90%"} />
                </Flex>
              </Flex>
            ))}

          {!loadingConversations && (
            conversations.map((conversation) => (
              <Conversation key={conversation._id} conversation = {conversation} isOnline = {onlineUsers.includes(conversation.participants[0]._id)}/>
            ))
          )}
        </Flex>

        {!selectedConversation._id && (
        <Flex
          flex={70}
          borderRadius={"md"}
          p={2}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
          h={"400px"}
        ><GiConversation size={100}/>
        <Text fontSize={20}>Select a conversation to start messaging</Text>
        </Flex>
        )}

        {selectedConversation._id && <MessageContainer/>}
        
      </Flex>
    </Box>
  );
};

export default ChatPage;
