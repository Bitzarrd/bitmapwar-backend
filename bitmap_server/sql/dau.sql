SELECT DATE(FROM_UNIXTIME(create_time)) AS date, COUNT(DISTINCT owner) AS dau
FROM action_log
WHERE action = 'login'
GROUP BY DATE(FROM_UNIXTIME(create_time))
ORDER BY DATE(FROM_UNIXTIME(create_time));


SELECT DATE(FROM_UNIXTIME(create_time)) AS date, COUNT(DISTINCT owner) AS dru
FROM action_log
WHERE action = 'register'
GROUP BY DATE(FROM_UNIXTIME(create_time))
ORDER BY DATE(FROM_UNIXTIME(create_time));