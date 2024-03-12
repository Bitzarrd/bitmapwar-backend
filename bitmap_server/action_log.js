import {now} from "./utils.js";

const TIE = 0;
const WIN = 1;
const LOSE = 2;

export function filter_action_log(logs, owner) {
    let result = [];
    for (let i = 0; i < logs.length; i++) {
        let log = logs[i];
        if (log.attacker === owner) {
            // result.push(log)
            result.push({
                create_time: log.create_time,
                virus_loss: log.virus_loss,
                state: log.attacker_virus === log.defender_virus ? TIE : (log.defender_virus > log.attacker_virus ? LOSE : WIN),
                my_map_id: log.attacker_map_id,
                enemy_map_id: log.defender_map_id,
            });
        }
        if (log.defender === owner) {
            result.push({
                create_time: log.create_time,
                virus_loss: log.virus_loss,
                state: log.attacker_virus === log.defender_virus ? TIE : (log.defender_virus > log.attacker_virus ? WIN : LOSE),
                my_map_id: log.defender_map_id,
                enemy_map_id: log.attacker_map_id,
            });
        }
    }
    return result;
}


function test() {
    let damage = 1;
    // let origin_player = {
    //     owner: "a",
    //     bitmap: "1001",
    //     virus: 1,
    // }
    // let player = {
    //     owner: "b",
    //     bitmap: "1002",
    //     virus: 2,
    // }

    // 2024-03-12T10:50:31.654Z debug: doFight: red(0) vs blue(1) at (913,814) damage:5
    let origin_player
    = {"i":31957,"x":871,"y":815,"bitmap":815871,"color":"blue","land":19427,"loss":5,"init_virus":6,"virus":1,"owner":"bc1qxdn0gvvwxgd34h6ts55lqr40hk3795evprxehy","taproot_address":"bc1pgfs57wl7aun4xwashptyvdqjaf2um4zcjc3jxnucyxs6fmdejyaqvf78l7"};

    let player=
    {"i":2,"x":914,"y":815,"bitmap":815914,"color":"red","land":1,"loss":5,"init_virus":5,"virus":0,"owner":"bc1q6w0r72z5ks954e3awr6muzaswp8d564fwqvmn2","taproot_address":"bc1p6v4tpmpaqqwtnzf5c4pc4szsq4d993ms6te9pwn0utmf8pxcynjs6st7al"};

    // action_log:{"create_time":1710240631,"virus_loss":5,"defender_map_id":815871,"attacker_map_id":815914,"attacker":"bc1q6w0r72z5ks954e3awr6muzaswp8d564fwqvmn2","defender":"bc1qxdn0gvvwxgd34h6ts55lqr40hk3795evprxehy","attacker_virus":0,"defender_virus":1}



    let action_log = {
        create_time: now(),
        virus_loss: damage,
        defender_map_id: origin_player.bitmap,
        attacker_map_id: player.bitmap,
        attacker: player.owner,
        defender: origin_player.owner,
        attacker_virus: player.virus,
        defender_virus: origin_player.virus
    }

    let action_logs = [];
    action_logs.push(action_log)

    let result_a = filter_action_log(action_logs, origin_player.owner);
    console.log(result_a);

    // let result_b = filter_action_log(action_logs, "b");
    // console.log(result_b);

}

// test();