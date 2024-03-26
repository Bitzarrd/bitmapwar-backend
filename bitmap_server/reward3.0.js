import {get_users} from "./reward.js";

export function getLast3User(players) {
    let users = get_users(players);
    if (users.length < 3) {
        return users;
    }
    return users.slice(-3);
}

