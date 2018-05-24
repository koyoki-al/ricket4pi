from websocket import WebSockServer
import movement as move
import robohat
from messages import Messages
from servoyaw import ServoYaw
from servotilt import ServoTilt

robohat.init()
move.init()

def jsonBool(boole):
    if boole:
        return "true"
    else:
        return "false"

def sonarScan():
    global tilt, yaw

    print "(o  ) 1"
    yaw.left()

    tilt.up()
    uL = robohat.getDistance()
    yaw.mid()
    uM = robohat.getDistance()
    yaw.right()
    uR = robohat.getDistance()

    tilt.centre()
    cR = robohat.getDistance()
    yaw.mid()
    cM = robohat.getDistance()
    yaw.left()
    cL = robohat.getDistance()

    tilt.down()
    dL = robohat.getDistance()
    yaw.mid()
    dM = robohat.getDistance()
    yaw.right()
    dR = robohat.getDistance()

    yaw.mid()
    tilt.centre()

    msg='{{"msg":{},"data":{{"dist":[[{},{},{}],[{},{},{}],[{},{},{}]]}}}}';
    msg = msg.format(Messages.MSG_SONAR_SCAN_DATA, uL, cL, dL, uM, cM, dM, uR, cR, dR)
    server.send(msg)

def detailedSonarScan(hGran=5, vGran=5, width=80, height=60, x = 50, y = 40):
    global tilt, yaw

    wX = x - (width / 2)
    wY = y - (width / 2)

    if wX < 0 or wY < 0 or wX > 100 or wY > 100:
        server.send('{{"msg":{},"data":{{"error":"{}""}}}}'.format(Messages.MSG_ERROR, "Scan coordinates are invalid."))
        return

    dX = float(width) / wGran;
    dY = float(height) / hGran;
    lr = True
    cX = 0
    cY = 0

    yaw.percentage(wX)
    response = '{"msg":' + MSG_SONAR_SCAN_DATA + ',"data":{"dist":['

    while cY < vGran:
        if cX != 0 or cY != 0:
            response += ","
        response += "["

        while cX < hGran:
            if cX == 0:
                if (wY <= 100):
                    tilt.percentage(wY)
            else:
                response += ","
                if lr:
                    wX += dX
                else:
                    wX -= dX
                cX += 1
                if (wX <= 100):
                    yaw.percentage(wX)

            response += robohat.getDistance()

        cX = 0
        cY += 1
        wY += dY
        lr = !lr
        response += "]"

    yaw.mid()
    tilt.centre()

    response += ']}'
    server.send(response)

def handleMessage(msg, data):
    global server, tilt, yaw

    print("Incoming", msg, data)

    if msg == Messages.MSG_READ_SENSORS:
        irL = jsonBool( robohat.irLeft() )
        irR = jsonBool( robohat.irRight() )
        lineL = jsonBool( robohat.irLeftLine() )
        lineR = jsonBool( robohat.irRightLine() )
        sonar = robohat.getDistance()

        print "Read sensors!"
        msg='{{"msg":{0},"data":{{"irL":{1},"irR":{2},"lineL":{3},"lineR":{4},"dist":{5}}}}}';
        msg = msg.format(Messages.MSG_SENSOR_DATA, irL, irR, lineL, lineR, sonar)
        server.send(msg)
    elif msg == Messages.MSG_FORWARD or msg == Messages.MSG_REVERSE:
        revs = 2
        speed = 40
        if data != None:
            if "r" in data:
                revs = data["r"]
            if "s" in data:
                speed = data["s"]
        if msg == Messages.MSG_FORWARD:
            print "Forward!"
            move.forward(revs, speed)
        else:
            print "Reverse!"
            move.reverse(revs, speed)
    elif msg == Messages.MSG_LEFT or msg == Messages.MSG_RIGHT:
        revs = 0.5
        speed = 100
        if data != None:
            if "r" in data:
                revs = data["r"]
            if "s" in data:
                speed = data["s"]
        if msg == Messages.MSG_LEFT:
            print "Left!"
            move.left(revs, speed)
        else:
            print "Right!"
            move.right(revs, speed)
    elif msg == Messages.MSG_SONAR_UP:
        print "Sonar up!"
        tilt.up()
    elif msg == Messages.MSG_SONAR_CENTRE:
        print "Sonar centre!"
        tilt.centre()
    elif msg == Messages.MSG_SONAR_DOWN:
        print "Sonar down!"
        tilt.down()
    elif msg == Messages.MSG_SONAR_LOW:
        print "Sonar low!"
        tilt.low()
    elif msg == Messages.MSG_SONAR_MID:
        print "Sonar middle!"
        yaw.mid()
    elif msg ==Messages. MSG_SONAR_LEFT:
        print "Sonar left!"
        yaw.left()
    elif msg == Messages.MSG_SONAR_RIGHT:
        print "Sonar right!"
        yaw.right()
    elif msg == Messages.MSG_SONAR_SCAN:
        sonarScan()
    elif msg == Messages.MSG_PARK_SONAR:
        yaw.mid()
        tilt.park()
    elif msg == Messages.MSG_FLOOR_SONAR:
        yaw.mid()
        tilt.floor()
    elif msg == Messages.MSG_GET_CLICKS:
        clicks = move.getClicks()
        msg='{{"msg":{0},"data":{{"clicks":{1}}}}}';
        msg = msg.format(Messages.MSG_CLICK_DATA, clicks)
        server.send(msg)
    elif msg == Messages.MSG_RESET_CLICKS:
        move.resetClicks()
    elif msg == Messages.MSG_TILT_PERCENT or msg == Messages.MSG_YAW_PERCENT:
        v = 50
        if data != None:
            if "v" in data:
                val = data["v"]
        if msg == Messages.MSG_TILT_PERCENT:
            print "Tilt", val
            tilt.percentage(val)
        else:
            print "Yaw", val
            yaw.percentage(val)
        reply='{{"msg":{0},"data":{{"msg":{1}}}}}';
        reply = reply.format(Messages.MSG_OK_DONE, msg)
        server.send(reply)
    elif msg == Messages.MSG_DETAIL_SCAN:
        hGran=5
        vGran=5
        width=80
        height=60
        x = 50
        y = 40
        if data != None:
            if "hG" in data:
                hGran = data["hG"]
            if "vG" in data:
                hGran = data["vG"]
            if "w" in data:
                width = data["w"]
            if "h" in data:
                height = data["h"]
            if "x" in data:
                x = data["x"]
            if "y" in data:
                y = data["y"]
        detailedSonarScan(hGran, vGran, width, height, x, y)
    else:
        print "[WARN] Not handled!", msg

server = WebSockServer(handleMessage)
tilt = ServoTilt()
yaw = ServoYaw()

server.run()
