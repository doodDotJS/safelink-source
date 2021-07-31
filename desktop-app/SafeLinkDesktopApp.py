import os, signal
from pickle import TRUE
import subprocess
from termcolor import colored
import time
import sys
import winreg


from win32com.client import Dispatch

os.system("COLOR")

print(colored("""

   _____        __     _      _       _      _____                                   
  / ____|      / _|   | |    (_)     | |    |  __ \                                  
 | (___   __ _| |_ ___| |     _ _ __ | | __ | |  | | __ _  ___ _ __ ___   ___  _ __  
  \___ \ / _` |  _/ _ \ |    | | '_ \| |/ / | |  | |/ _` |/ _ \ '_ ` _ \ / _ \| '_ \ 
  ____) | (_| | ||  __/ |____| | | | |   <  | |__| | (_| |  __/ | | | | | (_) | | | |
 |_____/ \__,_|_| \___|______|_|_| |_|_|\_\ |_____/ \__,_|\___|_| |_| |_|\___/|_| |_|
                                                                                     
                                                                            by dood.js
""", "green"))

pidProcess = None


def createShortcut(path, target='', wDir='', args = '', icon=''):  
    shell = Dispatch('WScript.Shell')
    shortcut = shell.CreateShortCut(path)
    shortcut.Targetpath = target
    shortcut.Arguments = args
    shortcut.WorkingDirectory = wDir
    if icon == '':
        pass
    else:
        shortcut.IconLocation = icon
    shortcut.save()

def toggleAutoLaunch():
    #print(os.listdir(os.path.expanduser("~") + "\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup"))
    targetDir = os.path.join(os.path.expanduser("~") + r"\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup")
    shortcutExists = os.path.exists(targetDir + r"\SafeLinkDesktopApp.exe.lnk")
    if shortcutExists == True:
        os.remove(targetDir + r"\SafeLinkDesktopApp.exe.lnk")
        return [True, "disabled"]
    else:
        createShortcut(targetDir + r"\SafeLinkDesktopApp.exe.lnk", os.getcwd() + r'\SafeLinkDesktopApp.exe',  os.getcwd(), "-a")
        return [True, "enabled"] 


toggleAutoLaunch()        


try:
    if sys.argv[1] == "-a":
        try:
            pidProcess = subprocess.Popen(os.path.join(os.getcwd() + "\daemon\daemon.exe"), creationflags=0x08000000)
            time.sleep(3)
            print(colored("Success! Daemon has started automatically. Remember that if you close this window, the daemon will still run in the background.", "green"))
        except:
            print(colored("An error ocurred when trying to run the daemon.", "red"))
except:
    pass            
      





def mainMenu(showPrompt = False):
    if showPrompt == True:
        print(colored("""
    Select one of the following options:
    - 1. Start/Stop the daemon.
    - 2. Enable/Disable autostart of the daemon.
    - 3. Show credits.
    """, "yellow"))
    option = input("> ")

    try:
        option = int(option)
    except:
        print(colored("Enter the number.", "red"))
        return mainMenu()

    if option > 3:
        print(colored("Invalid option", "red"))
        return mainMenu()

    if option == 1:
        global pidProcess
        if pidProcess == None:
            try:
                pidProcess = subprocess.Popen(os.path.join(os.getcwd() + "\daemon\daemon.exe"), creationflags=0x08000000)
                time.sleep(3)
                print(colored("Success! Just remember that when you close this window, the daemon will still run in the background.", "green"))
            except:
                print(colored("An error ocurred when trying to run the daemon.", "red"))
            return mainMenu()
        else:
            pidFile = None
            try:
                pidFile =  open(os.path.join(os.getcwd() + "\daemon\PID")) 
            except:
                print(colored("An error occurred when getting the PID for the daemon. Try killing it with task manager.", "red"))    
                return mainMenu()

            try:
                os.kill(int(pidFile.read()), signal.SIGTERM) 
                pidProcess = None
                print(colored("Success!", "green"))
            except:
                print(colored("An error occurred when trying to kill the daemon process. Try killing it with task manager.", "red"))           
            return mainMenu()

    elif option == 2:
        success = toggleAutoLaunch()
        if success[0] == True:
            if success[1] == "enabled":
                print(colored("Success! It has been enabled", "green"))
            else:
                print(colored("Success! It has been disabled", "green"))    

        return mainMenu()

    elif option == 3:
        print(colored("""
Created by dood.js.
https://dood-portfolio.netlify.app
------------------------
Thanks to KDJ for testing.
        """, "yellow"))   
        return mainMenu()      
            

mainMenu(True)