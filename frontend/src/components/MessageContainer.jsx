import { Avatar, Divider, Flex, Image, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import Message from './Message'
import MessageInput from './MessageInput'
import { useEffect, useRef, useState } from 'react'
import useShowToast from '../hooks/useShowToast'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { conversationsAtom, selectedConversationAtom } from '../atoms/messagesAtom'
import userAtom from '../atoms/userAtom'
import { useSocket } from '../socketContext/SocketContext'



const messageSound = "/message.mp3"
const MessageContainer = () => {
	const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
	const [loadingMessages, setLoadingMessages] = useState(true);
	const [messages, setMessages] = useState([]);
	const toast = useShowToast();
	const currentUser = useRecoilValue(userAtom);
	const {socket} = useSocket();
	const setConversations = useSetRecoilState(conversationsAtom);
	const messageEndRef = useRef(null);

	useEffect(() => {
		socket.on("newMessage", (message) => {
			if(selectedConversation._id === message.conversationId){
				setMessages((prevMessage) => [...prevMessage, message]);
			}

			if(document.hasFocus()) {
				const sound = new Audio(messageSound);
                sound.play().catch((err) => console.log("Audio error:", err));
			}
			setConversations((prevConversation) => {
				const updatedConversations = prevConversation.map((conversation) => {
					if(conversation._id === message.conversationId) {
						return {
							...conversation,
							lastMessage : {
								text : message.text,
								sender : message.sender
							}
						}
					}
					return conversation;
				})
				return updatedConversations;
			})
		});

		return () => socket.off("newMessage")
	}, [socket, selectedConversation._id, setConversations])

	useEffect(() => {
		const lastMessageFromOtherUser =messages.length > 0 && messages[messages.length - 1].sender !== currentUser.id;
		if(lastMessageFromOtherUser) {
			socket.emit("markMessagesAsSeen", {
				conversationId : selectedConversation._id,
				userId : selectedConversation.userId
			})
		}

		socket.on("messagesSeen", ({conversationId}) => {
			if(selectedConversation._id === conversationId){
				setMessages((prev) => {
					const updatedMessages = prev.map((message) => {
						if(!message.seen) {
							return {
								...message,
								seen : true
							}
						}
						return message;
					})
					return updatedMessages
				})
			}
		})
	}, [currentUser.id, messages, selectedConversation._id, selectedConversation.userId,socket])

	useEffect(() => {
		messageEndRef.current?.scrollIntoView({behavior : "smooth"})
	}, [messages])

	useEffect(() => {
		const getMessages = async () => {
			try {
				setLoadingMessages(true);
				setMessages([]);
				if(selectedConversation.mock) {
					return;
				}
				const res = await fetch(`/api/messages/${selectedConversation.userId}`)
				const data = await res.json();
				if(data.error) {
					return toast("Error", data.error, "error");
				}
				
				setMessages(data);
			} catch (error) {
				toast("Error", error.message, "error");
			} finally {
				setLoadingMessages(false)
			}
		}
		getMessages();
	}, [toast, selectedConversation.userId, selectedConversation.mock])
  return (
    <Flex flex={"70%"}
    bg={useColorModeValue("gray.200", "gray.dark")}
    borderRadius={"md"}
    p={2}
    flexDirection={"column"}>
        {/* {Message Header} */}
        <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
				<Avatar src={selectedConversation.userProfilePic} size={"sm"} />
				<Text display={"flex"} alignItems={"center"}>
					{selectedConversation.username} <Image src='/verified.png' w={4} h={4} ml={1} />
				</Text>
			</Flex>
            <Divider/>
            <Flex flexDir={"column"} gap={4} my={4} p={2} height={"400px"} overflowY={"auto"}>
                {loadingMessages && (
                    [...Array(5)].map((_, i) => (
						<Flex
							key={i}
							gap={2}
							alignItems={"center"}
							p={1}
							borderRadius={"md"}
							alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
						>
							{i % 2 === 0 && <SkeletonCircle size={7} />}
							<Flex flexDir={"column"} gap={2}>
								<Skeleton h='8px' w='250px' />
								<Skeleton h='8px' w='250px' />
								<Skeleton h='8px' w='250px' />
							</Flex>
							{i % 2 !== 0 && <SkeletonCircle size={7} />}
						</Flex>
                )))}


				{!loadingMessages && messages.length > 0 && (
					messages.map((message) => (
						<Flex key={message._id} direction={"column"} ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null}>
							<Message message={message} ownMessage={currentUser.id === message.sender}/>
						</Flex>
					))
				)}
                
                
            </Flex>
			<MessageInput setMessages = {setMessages}/>
    </Flex>
  )
}

export default MessageContainer