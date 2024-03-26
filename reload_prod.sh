if cd /www/wwwroot/bitmap3001 && git remote update && git status -uno | grep -q 'Your branch is behind'; then
    echo "Git有更新可供拉取";
    # 执行相应的操作
    git pull;
    echo "拉取完成";
    mkdir -p "/www/wwwroot/bitmap_dev_client/packages/sample/public/static/$(git rev-parse --short HEAD)";
    cp -rf /www/wwwroot/bitmap3001/Build/* "/www/wwwroot/bitmap_dev_client/packages/sample/public/static/$(git rev-parse --short HEAD)" ;
    echo "window.gitRev= \"$(git rev-parse --short HEAD)\";" > "/www/wwwroot/bitmap_dev_client/packages/sample/public/static/rev.js";
    echo "复制完成";
    /www/server/panel/pyenv/bin/python /www/server/panel/pyenv/bin/supervisorctl -c /etc/supervisor/supervisord.conf restart test_client:test_client_00;
    echo "重启完成";
else
    echo "Git没有更新";
fi