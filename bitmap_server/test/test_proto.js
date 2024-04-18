import {SoldierMovementUpdate} from "../gen/bitmapwar_pb.js";

let message = new SoldierMovementUpdate({
    turn: 1
});

console.log("message", message.toBinary())