// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./EventTicketing.sol";

contract EventFactory {
    address[] public allEvents;
    mapping(address => address[]) public userToCreatedEvents;
    mapping(address => address[]) public userToParticipatedEvents;
    mapping(address => uint256) public userToReputation; // New mapping to store global reputation points

    event EventCreated(address indexed eventAddress, address indexed creator, string name, uint256 nbrOfTickets, uint256 price, uint256 reputationRequired, uint256 timestamp);
    event TicketBought(address indexed buyer, address indexed eventAddress, uint256 timestamp);

    function createEvent(string memory _name, uint256 _nbrOfTickets, uint256 _price, uint256 _reputationRequired) external returns (address) {
        Event newEvent = new Event(msg.sender, _name, _nbrOfTickets, _price, _reputationRequired);
        address eventAddress = address(newEvent);
        allEvents.push(eventAddress);
        userToCreatedEvents[msg.sender].push(eventAddress);

        emit EventCreated(eventAddress, msg.sender, _name, _nbrOfTickets, _price, _reputationRequired, block.timestamp);

        return eventAddress;
    }

    function getAllEvents() external view returns (address[] memory) {
        return allEvents;
    }

    function getEventPrice(address _eventAddress) external view returns (uint256) {
        Event eventContract = Event(_eventAddress);
        return eventContract.eventPrice();
    }

    function buyTickets(address _eventAddress, uint256 _quantity) payable public {
        require(_eventAddress != address(0), "Invalid event address");

        Event eventContract = Event(_eventAddress);


        require(eventContract.totalSoldTickets() + _quantity <= eventContract.totalAvailableTickets(), "Not enough available tickets");

        require(eventContract.reputationPoints() <= userToReputation[msg.sender], "You don't have enough reputation to participate");

        require(!eventContract.hasParticipated(msg.sender), "You have already purchased a ticket for this event");


        eventContract.purchaseTicket{value: msg.value}(_quantity, msg.sender);

        userToParticipatedEvents[msg.sender].push(_eventAddress);

        userToReputation[msg.sender] += 1;

        emit TicketBought(msg.sender, _eventAddress, block.timestamp);
    }

    function getUserParticipatedEvents(address user) external view returns (address[] memory) {
        return userToParticipatedEvents[user];
    }

    function getUserCreatedEvents(address user) external view returns (address[] memory) {
        return userToCreatedEvents[user];
    }

    function getUserGlobalReputation(address user) external view returns (uint256) {
        return userToReputation[user];
    }

    function getUserOwnedNFTsForEvent(address eventAddress) external view returns (uint256[] memory) {
        Event eventContract = Event(eventAddress);
        return eventContract.getOwnedNFTsForUser(msg.sender);
    }

    function getParticipantsOfEvent(address eventAddress) external view returns (address[] memory) {
        Event eventContract = Event(eventAddress);
        return eventContract.getParticipants();
    }
}