// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract SwipeBid is ERC721, ERC721URIStorage, ReentrancyGuard {
    uint256 private _nextTokenId;

    struct NFTListing {
        uint256 tokenId;
        uint256 basePrice;
        uint256 highestBid;
        address seller;
        address highestBidder;
        bool active;
        string name;
        string description;
        string imageURI;  // IPFS image URI
        string[] traits;
    }

    mapping(uint256 => NFTListing) public listings;
    mapping(address => uint256) public pendingReturns;
    mapping(address => uint256[]) public winnerNFTs;
    uint256[] public allTokenIds;

    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 basePrice);
    event NewBid(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event BiddingEnded(uint256 indexed tokenId, address indexed winner, uint256 amount);
    event WithdrawPending(address indexed user, uint256 amount);

    constructor() ERC721("NFT Bidding Platform", "NFTBID") {
        _nextTokenId = 1;
    }

    function createNFT(
        string memory name,
        string memory description,
        string memory metadataURI,
        string[] memory traits,
        uint256 basePrice
    ) external returns (uint256 tokenId) {
        require(basePrice > 0, "Base price must be greater than 0");
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");

        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        listings[tokenId] = NFTListing({
            tokenId: tokenId,
            seller: msg.sender,
            name: name,
            description: description,
            imageURI: metadataURI,
            traits: traits,
            basePrice: basePrice,
            active: true,
            highestBidder: address(0),
            highestBid: 0
        });

        allTokenIds.push(tokenId);

        emit NFTListed(tokenId, msg.sender, basePrice);
    }

    function placeBid(uint256 tokenId) external payable nonReentrant {
        NFTListing storage listing = listings[tokenId];
        require(listing.active, "NFT listing is not active");
        require(msg.sender != listing.seller, "Seller cannot bid on own NFT");
        require(msg.value > listing.highestBid && msg.value >= listing.basePrice, "Insufficient bid");

        address previousBidder = listing.highestBidder;
        uint256 previousBid = listing.highestBid;

        listing.highestBidder = msg.sender;
        listing.highestBid = msg.value;

        if (previousBidder != address(0)) {
            pendingReturns[previousBidder] += previousBid;
        }

        emit NewBid(tokenId, msg.sender, msg.value);
    }

    function endBidding(uint256 tokenId) external nonReentrant {
        NFTListing storage listing = listings[tokenId];
        require(listing.active, "NFT listing is not active");
        require(msg.sender == listing.seller, "Only seller can end bidding");

        listing.active = false;

        address winner = listing.highestBidder;
        uint256 finalBid = listing.highestBid;

        if (winner != address(0)) {
            _transfer(listing.seller, winner, tokenId);
            
            // Safe ETH transfer
            (bool success, ) = payable(listing.seller).call{value: finalBid}("");
            require(success, "Transfer failed");
            winnerNFTs[listing.highestBidder].push(tokenId);

            emit BiddingEnded(tokenId, winner, finalBid);
        } else {
            emit BiddingEnded(tokenId, listing.seller, 0);
        }
    }

    function withdrawPendingReturns() external nonReentrant {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "No pending returns");

        pendingReturns[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");

        emit WithdrawPending(msg.sender, amount);
    }

    function getActiveListings(uint256 start, uint256 count) external view returns (NFTListing[] memory) {
        uint256 totalListings = allTokenIds.length;
        uint256 end = start + count > totalListings ? totalListings : start + count;
        
        NFTListing[] memory activeListings = new NFTListing[](count);
        uint256 index = 0;

        for (uint256 i = start; i < end; i++) {
            uint256 tokenId = allTokenIds[i];
            if (listings[tokenId].active) {
                activeListings[index++] = listings[tokenId];
            }
        }

        assembly {
            mstore(activeListings, index) // Adjust array length in memory
        }

        return activeListings;
    }

    function getWonNFTsDetails(address user) external view returns (NFTListing[] memory) {
        uint256[] memory wonTokenIds = winnerNFTs[user];
        NFTListing[] memory wonNFTs = new NFTListing[](wonTokenIds.length);
        
        for (uint256 i = 0; i < wonTokenIds.length; i++) {
            wonNFTs[i] = listings[wonTokenIds[i]];
        }
        
        return wonNFTs;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function getNFTListing(uint256 tokenId) external view returns (NFTListing memory) {
        return listings[tokenId];
    }

    function getTotalListings() external view returns (uint256) {
        return allTokenIds.length;
    }
    
    function getNFTsWonByAddress(address winner) external view returns (uint256[] memory) {
        return winnerNFTs[winner];
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}