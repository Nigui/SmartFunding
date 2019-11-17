pragma solidity ^0.5.12;

contract SmartFunding {
    
    mapping(address => uint) public donators;
    uint public nbDonators = 0;
    uint public amount = 0;
    uint public minimum;
    address payable public owner;
    
    event NewDonation(
        address indexed donator,
        uint amount
    );
    
    event GoalReached();
    
    modifier ownerOnly {
        require(msg.sender == owner, "you're not the owner");
        _;
    }
    modifier canDonate(){
        require(amount < minimum, "Goal Reached");
        require(msg.value > 0, "donation must be greater than 0");
        _;
    }
    modifier canWithdraw(){
        address caller = msg.sender;
        if( caller == owner ){
            require(amount >= minimum, "Goal not reached");
        } else {
            require(amount < minimum, "Goal reached");
            require(donators[caller] > 0, "Donation must be > 0");
        }
        _;
    }
    
    constructor(uint _minimum) public {
        minimum = _minimum;
        owner = msg.sender;
    }
    
    function donate() public payable canDonate {
        if( donators[msg.sender] == 0 ){
            nbDonators += 1;
        }
        donators[msg.sender] += msg.value;
        amount += msg.value;
        emit NewDonation(msg.sender,msg.value);
        if( amount >= minimum ){
            emit GoalReached();
        }
    }
    
    function withdrawDonations() public ownerOnly canWithdraw {
        owner.transfer(amount);
    }
    
    function withdraw() public canWithdraw {
        uint donation = donators[msg.sender];
        msg.sender.transfer(donation);
        delete donators[msg.sender];
        nbDonators -= 1;
        amount -= donation;
    }
    
}