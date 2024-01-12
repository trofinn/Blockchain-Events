// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EventTicketingFactory.sol";

contract Event is ERC721, Ownable {
    uint256 public constant REWARD_PERCENTAGE = 10;

    address public organizer;
    string public eventName;
    uint256 public eventPrice;
    uint256 public totalAvailableTickets;
    uint256 public totalSoldTickets;
    uint256 public reputationPoints;

    mapping(address => bool) public hasParticipated;
    mapping(address => bool) public hasReceivedReputation;
    mapping(uint256 => address) private participants;
    mapping(address => uint256[]) public userTickets;

    event TicketPurchased(address indexed participant, uint256 tokenId, uint256 timestamp);

    constructor(
        address _organizer,
        string memory _name,
        uint256 _totalTickets,
        uint256 _price,
        uint256 _reputationPoints
    ) ERC721("EventTicket", "ET") Ownable(_organizer) {
        organizer = _organizer;
        eventName = _name;
        totalAvailableTickets = _totalTickets;
        eventPrice = _price;
        reputationPoints = _reputationPoints;
    }

    function modifyEvent(uint256 _newPrice, uint256 _newTotalTickets, uint256 _newReputationPoints, string memory _newEventName, address userAddress) external {
        require(organizer == userAddress, "Only the owner can modify the event");
        require(_newTotalTickets >= totalSoldTickets, "New total tickets must be greater than or equal to total sold tickets");
        eventPrice = _newPrice;
        totalAvailableTickets = _newTotalTickets;
        reputationPoints = _newReputationPoints;
        eventName = _newEventName;
    }

    function purchaseTicket(uint256 _quantity, address userAddress) payable public {
        require(_quantity > 0, "Quantity must be greater than zero");
        require(msg.value == eventPrice * _quantity, "Incorrect payment amount");
        require(totalSoldTickets + _quantity <= totalAvailableTickets, "Not enough available tickets");

        for (uint256 i = 0; i < _quantity; i++) {
            uint256 tokenId = totalSoldTickets + 1;
            _mint(userAddress, tokenId);
            userTickets[userAddress].push(tokenId);
            participants[tokenId] = userAddress;
            totalSoldTickets++;

            emit TicketPurchased(userAddress, tokenId, block.timestamp);
        }

        payable(organizer).transfer(msg.value);
    }

    function getParticipants() external view returns (address[] memory) {
        address[] memory participantList = new address[](totalSoldTickets);
        for (uint256 i = 0; i < totalSoldTickets; i++) {
            participantList[i] = participants[i + 1];
        }
        return participantList;
    }

    function markReputationReceived(address user) external onlyOwner {
        require(!hasReceivedReputation[user], "Reputation points already received");
        hasReceivedReputation[user] = true;
    }

    function getOwnedNFTsForUser(address userAddress) external view returns (uint256[] memory) {
        return userTickets[userAddress];
    }
}