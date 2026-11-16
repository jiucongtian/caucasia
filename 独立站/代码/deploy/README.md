# Docker 测试部署

前台、管理端、API使用同一Git提交和同一个Node容器。不依赖Redis或队列，不连接其他业务数据库。

- 发布目录：`/opt/starlink-test/releases/<完整SHA>/`；current指向当前发布。
- Compose：`deploy/compose.yml`，项目名starlink-test；端口仅127.0.0.1:5190。
- 持久化：`/opt/starlink-test/shared/data`，容器node用户UID1000写入。发布不覆盖该目录，凭据不进入镜像或Git。
- HTTPS：Nginx按本目录配置代理；证书使用服务器已有Certbot webroot流程。
- 从干净Git版本导出独立站/代码，设置TARGET_SHA和RELEASE_ID后运行docker compose build，再up -d --wait。
- 备份：停止本应用容器后备份shared/data，再启动；生产数据需另行落实站外备份。
- 回滚：保留旧镜像和目录，使用旧发布的SHA变量执行同一Compose项目的up -d --wait，再将current切回旧目录。本次初次部署无旧Starlink版本；失败时停止本项目并撤销专属Nginx配置，不动其他业务。
- 管理员在服务器单独初始化，默认要求12字符以上；本机测试短密码不能用于公网。
