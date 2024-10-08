//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract XefersContract {
    // A ZkXeferss contract represents a unique Xefers to be tracked (identified by contract url)

    uint256 public referralCount;
    mapping(address => bool) public referred;

    struct XefersMetadata {
        string title;
        string redirectUrl;
        address owner;
        uint256 referralReward;
    }

    XefersMetadata public XefersMetadata;

    event RefferalSuccess(address indexed referrer, address indexed referral, string indexed redirectUrl);

    constructor(
        string memory _title,
        uint256 _referralReward,
        string memory _redirectUrl
    ) {
        referralCount = 0;
        XefersMetadata = XefersMetadata(
            _title,
            _redirectUrl,
            msg.sender,
            _referralReward
        );
    }
 
    function refer() external {
        require(!referred[msg.sender], "User already referred");
        referred[msg.sender] = true;
        referralCount += 1;
        uint256 referralReward = XefersMetadata.referralReward;
        if (referralReward > 0) {
            // Ensure balance is sufficient
            require(
                address(this).balance >= referralReward,
                "Reward balance is empty on contract"
            );
            // Transfer reward to sender.
            payable(msg.sender).transfer(referralReward);
        }

        emit RefferalSuccess(XefersMetadata.owner, msg.sender, XefersMetadata.redirectUrl);
    }

    function getMetadata() external view returns (XefersMetadata memory) {
        return XefersMetadata;
    }

    function isReffered(address _address) external view returns (bool) {
        return referred[_address];
    }

    function checkOwner() private view {
        require(
            msg.sender == XefersMetadata.owner,
            "Only the Xefers owner can call this method"
        );
    }

    function setRedirectUrl(string memory _redirectUrl) external {
        checkOwner();
        XefersMetadata.redirectUrl = _redirectUrl;
    }

    function setReferralReward(uint256 _referralReward) external {
        checkOwner();
        XefersMetadata.referralReward = _referralReward;
    }

    function setTitle(string memory _title) external {
        checkOwner();
        XefersMetadata.title = _title;
    }

    function getTitle() external view returns (string memory) {
        return XefersMetadata.title;
    }

    function getRedirectUrl() external view returns (string memory) {
        return XefersMetadata.redirectUrl;
    }

    function getOwner() external view returns (address) {
        return XefersMetadata.owner;
    }

    function getReferralCount() external view returns (uint256) {
        return referralCount;
    }

    function getReferralReward() external view returns (uint256) {
        return XefersMetadata.referralReward;
    }
}
