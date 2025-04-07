import { Button, Flex, Link, useColorMode } from "@chakra-ui/react"
import { Image } from "@chakra-ui/react"
import lightLogo from "/light-logo.svg"
import darkLogo from "/dark-logo.svg"
import { useRecoilState, useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom"
import { Link as RouterLink } from "react-router-dom"
import {AiFillHome} from "react-icons/ai";
import {RxAvatar} from "react-icons/rx";
import { FiLogOut } from "react-icons/fi"
import useLogout from "../hooks/useLogout"
import authScreenAtom from "../atoms/authAtom"
import {BsFillChatQuoteFill} from "react-icons/bs";
import {MdOutlineSettings} from "react-icons/md"

const Header = () => {
    const {colorMode, toggleColorMode} = useColorMode()
    const user = useRecoilValue(userAtom);
    const logout = useLogout();
    const [authScreen, setAuthScreen] = useRecoilState(authScreenAtom)
  return (
    <Flex justifyContent={'space-between'} mt ={6} mb={12}>
      {user && (
        <Link as={RouterLink} to="/">
        <AiFillHome size={24}/>
        </Link>
      )}

      {!user && (
        <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen('login')}>
        Login
        </Link>
      )} 
        <Image
        cursor={'pointer'}
        alt="logo"
        src={colorMode === 'dark' ? lightLogo : darkLogo}
        onClick={toggleColorMode}
        w={6}
        />

        {user && (
        <Flex alignItems={"center"} gap={4}>
          <Link as={RouterLink} to={`/${user.username}`}>
        <RxAvatar size={24}/>
        </Link>

        <Link as={RouterLink} to={`/chat`}>
        <BsFillChatQuoteFill size={20}/>
        </Link>

        <Link as={RouterLink} to={`/settings`}>
        <MdOutlineSettings size={20}/>
        </Link>
        <Button size={"xs"} onClick={logout}>
              <FiLogOut size={20}/>
            </Button>
        </Flex>
      )}

      {!user && (
        <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen('signup')}>
        Sign Up
        </Link>
      )} 
    </Flex>
  )
}

export default Header