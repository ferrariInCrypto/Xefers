// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


/// @title Verifier for zk-SNARKs

contract Verifier {
    // This function would typically include the logic for verifying zk-SNARK proofs.
    // For this example, it's a placeholder.
    function verifyProof(
        bytes memory proof,
        uint256[] memory input
    ) public pure returns (bool) {
        // Proof verification logic should be implemented here based on your ZKP setup.
        // For example, you would verify the proof against the public inputs.
        return true; // Placeholder return; implement actual verification logic.
    }
}

/// @title Xefers Referral Contract (with zk-SNARKs)
contract Xefers is Pausable, ReentrancyGuard {
    // Struct to hold campaign metadata
    struct CampaignMetadata {
        string title;
        string redirectUrl;
        address owner;
        uint256 referralReward;
        IERC20 token;
        uint256 tokenReward;
        uint256 referralCap;
        uint256 expiryTime;
        bool isActive;
    }

    // State variables
    mapping(uint256 => uint256) public referralCount;
    mapping(uint256 => mapping(address => bool)) public hasBeenReferred;
    mapping(uint256 => CampaignMetadata) public campaigns;

    // Reference to the zk-SNARK verifier contract
    Verifier public verifier;

    // Events
    event ReferralSuccessful(uint256 indexed campaignId, address indexed referrer, address indexed referral, string redirectUrl);
    event FundsWithdrawn(uint256 indexed campaignId, address owner, uint256 amount, address token);
    event CampaignStatusUpdated(uint256 indexed campaignId, bool isActive);

    // Constructor
    constructor(address _verifier) {
        verifier = Verifier(_verifier);
    }

    // Function to create a new referral campaign
    function createCampaign(
        uint256 campaignId,
        string memory _title,
        uint256 _referralReward,
        IERC20 _token,
        uint256 _tokenReward,
        string memory _redirectUrl,
        uint256 _referralCap,
        uint256 _expiryTime
    ) external {
        require(campaigns[campaignId].owner == address(0), "Campaign ID already exists");
        require(_expiryTime > block.timestamp, "Expiry time must be in the future");

        campaigns[campaignId] = CampaignMetadata({
            title: _title,
            redirectUrl: _redirectUrl,
            owner: msg.sender,
            referralReward: _referralReward,
            token: _token,
            tokenReward: _tokenReward,
            referralCap: _referralCap,
            expiryTime: _expiryTime,
            isActive: true
        });
    }

    // Function to make a referral and claim a reward using a zk-SNARK proof
    function makeReferral(
        uint256 campaignId,
        bytes memory proof,
        uint256[] memory input
    ) external whenNotPaused nonReentrant {
        require(verifier.verifyProof(proof, input), "Invalid proof");

        CampaignMetadata storage campaign = campaigns[campaignId];
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp <= campaign.expiryTime, "Campaign has expired");
        require(!hasBeenReferred[campaignId][msg.sender], "User has already been referred for this campaign");
        require(referralCount[campaignId] < campaign.referralCap, "Referral cap reached for this campaign");

        // Mark the sender as referred
        hasBeenReferred[campaignId][msg.sender] = true;

        // Increment the referral count
        referralCount[campaignId] += 1;

        // Pay out ETH reward if applicable
        uint256 ethReward = campaign.referralReward;
        if (ethReward > 0) {
            require(address(this).balance >= ethReward, "Insufficient contract balance for ETH reward");
            payable(msg.sender).transfer(ethReward);
        }

        // Pay out Token reward if applicable
        uint256 tokenReward = campaign.tokenReward;
        if (tokenReward > 0 && address(campaign.token) != address(0)) {
            require(campaign.token.balanceOf(address(this)) >= tokenReward, "Insufficient token balance for reward");
            campaign.token.transfer(msg.sender, tokenReward);
        }

        emit ReferralSuccessful(campaignId, campaign.owner, msg.sender, campaign.redirectUrl);
    }

    // Function to withdraw funds from the contract
    function withdrawFunds(uint256 campaignId, uint256 _amount, address _token) external onlyOwner(campaignId) nonReentrant {
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

    // Function to update campaign status
    function setCampaignStatus(uint256 campaignId, bool _isActive) external onlyOwner(campaignId) {
        campaigns[campaignId].isActive = _isActive;
        emit CampaignStatusUpdated(campaignId, _isActive);
    }

    // Function to update the redirect URL for a campaign
    function updateRedirectUrl(uint256 campaignId, string memory _redirectUrl) external onlyOwner(campaignId) {
        campaigns[campaignId].redirectUrl = _redirectUrl;
    }

    // Function to update the referral rewards for a campaign
    function updateReferralRewards(uint256 campaignId, uint256 _referralReward, uint256 _tokenReward) external onlyOwner(campaignId) {
        campaigns[campaignId].referralReward = _referralReward;
        campaigns[campaignId].tokenReward = _tokenReward;
    }

    // Function to transfer ownership of the campaign
    function transferOwnership(uint256 campaignId, address newOwner) external onlyOwner(campaignId) {
        require(newOwner != address(0), "New owner cannot be zero address");
        campaigns[campaignId].owner = newOwner;
    }

    // Modifier to ensure only the campaign owner can call certain functions
    modifier onlyOwner(uint256 campaignId) {
        require(msg.sender == campaigns[campaignId].owner, "Only campaign owner can call this function");
        _;
    }

    // Function to pause the contract
    function pause() external onlyOwner {
        _pause();
    }

    // Function to unpause the contract
    function unpause() external onlyOwner {
        _unpause();
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
