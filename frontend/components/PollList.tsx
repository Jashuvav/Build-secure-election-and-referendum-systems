import React, { useEffect } from "react";
import { aptosClient } from "@/utils/aptosClient";
import { Poll } from "@/types/Poll";

const fetchPolls = async (): Promise<Poll[]> => {
  try {
    const resources = await aptosClient().getAccountResources({ 
      accountAddress: "0x<contract_address>" 
    });
    const pollResource = resources.find(
      r => r.type === "0x<contract_address>::VotingSystem::PollList"
    );
    
    if (pollResource && 'data' in pollResource) {
      const data = pollResource.data as any;
      return data.polls.map((p: any) => ({
        id: Number(p.id),
        creator: p.creator,
        title: p.title,
        description: p.description,
        options: p.options,
        endTime: Number(p.end_time),
        voteCounts: p.vote_counts.map(Number),
        closed: Number(p.end_time) < Date.now() / 1000
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching polls:", error);
    return [];
  }
};

interface PollListProps {
  polls: Poll[];
  setSelectedPoll: (poll: Poll) => void;
  setPolls: (polls: Poll[]) => void;
}

const PollList: React.FC<PollListProps> = ({ polls, setSelectedPoll, setPolls }) => {
  useEffect(() => {
    fetchPolls().then(setPolls);
  }, [setPolls]);

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-2">Available Polls</h2>
      <ul>
        {polls.map(poll => (
          <li key={poll.id} className="mb-2">
            <button
              className="text-blue-600 underline"
              onClick={() => setSelectedPoll(poll)}
            >
              {poll.title}
            </button>
            <span className="ml-2 text-gray-500">{poll.closed ? "(Closed)" : "(Open)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PollList;
