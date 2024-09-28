import { BaseLayout } from "../../layout/BaseLayout.tsx";
import CreateRoom from "./components/createRoom.tsx";
import JoinRoom from "./components/JoinRoom.tsx";
import {useAuth} from "../../providers/AuthProvider.tsx";
import {useNavigate} from "react-router-dom";


export const HomePage = () => {
  const {user} = useAuth()
  const navigate = useNavigate()
  if(!user)  navigate("/auth/login")
  return (
    <BaseLayout>
      <div className="flex">
        <div className="flex-1 mr-8 border-r pr-8">
          <h1 className="text-3xl font-bold mb-4">Create Room</h1>
          <CreateRoom />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4">Join Room</h1>
          <JoinRoom />
        </div>
      </div>
    </BaseLayout>
  );
};