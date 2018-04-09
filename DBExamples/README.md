* MongoDB Tool : Robomongo(Robo 3T)
* mongo DB
* mongoose
* crypto
* mysql install
  - Download dmg file(https://dev.mysql.com/downloads/file/?id=475582)
  - Development Tool for Mac : Sequel Pro (https://sequelpro.com/download#auto-start)
* mysql root password reset
  ```
    $ sudo /usr/local/mysql/support-files/mysql.server stop
    $ sudo /usr/local/mysql/support-files/mysql.server start --skip-grant-tables
  ```
  - in a new terminal
  ```
  $ sudo /usr/local/mysql/bin/mysql -u root
  ```
  ```
  mysql> UPDATE mysql.user SET authentication_string=PASSWORD('New Password') WHERE User='root';
  mysql> FLUSH PRIVILEGES;
  mysql> \q
  ```
  - in a old terminal
  ```
    $ sudo /usr/local/mysql/support-files/mysql.server stop
  ```
  - restart it in normal mode
  ```
    $ sudo /usr/local/mysql/support-files/mysql.server start
  ```
  