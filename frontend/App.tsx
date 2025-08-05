import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Header } from "@/components/Header";
import { MessageBoard } from "@/components/MessageBoard";
import { TopBanner } from "@/components/TopBanner";
import PollCreate from "./components/PollCreate";
import PollList from "./components/PollList";
import PollDetails from "./components/PollDetails";
import React, { useState } from "react";
import NFTClaim from "./components/NFTClaim";
import FeedbackForm from "./components/FeedbackForm";
import { Poll } from "./types/Poll";

function App() {
  const { connected } = useWallet();
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);

  // Pass setSelectedPoll and polls to PollList, and selectedPoll to PollDetails
  return (
    <>
      <TopBanner />
      <Header />
      <main className="container mx-auto p-4">
        <PollCreate />
        <PollList polls={polls} setSelectedPoll={setSelectedPoll} setPolls={setPolls} />
        {selectedPoll && (
          <>
            <PollDetails poll={selectedPoll} />
            <NFTClaim pollOwner={selectedPoll.creator} pollId={selectedPoll.id} />
            <FeedbackForm pollOwner={selectedPoll.creator} pollId={selectedPoll.id} />
          </>
        )}
        <MessageBoard />
      </main>
    </>
  );
}

export default App;
