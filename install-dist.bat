set target_dir=c:\Apache24\htdocs\apps\acct4
set source_dir=dist\acct4

rem delete any existing installed distribution
if exist %target_dir% del %target_dir%\*.js %target_dir%\*.css %target_dir%\index.html
copy %source_dir%\*.* %target_dir% /Y
