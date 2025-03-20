// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {SwipeBid} from "../src/SwipeBid.sol";

contract DeploySwipeBid is Script {
    
    function run() external returns (SwipeBid) {
        vm.startBroadcast();
        
        SwipeBid swipeBid = new SwipeBid();
        
        vm.stopBroadcast();
        return swipeBid;
    }
}
