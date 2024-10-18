// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Xefers Referral Contract (BTTC Compatible)
/// @dev A contract that handles tracking referrals and rewards in both ETH and ERC-20 tokens.

contract Xefers {

    /// @notice The total number of successful referrals for each campaign
    mapping(uint256 => uint256) public referralCount;

    /// @notice Mapping to track if an address has been referred per campaign
    mapping(uint256 => mapping(address => bool)) public hasBeenReferred;

    /// @notice Metadata structure to store details about a Xefers campaign
    struct CampaignMetadata {
        string title;           // Title of the Xefers campaign
        string redirectUrl;     // URL to redirect to after a referral
        address owner;          // The owner/creator of the campaign
        uint256 referralReward; // Reward in wei (ETH) for successful referrals
        IERC20 token;           // ERC-20 token for rewards (if used)
        uint256 tokenReward;    // Reward in token amount (if applicable)
    }

    /// @notice Campaigns metadata for multiple campaigns
    mapping(uint256 => CampaignMetadata) public campaigns;

    /// @notice Event emitted when a referral is successful
    event ReferralSuccessful(uint256 indexed campaignId, address indexed referrer, address indexed referral, string redirectUrl);

    /// @notice Event emitted when the owner withdraws tokens or ETH
    event FundsWithdrawn(uint256 indexed campaignId, address owner, uint256 amount, address token);

    /// @notice Create a new referral campaign with ETH and/or token rewards
    /// @param campaignId The ID for the campaign
    /// @param _title The title of the campaign
    /// @param _referralReward The ETH reward (in wei) for each successful referral
    /// @param _token The address of the ERC-20 token to be used (set to address(0) if not applicable)
    /// @param _tokenReward The reward in tokens (if applicable)
    /// @param _redirectUrl The URL for the referrals to be redirected

    function createCampaign(
        uint256 campaignId,
        string memory _title,
        uint256 _referralReward,
        IERC20 _token,
        uint256 _tokenReward,
        string memory _redirectUrl
    ) external {
        require(campaigns[campaignId].owner == address(0), "Campaign ID already exists");
        
        campaigns[campaignId] = CampaignMetadata({
            title: _title,
            redirectUrl: _redirectUrl,
            owner: msg.sender,
            referralReward: _referralReward,
            token: _token,
            tokenReward: _tokenReward
        });
    }

    /// @notice Refer someone and claim a reward (ETH or tokens)
    /// @param campaignId The ID of the campaign in which to make the referral
    function makeReferral(uint256 campaignId) external {
        require(!hasBeenReferred[campaignId][msg.sender], "User has already been referred for this campaign");
        
        CampaignMetadata memory campaign = campaigns[campaignId];

        // Mark the sender as referred
        hasBeenReferred[campaignId][msg.sender] = true;

        // Increment the referral count
        referralCount[campaignId] += 1;

        uint256 ethReward = campaign.referralReward;
        uint256 tokenReward = campaign.tokenReward;

        // Pay out ETH reward
        if (ethReward > 0) {
            require(address(this).balance >= ethReward, "Insufficient contract balance for ETH reward");
            payable(msg.sender).transfer(ethReward);
        }

        // Pay out Token reward
        if (tokenReward > 0 && address(campaign.token) != address(0)) {
            require(campaign.token.balanceOf(address(this)) >= tokenReward, "Insufficient token balance for reward");
            campaign.token.transfer(msg.sender, tokenReward);
        }

        // Emit event for successful referral
        emit ReferralSuccessful(campaignId, campaign.owner, msg.sender, campaign.redirectUrl);
    }

    /// @notice Withdraw contract funds (ETH or tokens)
    /// @param campaignId The ID of the campaign to withdraw from
    /// @param _amount The amount to withdraw in ETH or tokens
    /// @param _token The token address (use address(0) for ETH)

    function withdrawFunds(uint256 campaignId, uint256 _amount, address _token) external onlyOwner(campaignId) {
        if (_token == address(0)) {
            // Withdraw ETH
            require(address(this).balance >= _amount, "Insufficient ETH balance");
            payable(msg.sender).transfer(_amount);
        } else {
            // Withdraw ERC-20 tokens
            IERC20 token = IERC20(_token);
            require(token.balanceOf(address(this)) >= _amount, "Insufficient token balance");
            token.transfer(msg.sender, _amount);
        }
        emit FundsWithdrawn(campaignId, msg.sender, _amount, _token);
    }

    /// @notice Updates the redirect URL for a campaign
    /// @dev Only the campaign owner can update
    /// @param campaignId The ID of the campaign
    /// @param _redirectUrl The new URL to set

    function updateRedirectUrl(uint256 campaignId, string memory _redirectUrl) external onlyOwner(campaignId) {
        campaigns[campaignId].redirectUrl = _redirectUrl;
    }

    /// @notice Updates the referral reward (ETH and/or tokens) for a campaign
    /// @param campaignId The ID of the campaign
    /// @param _referralReward The new referral reward in ETH (wei)
    /// @param _tokenReward The new referral reward in tokens (if applicable)

    function updateReferralRewards(uint256 campaignId, uint256 _referralReward, uint256 _tokenReward) external onlyOwner(campaignId) {
        campaigns[campaignId].referralReward = _referralReward;
        campaigns[campaignId].tokenReward = _tokenReward;
    }

    /// @notice Transfer ownership of the campaign
    /// @param campaignId The ID of the campaign
    /// @param newOwner The address of the new owner

    function transferOwnership(uint256 campaignId, address newOwner) external onlyOwner(campaignId) {
        require(newOwner != address(0), "New owner cannot be zero address");
        campaigns[campaignId].owner = newOwner;
    }

    /// @notice Modifier to ensure only the campaign owner can call certain functions
    
    modifier onlyOwner(uint256 campaignId) {
        require(msg.sender == campaigns[campaignId].owner, "Only campaign owner can call this function");
        _;
    }

    /// @notice Fallback function to receive ETH
    receive() external payable {}
}
