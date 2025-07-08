import urllib.request
import subprocess
import sys
import os

print("Загружаем pip...")
url = "https://bootstrap.pypa.io/get-pip.py"
try:
    with urllib.request.urlopen(url) as response:
        data = response.read()
        with open("get-pip.py", "wb") as f:
            f.write(data)
    
    print("Устанавливаем pip...")
    subprocess.check_call([sys.executable, "get-pip.py"])
    os.remove("get-pip.py")
    print("pip успешно установлен!")
except Exception as e:
    print(f"Ошибка: {e}")
