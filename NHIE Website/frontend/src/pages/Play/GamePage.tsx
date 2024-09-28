import { BaseLayout } from "../../layout/BaseLayout";
import GameRoom from "./components/GameRoom";
import ShowGame from "./components/ShowGame";
import ChatRoom from "./components/ChatRoom"; 
export const GamePage = () => {
  return (
    <BaseLayout>
      {/* Use md:flex to switch to an inline layout on medium and larger screens */}
      <div className="md:flex -mx-4">
        {/* Negative margins mx-4 cancel out the padding of children for precise alignment */}

        {/* Column for joining the game */}
        <div className="md:flex-1 px-4 mb-8 md:mb-0">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-white mb-4">Join the Game!</h1>
            <GameRoom />
          </div>
        </div>

        {/* Column for game details */}
        <div className="md:flex-1 px-4">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-white mb-4">Game Details</h1>
            <ShowGame />
          </div>
        </div>
      </div>

      {/* Section for chat that adapts to full width on all screens */}
      <div className="px-4">
        <div className="bg-gray-100 p-8 rounded-lg shadow-md">
          <ChatRoom />
        </div>
      </div>
    </BaseLayout>
  );
};
