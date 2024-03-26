import {get_users} from "./reward.js";

export function getLast3User(players) {
    let users = get_users(players);
    let res = [];
    for (let owner of Object.keys(users)) {
        res.push(users[owner]);
    }
    if (res.length > 3) {
        return res.slice(0, 3);
    }

    return res;
}

