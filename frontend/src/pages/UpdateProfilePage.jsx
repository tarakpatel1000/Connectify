'use client'

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import userAtom from '../atoms/userAtom'
import usePreviewImg from '../hooks/usePreviewImg'
import useShowToast from '../hooks/useShowToast'

export default function UpdateProfilePage() {
    const [user,setUser] = useRecoilState(userAtom);
    console.log("UserState", user);
    const [inputs, setInputs] = useState({
        name : user.name,
        username : user.username,
        email : user.email,
        bio : user.bio,
        password : "",
        profilePic : user.profilePic
    })
    const [updating, setUpdating] = useState(false);

    const fileRef = useRef(null);
    const toast = useShowToast();

    const { handleImageChange, imgUrl } = usePreviewImg();

    const handleSubmit = async(e) => {
      
      e.preventDefault();
      setUpdating(true);
      try {
        const res = await fetch(`/api/users/update/${user._id}`, {
          method : "PUT",
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify({...inputs, profilePic : imgUrl})
        });

        const data = await res.json();
        if(data.error) {
          toast("Error", data.error, "error");
          return;
        }

        toast("Success", data.message, "success");
        console.log("UpdateProfilePic", data);
        setUser(data.user);
        localStorage.setItem("user-threads", JSON.stringify(data.user));
        
      } catch (error) {
        toast("Error", error, "error");
      } finally {
        setUpdating(false);
      }
    }
  return (
    <form onSubmit={handleSubmit}>
    <Flex
      align={'center'}
      justify={'center'}
      my={6}
      >
      <Stack
        spacing={4}
        w={'full'}
        maxW={'md'}
        bg={useColorModeValue('white', 'gray.dark')}
        rounded={'xl'}
        boxShadow={'lg'}
        p={6}
        >
        <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
          User Profile Edit
        </Heading>
        <FormControl id="userName">
          <Stack direction={['column', 'row']} spacing={6}>
            <Center>
              <Avatar size="xl" boxShadow={"md"} src={imgUrl || user.profilePic}/>
              
            </Center>
            <Center w="full">
              <Button w="full" onClick={() => fileRef.current.click()}>Change Avatar</Button>
              <Input type='file' hidden ref={fileRef} onChange={handleImageChange}/>
            </Center>
          </Stack>
        </FormControl>
        <FormControl>
          <FormLabel>Full name</FormLabel>
          <Input
            placeholder="John Cena"
            _placeholder={{ color: 'gray.500' }}
            type="text"
            onChange={(e) => setInputs({...inputs, name : e.target.value})}
            value={inputs.name}
          />
        </FormControl>
        <FormControl>
          <FormLabel>User name</FormLabel>
          <Input
            placeholder="UserName"
            _placeholder={{ color: 'gray.500' }}
            type="text"
            onChange={(e) => setInputs({...inputs, username : e.target.value})}
            value={inputs.username}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Email address</FormLabel>
          <Input
            placeholder="your-email@example.com"
            _placeholder={{ color: 'gray.500' }}
            type="email"
            onChange={(e) => setInputs({...inputs, email : e.target.value})}
            value={inputs.email}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Bio</FormLabel>
          <Input
            placeholder="Describe yourself"
            _placeholder={{ color: 'gray.500' }}
            type="text"
            onChange={(e) => setInputs({...inputs, bio : e.target.value})}
            value={inputs.bio}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            placeholder="password"
            _placeholder={{ color: 'gray.500' }}
            type="password"
            onChange={(e) => setInputs({...inputs, password : e.target.value})}
            value={inputs.password}
          />
        </FormControl>
        <Stack spacing={6} direction={['column', 'row']}>
          <Button
            bg={'red.400'}
            color={'white'}
            w="full"
            _hover={{
              bg: 'red.500',
            }}>
            Cancel
          </Button>
          <Button
            bg={'blue.400'}
            color={'white'}
            w="full"
            _hover={{
              bg: 'blue.500',
            }} type='submit' isLoading={updating}>
            Submit
          </Button>
        </Stack>
      </Stack>
    </Flex>
    </form>
  )
}