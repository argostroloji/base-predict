// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract BasePredictNFT is ERC1155, ERC2981, Ownable, ReentrancyGuard {

    uint256 public constant MAX_MINTS_PER_DATE = 10;
    uint256 public constant DATE_RANGE_START   = 1780272000; // Jun 1, 2026
    uint256 public constant DATE_RANGE_END     = 1830211200; // Dec 31, 2027

    address public prizePoolWallet;
    bool    public paused;

    mapping(uint256 => uint256)                    public totalMintedPerDate;
    mapping(address => uint256)                    public userMintedDate;
    mapping(uint256 => mapping(address => string)) public tokenMinterHandle;

    event PredictionMinted(address indexed user, uint256 indexed tokenId, string xHandle);

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    constructor(address _prizePoolWallet) ERC1155("") Ownable(msg.sender) {
        require(_prizePoolWallet != address(0), "Invalid address");
        prizePoolWallet = _prizePoolWallet;
        _setDefaultRoyalty(_prizePoolWallet, 500);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    function updatePrizePoolWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid address");
        prizePoolWallet = _newWallet;
        _setDefaultRoyalty(_newWallet, 500);
    }

    function updateRoyalty(address _receiver, uint96 _fee) external onlyOwner {
        require(_receiver != address(0), "Invalid address");
        require(_fee <= 1000, "Max 10%");
        _setDefaultRoyalty(_receiver, _fee);
    }

    function normalizeDate(uint256 _ts) public pure returns (uint256) {
        return (_ts / 86400) * 86400;
    }

    function mintPredictionTicket(
        uint256 _timestamp,
        string calldata _xHandle
    ) external nonReentrant whenNotPaused {
        uint256 len = bytes(_xHandle).length;
        require(len > 0 && len <= 50, "Handle: 1-50 chars");

        uint256 tokenId = normalizeDate(_timestamp);
        require(tokenId >= DATE_RANGE_START && tokenId <= DATE_RANGE_END, "Date out of range");
        require(userMintedDate[msg.sender] == 0, "Already minted");
        require(totalMintedPerDate[tokenId] < MAX_MINTS_PER_DATE, "Date sold out");

        userMintedDate[msg.sender]             = tokenId;
        totalMintedPerDate[tokenId]           += 1;
        tokenMinterHandle[tokenId][msg.sender] = _xHandle;

        _mint(msg.sender, tokenId, 1, "");
        emit PredictionMinted(msg.sender, tokenId, _xHandle);
    }

    function tokenMinterInfo(uint256 tokenId, address user) external view returns (string memory) {
        return tokenMinterHandle[tokenId][user];
    }

    function uri(uint256) public pure override returns (string memory) {
        return "";
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, ERC2981) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
