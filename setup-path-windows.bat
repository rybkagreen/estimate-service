@echo off
echo Добавление приложений в системный PATH...
echo.

REM Сохраняем текущий PATH
echo Текущий PATH сохранен.

REM Добавляем пути к приложениям
setx PATH "%PATH%;C:\Users\Belinad\portable-apps\gh_cli" /M
setx PATH "%PATH%;C:\Users\Belinad\portable-apps\nodejs" /M
setx PATH "%PATH%;C:\Users\Belinad\portable-apps\node-v20.13.1-win-x64" /M
setx PATH "%PATH%;C:\Users\Belinad\portable-apps\postgresql\bin" /M
setx PATH "%PATH%;C:\Users\Belinad\portable-apps\python" /M
setx PATH "%PATH%;C:\Users\Belinad\portable-apps\python\Scripts" /M
setx PATH "%PATH%;C:\Users\Belinad\portable-apps\redis" /M
setx PATH "%PATH%;C:\Users\Belinad\gh_cli" /M

echo.
echo Приложения добавлены в системный PATH!
echo.
echo ВАЖНО: Для применения изменений необходимо:
echo 1. Закрыть все окна командной строки и терминалы
echo 2. Открыть новое окно терминала
echo.
echo Или выполните команду в Git Bash: source ~/.bashrc
echo.
pause
