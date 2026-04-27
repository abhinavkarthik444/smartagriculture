@echo off
echo Resetting MySQL root password...
echo.

REM Stop MySQL service
net stop mysql

REM Create init file to reset password
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword'; > C:\mysql-init.txt
echo FLUSH PRIVILEGES; >> C:\mysql-init.txt

REM Start MySQL with init file
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --init-file=C:\mysql-init.txt

REM Clean up
del C:\mysql-init.txt

echo.
echo MySQL root password has been reset to: newpassword
echo Please update your .env file with this password.
echo.
net start mysql
pause
