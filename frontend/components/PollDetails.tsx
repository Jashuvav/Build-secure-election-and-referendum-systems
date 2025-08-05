import React, { useState } from "react";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { aptosClient } from "@/utils/aptosClient";
import { Poll } from "@/types/Poll";

interface PollDetailsProps {
  poll: Poll;
}

const PollDetails: React.FC<PollDetailsProps> = ({ poll }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [results, setResults] = useState<number[] | null>(null);

  const { client } = useWalletClient();
  const handleVote = async () => {
    if (!client || selectedOption === null) return;

    try {
      const tx = await client.submitTransaction({
        function: "0x<contract_address>::VotingSystem::cast_vote",
        typeArguments: [],
        functionArguments: [poll.creator, poll.id, selectedOption]
      });
      await aptosClient().waitForTransaction({ transactionHash: tx.hash });
      setVoted(true);
      alert("Vote cast successfully!");
    } catch (err) {
      alert("Error casting vote: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const fetchResults = async () => {
    try {
      const resource = await aptosClient().getAccountResource({
        accountAddress: "0x<contract_address>",
        resourceType: "0x<contract_address>::VotingSystem::Poll"
      });
      if (resource && 'data' in resource) {
        const pollData = resource.data as any;
        setResults(pollData.vote_counts);
      }
    } catch (err) {
      alert("Error fetching results: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded shadow mt-4">
      <h3 className="text-lg font-bold mb-2">{poll.title}</h3>
      <p className="mb-2">{poll.description}</p>
      <div className="mb-2">
        <strong>Options:</strong>
        <ul>
          {poll.options.map((opt: string, idx: number) => (
            <li key={idx}>
              <label>
                <input
                  type="radio"
                  name="voteOption"
                  value={idx}
                  disabled={voted || poll.closed}
                  checked={selectedOption === idx}
                  onChange={() => setSelectedOption(idx)}
                />
                {opt}
              </label>
            </li>
          ))}
        </ul>
      </div>
      {!poll.closed ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={selectedOption === null || voted}
          onClick={handleVote}
        >
          Cast Vote
        </button>
      ) : (
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={fetchResults}
        >
          Show Results
        </button>
      )}
      {results && (
        <div className="mt-4">
          <strong>Results:</strong>
          <ul>
            {poll.options.map((opt: string, idx: number) => (
              <li key={idx}>
                {opt}: {results[idx]} votes
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PollDetails;
