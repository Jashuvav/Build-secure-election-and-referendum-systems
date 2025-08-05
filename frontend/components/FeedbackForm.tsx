import React, { useState } from "react";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { Types } from "aptos";
import { aptosClient } from "@/utils/aptosClient";

interface FeedbackFormProps {
  pollOwner: string;
  pollId: number;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ pollOwner, pollId }) => {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { client } = useWalletClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    
    try {
      const tx = await client.submitTransaction({
        function: "0x<contract_address>::VotingSystem::submit_feedback",
        typeArguments: [],
        functionArguments: [pollOwner, pollId, feedback]
      });
      await aptosClient().waitForTransaction({ transactionHash: tx.hash });
      
      setSubmitted(true);
      alert("Feedback submitted successfully!");
    } catch (err) {
      alert("Error submitting feedback: " + String(err));
    }
  };

  return (
    <form className="bg-white p-4 rounded shadow mb-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-2">Submit Feedback</h2>
      <textarea
        placeholder="Your feedback..."
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        className="border p-2 mb-2 w-full"
        required
        disabled={submitted}
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
        disabled={submitted}
      >
        {submitted ? "Submitted" : "Submit Feedback"}
      </button>
    </form>
  );
};

export default FeedbackForm;
