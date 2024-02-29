import {now} from "./utils.js";

export function filter_action_log(logs, owner) {
    let result = [];
    for (let i = 0; i < logs.length; i++) {
        let log = logs[i];
        if (log.attacker === owner) {
            // result.push(log)
            result.push({
                create_time: log.create_time,
                virus_loss: log.virus_loss,
                state: log.attacker_virus === log.defender_virus ? 0 : (log.defender_virus > log.attacker.attack_map_id ? 2 : 1),
                my_map_id: log.attacker_map_id,
                enemy_map_id: log.defender_map_id,
            });
        }
        if (log.defender === owner) {
            result.push({
                create_time: log.create_time,
                virus_loss: log.virus_loss,
                state: log.attacker_virus === log.defender_virus ? 0 : (log.defender_virus > log.attacker.attack_map_id ? 1 : 2),
                my_map_id: log.defender_map_id,
                enemy_map_id: log.attacker_map_id,
            });
        }
    }
    return result;
}


function test() {
    let damage = 1;
    let origin_player = {
        owner: "a",
        bitmap: "1001",
        virus: 1,
    }
    let player = {
        owner: "b",
        bitmap: "1002",
        virus: 2,
    }


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

    let result_a = filter_action_log(action_logs, "a");
    console.log(result_a);

    let result_b = filter_action_log(action_logs, "b");
    console.log(result_b);

}

// test();