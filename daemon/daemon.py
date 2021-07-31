from flask import Flask
from flask import request as req
from requests.api import head
from flask_cors import CORS
import requests

import win32gui, win32con
import multiprocessing
import os

#hide = win32gui.GetForegroundWindow()
#win32gui.ShowWindow(hide , win32con.SW_HIDE)


app = Flask(__name__)
CORS(app)


@app.route("/")
def indexHandler():
    return "READY"

@app.route("/geturlredirects", methods = ["POST"] )
def getUrlRedirectsHandler():

    body = req.get_json()


    dataToSend = {}
    for i,url in enumerate(body["urls"]):
        request = None
        try:
           request = requests.get(url, headers= {"User-Agent" : str(req.user_agent)})
        except Exception as err:
            print(err)
            print("bruh")
            next(enumerate(body["urls"]), None)
            continue
        redirects = []
        for i2,x in enumerate(request.history):
            obj = {
            "url": x.url,
            "statusCode": x.status_code
            }

            if i2 == 0:
                obj["start"] = True

            if i2 == len(request.history) - 1:
                obj["end"] = True

        
            redirects.append(obj)  
              
        
    

        dataToSend[url] = {
            "amountOfRedirects": len(redirects),
            "redirects": redirects
        }      

    return dataToSend

process = multiprocessing.current_process()
pidFile = open(os.path.join(os.getcwd() + "\daemon\PID"), "w")
pidFile.write(str(process.pid))
pidFile.close()    

app.run()