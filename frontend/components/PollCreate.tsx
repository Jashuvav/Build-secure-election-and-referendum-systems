import React, { useState } from "react";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { aptosClient } from "@/utils/aptosClient";

const PollCreate: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState([""]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleOptionChange = (idx: number, value: string) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, ""]);

  const { client } = useWalletClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    try {
      const tx = await client.submitTransaction({
        function: "0x<contract_address>::VotingSystem::create_poll",
        typeArguments: [],
        functionArguments: [title, description, options, Math.floor(Date.parse(startTime)/1000), Math.floor(Date.parse(endTime)/1000)]
      });
      await aptosClient().waitForTransaction({ transactionHash: tx.hash });
      alert("Poll created successfully!");
    } catch (err) {
      alert("Error creating poll: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <form className="bg-white p-4 rounded shadow mb-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-2">Create a New Poll</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="border p-2 mb-2 w-full"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="border p-2 mb-2 w-full"
        required
      />
      <div className="mb-2">
        <label className="block font-semibold">Options</label>
        {options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            value={opt}
            onChange={e => handleOptionChange(idx, e.target.value)}
            className="border p-2 mb-1 w-full"
            required
          />
        ))}
        <button type="button" onClick={addOption} className="text-blue-500">Add Option</button>
      </div>
      <input
        type="datetime-local"
        value={startTime}
        onChange={e => setStartTime(e.target.value)}
        className="border p-2 mb-2 w-full"
        required
      />
      <input
        type="datetime-local"
        value={endTime}
        onChange={e => setEndTime(e.target.value)}
        className="border p-2 mb-2 w-full"
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Poll</button>
    </form>
  );
};

export default PollCreate;
