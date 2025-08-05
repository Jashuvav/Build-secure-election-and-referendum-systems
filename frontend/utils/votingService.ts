import { AptosClient, Types } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "@/constants";
import { Poll, PollCreateData, VoteData, PollResults } from "@/types/Poll";

export class VotingService {
  private client: AptosClient;
  private moduleAddress: string;
  private walletClient: any; // Wallet client for transactions

  constructor(client: AptosClient, moduleAddress: string, walletClient?: any) {
    this.client = client;
    this.moduleAddress = moduleAddress;
    this.walletClient = walletClient;
  }

  private getFunctionName(functionName: string): string {
    return `${this.moduleAddress}::voting::${functionName}`;
  }

  async createPoll(data: PollCreateData): Promise<number> {
    try {
      if (!this.walletClient) {
        throw new Error("Wallet client not available");
      }

      // First, try to initialize the contract if it hasn't been initialized
      try {
        await this.initializeContract();
      } catch (error) {
        // If initialization fails, it might already be initialized, continue
        console.log("Contract might already be initialized:", error);
      }

      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: this.getFunctionName("create_poll"),
        type_arguments: [],
        arguments: [
          data.title,
          data.description,
          data.options,
          data.startTime,
          data.endTime,
        ],
      };

      const response = await this.walletClient.submitTransaction(payload);
      await this.client.waitForTransaction({ transactionHash: response.hash });

      // Extract poll ID from events
      const events = await this.client.getEventsByEventHandle({
        event_handle_struct: `${this.moduleAddress}::voting::VotingEvents`,
        field_name: "poll_created_events",
        start: 0,
        limit: 1,
      });

      if (events.length > 0) {
        return Number(events[0].data.poll_id);
      }

      throw new Error("Failed to get poll ID from events");
    } catch (error) {
      console.error("Error creating poll:", error);
      throw new Error(`Failed to create poll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async initializeContract(): Promise<void> {
    try {
      if (!this.walletClient) {
        throw new Error("Wallet client not available");
      }

      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: this.getFunctionName("init"),
        type_arguments: [],
        arguments: [],
      };

      const response = await this.walletClient.submitTransaction(payload);
      await this.client.waitForTransaction({ transactionHash: response.hash });
    } catch (error) {
      console.error("Error initializing contract:", error);
      throw error;
    }
  }

  async castVote(data: VoteData): Promise<void> {
    try {
      if (!this.walletClient) {
        throw new Error("Wallet client not available");
      }

      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: this.getFunctionName("cast_vote"),
        type_arguments: [],
        arguments: [data.pollOwner, data.pollId, data.optionIndex],
      };

      const response = await this.walletClient.submitTransaction(payload);
      await this.client.waitForTransaction({ transactionHash: response.hash });
    } catch (error) {
      console.error("Error casting vote:", error);
      throw new Error(`Failed to cast vote: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async closePoll(pollOwner: string, pollId: number): Promise<void> {
    try {
      if (!this.walletClient) {
        throw new Error("Wallet client not available");
      }

      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: this.getFunctionName("close_poll"),
        type_arguments: [],
        arguments: [pollId],
      };

      const response = await this.walletClient.submitTransaction(payload);
      await this.client.waitForTransaction({ transactionHash: response.hash });
    } catch (error) {
      console.error("Error closing poll:", error);
      throw new Error(`Failed to close poll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async extendPoll(pollOwner: string, pollId: number, newEndTime: number): Promise<void> {
    try {
      if (!this.walletClient) {
        throw new Error("Wallet client not available");
      }

      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: this.getFunctionName("extend_poll"),
        type_arguments: [],
        arguments: [pollId, newEndTime],
      };

      const response = await this.walletClient.submitTransaction(payload);
      await this.client.waitForTransaction({ transactionHash: response.hash });
    } catch (error) {
      console.error("Error extending poll:", error);
      throw new Error(`Failed to extend poll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPollInfo(pollOwner: string, pollId: number): Promise<Poll> {
    try {
      const response = await this.client.view({
        function: this.getFunctionName("get_poll_info"),
        type_arguments: [],
        arguments: [pollOwner, pollId],
      });

      const [
        creator,
        title,
        description,
        options,
        startTime,
        endTime,
        closed,
        totalVotes,
      ] = response as [string, string, string, string[], number, number, boolean, number];

      return {
        id: pollId,
        creator,
        title,
        description,
        options,
        startTime,
        endTime,
        voteCounts: [],
        closed,
        totalVotes,
      };
    } catch (error) {
      console.error("Error getting poll info:", error);
      throw new Error(`Failed to get poll info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPollResults(pollOwner: string, pollId: number): Promise<PollResults> {
    try {
      const response = await this.client.view({
        function: this.getFunctionName("get_results"),
        type_arguments: [],
        arguments: [pollOwner, pollId],
      });

      const results = response as number[];
      const pollInfo = await this.getPollInfo(pollOwner, pollId);

      return {
        pollId,
        results,
        totalVotes: pollInfo.totalVotes,
        options: pollInfo.options,
      };
    } catch (error) {
      console.error("Error getting poll results:", error);
      throw new Error(`Failed to get poll results: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async hasVoted(pollOwner: string, pollId: number, voter: string): Promise<boolean> {
    try {
      const response = await this.client.view({
        function: this.getFunctionName("has_voted"),
        type_arguments: [],
        arguments: [pollOwner, pollId, voter],
      });

      return response as boolean;
    } catch (error) {
      console.error("Error checking if user has voted:", error);
      return false;
    }
  }

  async getUserVote(pollOwner: string, pollId: number, voter: string): Promise<number | null> {
    try {
      const response = await this.client.view({
        function: this.getFunctionName("get_vote"),
        type_arguments: [],
        arguments: [pollOwner, pollId, voter],
      });

      const voteOption = response as [number] | [];
      return voteOption.length > 0 ? voteOption[0] : null;
    } catch (error) {
      console.error("Error getting user vote:", error);
      return null;
    }
  }

  async getAllPollsCount(pollOwner: string): Promise<number> {
    try {
      const response = await this.client.view({
        function: this.getFunctionName("get_all_polls_count"),
        type_arguments: [],
        arguments: [pollOwner],
      });

      return response as number;
    } catch (error) {
      console.error("Error getting polls count:", error);
      return 0;
    }
  }

  async getPollIds(pollOwner: string): Promise<number[]> {
    try {
      const response = await this.client.view({
        function: this.getFunctionName("get_poll_ids"),
        type_arguments: [],
        arguments: [pollOwner],
      });

      return response as number[];
    } catch (error) {
      console.error("Error getting poll IDs:", error);
      return [];
    }
  }

  async getAllPolls(pollOwner: string): Promise<Poll[]> {
    try {
      const pollIds = await this.getPollIds(pollOwner);
      const polls: Poll[] = [];

      for (const pollId of pollIds) {
        try {
          const poll = await this.getPollInfo(pollOwner, pollId);
          const results = await this.getPollResults(pollOwner, pollId);
          poll.voteCounts = results.results;
          polls.push(poll);
        } catch (error) {
          console.error(`Error fetching poll ${pollId}:`, error);
        }
      }

      return polls.sort((a, b) => b.id - a.id); // Sort by newest first
    } catch (error) {
      console.error("Error getting all polls:", error);
      return [];
    }
  }

  async submitFeedback(pollOwner: string, pollId: number, feedback: string): Promise<void> {
    try {
      if (!this.walletClient) {
        throw new Error("Wallet client not available");
      }

      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: this.getFunctionName("submit_feedback"),
        type_arguments: [],
        arguments: [pollOwner, pollId, feedback],
      };

      const response = await this.walletClient.submitTransaction(payload);
      await this.client.waitForTransaction({ transactionHash: response.hash });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw new Error(`Failed to submit feedback: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getFeedbacks(pollOwner: string, pollId: number): Promise<string[]> {
    try {
      const response = await this.client.view({
        function: this.getFunctionName("get_feedbacks"),
        type_arguments: [],
        arguments: [pollOwner, pollId],
      });

      return response as string[];
    } catch (error) {
      console.error("Error getting feedbacks:", error);
      return [];
    }
  }
}

// Create a singleton instance
let votingServiceInstance: VotingService | null = null;

export const getVotingService = (client: AptosClient, walletClient?: any): VotingService => {
  if (!votingServiceInstance || !MODULE_ADDRESS) {
    votingServiceInstance = new VotingService(client, MODULE_ADDRESS, walletClient);
  } else if (walletClient) {
    // Update wallet client if provided
    votingServiceInstance = new VotingService(client, MODULE_ADDRESS, walletClient);
  }
  return votingServiceInstance;
}; 