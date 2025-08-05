import React, { useState } from "react";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { aptosClient } from "@/utils/aptosClient";

interface NFTClaimProps {
  pollOwner: string;
  pollId: number;
}

const NFTClaim: React.FC<NFTClaimProps> = ({ pollOwner, pollId }) => {
  const [claimed, setClaimed] = useState(false);
  const { client } = useWalletClient();

  const handleClaim = async () => {
    if (!client) return;

    try {
      const tx = await client.submitTransaction({
        function: "0x<contract_address>::VotingSystem::issue_nft_certificate",
        typeArguments: [],
        functionArguments: [pollOwner, pollId],
      });
      await aptosClient().waitForTransaction({ transactionHash: tx.hash });
      setClaimed(true);
      alert("NFT claimed successfully!");
    } catch (err) {
      alert("Error claiming NFT: " + String(err));
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-2">Claim Your Voting NFT Certificate</h2>
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded"
        disabled={claimed}
        onClick={handleClaim}
      >
        {claimed ? "NFT Claimed" : "Claim NFT"}
      </button>
    </div>
  );
};

export default NFTClaim;
