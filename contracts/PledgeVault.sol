// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IVault {
    function deposit(uint256 assets, address receiver) external returns (uint256);
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
}

contract PledgeVault {

    IERC20 public immutable usdc;
    IVault public immutable vault;

    uint256 public constant PENALTY_NUMERATOR = 45;
    uint256 public constant PENALTY_DENOMINATOR = 1000;
    uint256 public constant PRECISION = 1e18;

    uint256 public constant LOCK_30 = 30 days;
    uint256 public constant LOCK_60 = 60 days;
    uint256 public constant LOCK_90 = 90 days;

    struct UserInfo {
        uint256 shares;
        uint256 depositTime;
        uint256 lockPeriod;
        uint256 rewardDebt;
        uint256 earnedFromPenalties;
    }

    mapping(address => UserInfo) public users;
    address[] public depositors;
    mapping(address => bool) public isDepositor;

    uint256 public totalShares;
    uint256 public accRewardPerShare;
    uint256 public totalPenaltyCollected;

    event Deposited(address indexed user, uint256 usdcAmount, uint256 shares, uint256 lockDays);
    event Withdrawn(address indexed user, uint256 usdcAmount, bool early, uint256 penaltyShares);
    event PenaltyDistributed(uint256 penaltyShares, uint256 remainingStakers);
    event RewardsClaimed(address indexed user, uint256 shares);

    constructor(address _usdc, address _vault) {
        usdc = IERC20(_usdc);
        vault = IVault(_vault);
    }

    function deposit(uint256 usdcAmount, uint256 lockDays) external {
        require(usdcAmount > 0, "Amount must be > 0");
        require(lockDays == 30 || lockDays == 60 || lockDays == 90, "Lock must be 30, 60, or 90 days");

        usdc.transferFrom(msg.sender, address(this), usdcAmount);
        usdc.approve(address(vault), usdcAmount);
        uint256 sharesReceived = vault.deposit(usdcAmount, address(this));

        _settleRewards(msg.sender);

        uint256 lockPeriod = lockDays * 1 days;

        users[msg.sender].shares += sharesReceived;
        users[msg.sender].depositTime = block.timestamp;
        users[msg.sender].lockPeriod = lockPeriod;
        users[msg.sender].rewardDebt = (users[msg.sender].shares * accRewardPerShare) / PRECISION;

        totalShares += sharesReceived;

        if (!isDepositor[msg.sender]) {
            depositors.push(msg.sender);
            isDepositor[msg.sender] = true;
        }

        emit Deposited(msg.sender, usdcAmount, sharesReceived, lockDays);
    }

    function withdraw(uint256 shareAmount) external {
        UserInfo storage user = users[msg.sender];
        require(user.shares >= shareAmount, "Insufficient shares");

        _settleRewards(msg.sender);

        bool isEarly = block.timestamp < user.depositTime + user.lockPeriod;
        uint256 sharesToRedeem = shareAmount;
        uint256 penaltyShares = 0;

        if (isEarly) {
            penaltyShares = (shareAmount * PENALTY_NUMERATOR) / PENALTY_DENOMINATOR;
            sharesToRedeem = shareAmount - penaltyShares;

            if (totalShares > shareAmount && penaltyShares > 0) {
                accRewardPerShare += (penaltyShares * PRECISION) / (totalShares - shareAmount);
                totalPenaltyCollected += penaltyShares;
                emit PenaltyDistributed(penaltyShares, totalShares - shareAmount);
            }
        }

        user.shares -= shareAmount;
        totalShares -= shareAmount;
        user.rewardDebt = (user.shares * accRewardPerShare) / PRECISION;

        vault.redeem(sharesToRedeem, msg.sender, address(this));

        emit Withdrawn(msg.sender, sharesToRedeem, isEarly, penaltyShares);
    }

    function claimRewards() external {
        UserInfo storage user = users[msg.sender];
        require(user.shares > 0, "No shares");

        uint256 pending = (user.shares * accRewardPerShare) / PRECISION - user.rewardDebt;
        require(pending > 0, "No rewards");

        user.earnedFromPenalties += pending;
        user.rewardDebt = (user.shares * accRewardPerShare) / PRECISION;

        vault.redeem(pending, msg.sender, address(this));

        emit RewardsClaimed(msg.sender, pending);
    }

    function _settleRewards(address userAddr) internal {
        UserInfo storage user = users[userAddr];
        if (user.shares > 0) {
            uint256 pending = (user.shares * accRewardPerShare) / PRECISION - user.rewardDebt;
            if (pending > 0) {
                user.earnedFromPenalties += pending;
            }
        }
    }

    function getPendingReward(address userAddr) external view returns (uint256) {
        UserInfo storage user = users[userAddr];
        if (user.shares == 0) return 0;
        return (user.shares * accRewardPerShare) / PRECISION - user.rewardDebt;
    }

    function getUserShares(address userAddr) external view returns (uint256) {
        return users[userAddr].shares;
    }

    function getUserLockPeriod(address userAddr) external view returns (uint256) {
        return users[userAddr].lockPeriod / 1 days;
    }

    function getTotalEarnedFromPenalties(address userAddr) external view returns (uint256) {
        return users[userAddr].earnedFromPenalties;
    }

    function isLocked(address userAddr) external view returns (bool) {
        UserInfo storage user = users[userAddr];
        if (user.shares == 0) return false;
        return block.timestamp < user.depositTime + user.lockPeriod;
    }

    function getTimeRemaining(address userAddr) external view returns (uint256) {
        UserInfo storage user = users[userAddr];
        uint256 unlockTime = user.depositTime + user.lockPeriod;
        if (block.timestamp >= unlockTime) return 0;
        return unlockTime - block.timestamp;
    }

    function getDepositorCount() external view returns (uint256) {
        return depositors.length;
    }

    function getPenaltyPercent() external pure returns (string memory) {
        return "4.5%";
    }
}