import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "./useShowToast";


const useLogout = () => {
    const [user, setUser] = useRecoilState(userAtom);
    const toast = useShowToast();
    const logout = async() => {
        try {
            
            const res = await fetch("/api/users/logout", {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
            })

            const data = await res.json();
            console.log(data);
            
            if(data.error) {
                toast("Error", data.error, "error")
                return;
            }
            localStorage.removeItem("user-threads");
            setUser(null);
        } catch (error) {
            toast("Error", error, "error");
        }
    }
    return logout;
}

export default useLogout