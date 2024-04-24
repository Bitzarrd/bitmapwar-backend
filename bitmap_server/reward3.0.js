import {get_users} from "./reward.js";

export function getLast3User(players) {
    let users = get_users(players);
    let res = [];
    for (let owner of Object.keys(users)) {
        res.push(users[owner]);
    }
    if (res.length > 3) {
        //最后三个
        return res.slice(-3);
    }

    return res;
}

export function getLastUser(players) {
    let users = get_users(players);
    let ownerKeys = Object.keys(users);
    let lastOwner = ownerKeys[ownerKeys.length - 1];

    if (lastOwner) {
        return users[lastOwner];
    }

    return null;
}