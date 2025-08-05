module voting_system::voting {
    use std::signer;
    use std::vector;
    use std::string;
    use std::table;
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 0;
    const E_VOTING_NOT_STARTED: u64 = 1;
    const E_VOTING_ENDED: u64 = 2;
    const E_POLL_CLOSED: u64 = 3;
    const E_ALREADY_VOTED: u64 = 4;
    const E_NOT_POLL_OWNER: u64 = 5;
    const E_UNAUTHORIZED: u64 = 6;
    const E_POLL_NOT_CLOSED: u64 = 7;
    const E_NOT_VOTED: u64 = 8;

    /// Poll structure
    struct Poll has key, store {
        creator: address,
        title: string::String,
        description: string::String,
        options: vector<string::String>,
        start_time: u64,
        end_time: u64,
        votes: table::Table<address, u64>, // address -> option index
        tally: vector<u64>, // option index -> count
        closed: bool,
        feedbacks: vector<string::String>,
    }

    struct Polls has key {
        polls: table::Table<u64, Poll>, // poll_id -> Poll
        next_id: u64,
    }

    public fun init(owner: &signer) {
        let polls = Polls {
            polls: table::new(),
            next_id: 0,
        };
        move_to(owner, polls);
    }

    public fun create_poll(
        creator: &signer,
        title: string::String,
        description: string::String,
        options: vector<string::String>,
        start_time: u64,
        end_time: u64
    ): u64 acquires Polls {
        let polls = borrow_global_mut<Polls>(signer::address_of(creator));
        let poll_id = polls.next_id;
        let tally = vector::empty<u64>();
        let i = 0;
        while (i < vector::length(&options)) {
            vector::push_back(&mut tally, 0);
            i = i + 1;
        };
        let poll = Poll {
            creator: signer::address_of(creator),
            title,
            description,
            options,
            start_time,
            end_time,
            votes: table::new(),
            tally,
            closed: false,
            feedbacks: vector::empty<string::String>(),
        };
        table::add(&mut polls.polls, poll_id, poll);
        polls.next_id = poll_id + 1;
        poll_id
    }

    public fun cast_vote(
        voter: &signer,
        poll_owner: address,
        poll_id: u64,
        option_index: u64
    ) acquires Polls {
        let polls = borrow_global_mut<Polls>(poll_owner);
        let poll = table::borrow_mut(&mut polls.polls, poll_id);
        let now = aptos_framework::timestamp::now_seconds();
        assert!(now >= poll.start_time, 1);
        assert!(now <= poll.end_time, 2);
        assert!(!poll.closed, 3);
        let voter_addr = signer::address_of(voter);
        assert!(!table::contains(&poll.votes, voter_addr), 4); // one-wallet-one-vote
        table::add(&mut poll.votes, voter_addr, option_index);
        let count = vector::borrow_mut(&mut poll.tally, option_index);
        *count = *count + 1;
    }

    public fun close_poll(
        owner: &signer,
        poll_id: u64
    ) acquires Polls {
        let polls = borrow_global_mut<Polls>(signer::address_of(owner));
        let poll = table::borrow_mut(&mut polls.polls, poll_id);
        assert!(poll.creator == signer::address_of(owner), 5);
        poll.closed = true;
    }

    public fun extend_poll(
        owner: &signer,
        poll_id: u64,
        new_end_time: u64
    ) acquires Polls {
        let polls = borrow_global_mut<Polls>(signer::address_of(owner));
        let poll = table::borrow_mut(&mut polls.polls, poll_id);
        assert!(poll.creator == signer::address_of(owner), 6);
        poll.end_time = new_end_time;
    }

    public fun get_results(
        poll_owner: address,
        poll_id: u64
    ): vector<u64> acquires Polls {
        let polls = borrow_global<Polls>(poll_owner);
        let poll = table::borrow(&polls.polls, poll_id);
        assert!(poll.closed, 7);
        poll.tally
    }

    public fun submit_feedback(
        voter: &signer,
        poll_owner: address,
        poll_id: u64,
        feedback: string::String
    ) acquires Polls {
        let polls = borrow_global_mut<Polls>(poll_owner);
        let poll = table::borrow_mut(&mut polls.polls, poll_id);
        vector::push_back(&mut poll.feedbacks, feedback);
    }

    /// NFT certificate for participation
    public fun issue_nft_certificate(
        voter: &signer,
        poll_owner: address,
        poll_id: u64
    ): bool acquires Polls {
        let polls = borrow_global<Polls>(poll_owner);
        let poll = table::borrow(&polls.polls, poll_id);
        let voter_addr = signer::address_of(voter);
        assert!(table::contains(&poll.votes, voter_addr), 8);
        // For now, we just verify participation
        true
    }
}
