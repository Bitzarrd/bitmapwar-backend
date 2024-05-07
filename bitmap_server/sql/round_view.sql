SELECT
	cast( from_unixtime( `round_users`.`end_time` ) AS DATE ) AS `date`,
	sum( `round_users`.`init_virus` ) AS `virus_count`,
	count( DISTINCT `round_users`.`owner` ) AS `user_count`
FROM
	`round_users`
GROUP BY
	cast(
	from_unixtime( `round_users`.`end_time` ) AS DATE)


	--///

	CREATE OR REPLACE ALGORITHM = UNDEFINED DEFINER = `root`@`%` SQL SECURITY DEFINER VIEW `bitmap_prod`.`round_users` AS SELECT
    	concat( `round`.`id`, ':', `jt`.`owner` ) AS `id`,
    	`round`.`end_time` AS `end_time`,
    	from_unixtime( `round`.`end_time` ) AS `end_datetime`,
    	`jt`.`taproot_address` AS `taproot_address`,
    	`jt`.`owner` AS `owner`,
    	`jt`.`init_virus` AS `init_virus`
    FROM
    	(
    		`round`
    		JOIN json_table (
    		`round`.`rank`,
    	'$[*]' COLUMNS ( `owner` VARCHAR ( 255 ) CHARACTER SET utf8mb4 path '$.owner', `taproot_address` VARCHAR ( 255 ) CHARACTER SET utf8mb4 path '$.taproot_address', `init_virus` INT path '$.init_virus' )) `jt`);