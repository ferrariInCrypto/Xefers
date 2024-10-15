// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


/// @title Xefers Referral Contract
/// @dev A contract that handles tracking referrals for a specific Xefers link. 
/// It rewards users for successful referrals and stores metadata about the Xefers campaign.
contract Xefers {
    
    /// @notice The total number of successful referrals
    uint256 public referralCount;

    /// @notice Mapping to track if an address has been referred
    mapping(address => bool) public hasBeenReferred;

    /// @notice Metadata structure to store details about a Xefers campaign
    struct CampaignMetadata {
        string title;          // Title of the Xefers campaign
        string redirectUrl;    // URL to redirect to after a referral
        address owner;         // The owner/creator of the campaign
        uint256 referralReward; // Reward in wei (ETH) for successful referrals
    }

    /// @notice The metadata for the current Xefers campaign
    CampaignMetadata public campaignMetadata;

    /// @notice Emitted when a referral is successful
    /// @param referrer The address of the person who referred
    /// @param referral The address of the person being referred
    /// @param redirectUrl The URL that the referred person is redirected to
    event ReferralSuccessful(address indexed referrer, address indexed referral, string redirectUrl);

    /// @param _title The title of the Xefers campaign
    /// @param _referralReward The amount of ETH (in wei) to be rewarded for each successful referral
    /// @param _redirectUrl The URL where the referred users will be redirected
    constructor(
        string memory _title,
        uint256 _referralReward,
        string memory _redirectUrl
    ) {
        referralCount = 0;
        campaignMetadata = CampaignMetadata(
            _title,
            _redirectUrl,
            msg.sender,
            _referralReward
        );
    }

    /// @notice Allows a user to refer someone and claim a reward (if applicable)
    /// @dev Ensures the user has not been referred before and pays out the reward.
    function makeReferral() external {
        require(!hasBeenReferred[msg.sender], "User has already been referred");
        
        // Mark the sender as referred
        hasBeenReferred[msg.sender] = true;

        // Increment the referral count
        referralCount += 1;

        uint256 reward = campaignMetadata.referralReward;

        // If a reward exists, pay it out to the sender
        if (reward > 0) {
            require(address(this).balance >= reward, "Insufficient contract balance for reward");
            payable(msg.sender).transfer(reward);
        }

        // Emit an event to signify the successful referral
        emit ReferralSuccessful(campaignMetadata.owner, msg.sender, campaignMetadata.redirectUrl);
    }

    /// @notice Returns the campaign metadata
    /// @return The campaign metadata, including title, redirect URL, owner, and reward amount
    function getCampaignMetadata() external view returns (CampaignMetadata memory) {
        return campaignMetadata;
    }

    /// @notice Checks if an address has been referred
    /// @param _address The address to check
    /// @return Boolean indicating whether the address has been referred
    function hasReferred(address _address) external view returns (bool) {
        return hasBeenReferred[_address];
    }

    /// @notice Updates the redirect URL for the campaign
    /// @dev Only the campaign owner can update the redirect URL
    /// @param _redirectUrl The new URL to set
    function updateRedirectUrl(string memory _redirectUrl) external onlyOwner {
        campaignMetadata.redirectUrl = _redirectUrl;
    }

    /// @notice Updates the referral reward for the campaign
    /// @dev Only the campaign owner can update the reward
    /// @param _referralReward The new referral reward in wei (ETH)
    function updateReferralReward(uint256 _referralReward) external onlyOwner {
        campaignMetadata.referralReward = _referralReward;
    }

    /// @notice Updates the title of the campaign
    /// @dev Only the campaign owner can update the title
    /// @param _title The new title for the campaign
    function updateTitle(string memory _title) external onlyOwner {
        campaignMetadata.title = _title;
    }

    /// @notice Returns the campaign title
    /// @return The title of the Xefers campaign
    function fetchTitle() external view returns (string memory) {
        return campaignMetadata.title;
    }

    /// @notice Returns the redirect URL of the campaign
    /// @return The URL to which referrals will be redirected
    function fetchRedirectUrl() external view returns (string memory) {
        return campaignMetadata.redirectUrl;
    }

    /// @notice Returns the owner of the campaign
    /// @return The address of the campaign owner
    function fetchOwner() external view returns (address) {
        return campaignMetadata.owner;
    }

    /// @notice Returns the total number of successful referrals
    /// @return The number of referrals made in the campaign
    function fetchReferralCount() external view returns (uint256) {
        return referralCount;
    }

    /// @notice Returns the current referral reward
    /// @return The amount of ETH (in wei) rewarded for each referral
    function fetchReferralReward() external view returns (uint256) {
        return campaignMetadata.referralReward;
    }

    /// @notice Ensures that only the owner of the campaign can call certain functions
    modifier onlyOwner() {
        require(msg.sender == campaignMetadata.owner, "Only the campaign owner can call this function");
        _;
    }
}
