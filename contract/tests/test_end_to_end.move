#[test_only]
module voting_system::voting_tests {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use voting_system::voting::{Self, Polls};

    const E_POLL_NOT_FOUND: u64 = 12;
    const E_VOTING_NOT_STARTED: u64 = 1;
    const E_VOTING_ENDED: u64 = 2;
    const E_ALREADY_VOTED: u64 = 4;
    const E_INVALID_TIME: u64 = 10;
    const E_INSUFFICIENT_OPTIONS: u64 = 13;

    fun get_account(): signer {
        account::create_account_for_test(@voting_system)
    }

    fun get_account_2(): signer {
        account::create_account_for_test(@0x123)
    }

    fun get_account_3(): signer {
        account::create_account_for_test(@0x456)
    }

    #[test]
    fun test_init() {
        let owner = get_account();
        voting::init(&owner);
        
        // Verify the polls resource was created
        assert!(exists<Polls>(signer::address_of(&owner)), 0);
    }

    #[test]
    fun test_create_poll() {
        let owner = get_account();
        voting::init(&owner);
        
        let title = string::utf8(b"Test Poll");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        vector::push_back(&mut options, string::utf8(b"Option 2"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        let poll_id = voting::create_poll(&owner, title, description, options, start_time, end_time);
        assert!(poll_id == 0, 0);
    }

    #[test]
    fun test_create_poll_insufficient_options() {
        let owner = get_account();
        voting::init(&owner);
        
        let title = string::utf8(b"Test Poll");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        voting::create_poll(&owner, title, description, options, start_time, end_time);
    }

    #[test]
    #[expected_failure(abort_code = E_INSUFFICIENT_OPTIONS)]
    fun test_create_poll_insufficient_options_should_fail() {
        let owner = get_account();
        voting::init(&owner);
        
        let title = string::utf8(b"Test Poll");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        voting::create_poll(&owner, title, description, options, start_time, end_time);
    }

    #[test]
    fun test_cast_vote() {
        let owner = get_account();
        let voter = get_account_2();
        voting::init(&owner);
        
        let title = string::utf8(b"Test Poll");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        vector::push_back(&mut options, string::utf8(b"Option 2"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        let poll_id = voting::create_poll(&owner, title, description, options, start_time, end_time);
        
        // Fast forward time to start time
        timestamp::set_time_has_started(&mut get_account());
        timestamp::update_global_time_for_test(start_time + 200);
        
        voting::cast_vote(&voter, signer::address_of(&owner), poll_id, 0);
        
        // Verify vote was recorded
        assert!(voting::has_voted(signer::address_of(&owner), poll_id, signer::address_of(&voter)), 0);
        let user_vote = voting::get_vote(signer::address_of(&owner), poll_id, signer::address_of(&voter));
        assert!(std::option::is_some(&user_vote), 0);
        assert!(*std::option::borrow(&user_vote) == 0, 0);
    }

    #[test]
    #[expected_failure(abort_code = E_VOTING_NOT_STARTED)]
    fun test_cast_vote_before_start_time() {
        let owner = get_account();
        let voter = get_account_2();
        voting::init(&owner);
        
        let title = string::utf8(b"Test Poll");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        vector::push_back(&mut options, string::utf8(b"Option 2"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        let poll_id = voting::create_poll(&owner, title, description, options, start_time, end_time);
        
        voting::cast_vote(&voter, signer::address_of(&owner), poll_id, 0);
    }

    #[test]
    #[expected_failure(abort_code = E_VOTING_ENDED)]
    fun test_cast_vote_after_end_time() {
        let owner = get_account();
        let voter = get_account_2();
        voting::init(&owner);
        
        let title = string::utf8(b"Test Poll");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        vector::push_back(&mut options, string::utf8(b"Option 2"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        let poll_id = voting::create_poll(&owner, title, description, options, start_time, end_time);
        
        // Fast forward time past end time
        timestamp::set_time_has_started(&mut get_account());
        timestamp::update_global_time_for_test(end_time + 100);
        
        voting::cast_vote(&voter, signer::address_of(&owner), poll_id, 0);
    }

    #[test]
    #[expected_failure(abort_code = E_ALREADY_VOTED)]
    fun test_cast_vote_twice() {
        let owner = get_account();
        let voter = get_account_2();
        voting::init(&owner);
        
        let title = string::utf8(b"Test Poll");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        vector::push_back(&mut options, string::utf8(b"Option 2"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        let poll_id = voting::create_poll(&owner, title, description, options, start_time, end_time);
        
        // Fast forward time to start time
        timestamp::set_time_has_started(&mut get_account());
        timestamp::update_global_time_for_test(start_time + 200);
        
        voting::cast_vote(&voter, signer::address_of(&owner), poll_id, 0);
        voting::cast_vote(&voter, signer::address_of(&owner), poll_id, 1);
    }

    #[test]
    fun test_close_poll() {
        let owner = get_account();
        voting::init(&owner);
        
        let title = string::utf8(b"Test Poll");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        vector::push_back(&mut options, string::utf8(b"Option 2"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        let poll_id = voting::create_poll(&owner, title, description, options, start_time, end_time);
        
        voting::close_poll(&owner, poll_id);
        
        // Verify poll is closed
        let (_, _, _, _, _, _, closed, _) = voting::get_poll_info(signer::address_of(&owner), poll_id);
        assert!(closed, 0);
    }

    #[test]
    fun test_extend_poll() {
        let owner = get_account();
        voting::init(&owner);
        
        let title = string::utf8(b"Test Poll");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        vector::push_back(&mut options, string::utf8(b"Option 2"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        let poll_id = voting::create_poll(&owner, title, description, options, start_time, end_time);
        
        let new_end_time = end_time + 7200;
        voting::extend_poll(&owner, poll_id, new_end_time);
        
        // Verify end time was updated
        let (_, _, _, _, _, updated_end_time, _, _) = voting::get_poll_info(signer::address_of(&owner), poll_id);
        assert!(updated_end_time == new_end_time, 0);
    }

    #[test]
    fun test_get_results() {
        let owner = get_account();
        let voter1 = get_account_2();
        let voter2 = get_account_3();
        voting::init(&owner);
        
        let title = string::utf8(b"Test Poll");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        vector::push_back(&mut options, string::utf8(b"Option 2"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        let poll_id = voting::create_poll(&owner, title, description, options, start_time, end_time);
        
        // Fast forward time to start time
        timestamp::set_time_has_started(&mut get_account());
        timestamp::update_global_time_for_test(start_time + 200);
        
        voting::cast_vote(&voter1, signer::address_of(&owner), poll_id, 0);
        voting::cast_vote(&voter2, signer::address_of(&owner), poll_id, 1);
        
        let results = voting::get_results(signer::address_of(&owner), poll_id);
        assert!(vector::length(&results) == 2, 0);
        assert!(*vector::borrow(&results, 0) == 1, 0);
        assert!(*vector::borrow(&results, 1) == 1, 0);
    }

    #[test]
    fun test_get_all_polls() {
        let owner = get_account();
        voting::init(&owner);
        
        let title1 = string::utf8(b"Test Poll 1");
        let title2 = string::utf8(b"Test Poll 2");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        vector::push_back(&mut options, string::utf8(b"Option 2"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        let poll_id1 = voting::create_poll(&owner, title1, description, options, start_time, end_time);
        let poll_id2 = voting::create_poll(&owner, title2, description, options, start_time, end_time);
        
        assert!(poll_id1 == 0, 0);
        assert!(poll_id2 == 1, 0);
        
        let poll_count = voting::get_all_polls_count(signer::address_of(&owner));
        assert!(poll_count == 2, 0);
        
        let poll_ids = voting::get_poll_ids(signer::address_of(&owner));
        assert!(vector::length(&poll_ids) == 2, 0);
        assert!(*vector::borrow(&poll_ids, 0) == 0, 0);
        assert!(*vector::borrow(&poll_ids, 1) == 1, 0);
    }

    #[test]
    fun test_submit_feedback() {
        let owner = get_account();
        let voter = get_account_2();
        voting::init(&owner);
        
        let title = string::utf8(b"Test Poll");
        let description = string::utf8(b"Test Description");
        let options = vector::empty<string::String>();
        vector::push_back(&mut options, string::utf8(b"Option 1"));
        vector::push_back(&mut options, string::utf8(b"Option 2"));
        
        let start_time = timestamp::now_seconds() + 100;
        let end_time = start_time + 3600;
        
        let poll_id = voting::create_poll(&owner, title, description, options, start_time, end_time);
        
        // Fast forward time to start time
        timestamp::set_time_has_started(&mut get_account());
        timestamp::update_global_time_for_test(start_time + 200);
        
        voting::cast_vote(&voter, signer::address_of(&owner), poll_id, 0);
        
        let feedback = string::utf8(b"Great poll!");
        voting::submit_feedback(&voter, signer::address_of(&owner), poll_id, feedback);
        
        let feedbacks = voting::get_feedbacks(signer::address_of(&owner), poll_id);
        assert!(vector::length(&feedbacks) == 1, 0);
        assert!(*vector::borrow(&feedbacks, 0) == feedback, 0);
    }
}
