import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import useShowToast from './useShowToast';

const useGetUserProfile = () => {
    
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const {username} = useParams();
  const toast = useShowToast();
  
  useEffect(() => {
    const getUser = async () => {
        try {
          const res = await fetch(`/api/users/profile/${username}`);
          const data = await res.json();
          console.log("data",data);
          if(data.error) {
            toast("Error", data.error, "error");
            return;
          }

          if(data.isFrozen) {
            setUser(null);
            return;
          }
          setUser(data);
        } catch (error) {
          toast("Error", error, "error");
        } finally {
          setLoading(false);
        }
      }
      getUser();
  },[username, toast])

  return {loading, user}
}

export default useGetUserProfile;