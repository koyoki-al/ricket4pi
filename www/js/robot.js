function Robot()
{
    const STATE_INIT = 0,
          STATE_PAUSE = 1,
          STATE_REQUEST_SENSOR_DATA = 2,
          STATE_IDLE = -2,
          STATE_NONE = -1;

    var obj = {};

    function delayedStateChange(next_state, time)
    {
        obj.state = STATE_PAUSE;
        obj.next_state = next_state;
        obj.pause_time = time;
    }

    function state_init(dT)
    {
        delayedStateChange(STATE_REQUEST_SENSOR_DATA, 1000);
        consoleOut("Robot: Initialised.");
    }

    function state_pause(dT)
    {
        obj.pause_time -= dT;
        if (obj.pause_time <= 0)
        {
            obj.state = obj.next_state;
            obj.pause_time = 0;
        }
    }

    function state_request_sensor_data(dT)
    {
        obj.state = STATE_IDLE;

        connectionSend('{"msg":' + MSG_READ_SENSORS + '}');
        consoleOut("Robot: Request sensor data.");
    }

    obj.update = function()
    {
        var now = (new Date).getTime(),
            dT = now - obj.last;

        switch (obj.state)
        {
        case STATE_INIT:
            state_init(dT);
            break;

        case STATE_PAUSE:
            state_pause(dT);
            break;

        case STATE_REQUEST_SENSOR_DATA:
            state_request_sensor_data(dT);
            break;
        }

        obj.last = now;
    }

    obj.forward = function()
    {
        var drive_revs = document.getElementById("drive_revs"),
            drive_speed = document.getElementById("drive_speed"),
            revs,
            speed;

        revs = drive_revs.value;
        speed = drive_speed.value;

        connectionSend('{"msg":' + MSG_FORWARD + ',"data":{"r":' + revs + ',"s":' + speed + '}}');
        consoleOut("Robot: Forward.");
    }

    obj.reverse = function()
    {
        var drive_revs = document.getElementById("drive_revs"),
            drive_speed = document.getElementById("drive_speed"),
            revs,
            speed;

        revs = drive_revs.value;
        speed = drive_speed.value;

        connectionSend('{"msg":' + MSG_REVERSE + ',"data":{"r":' + revs + ',"s":' + speed + '}}');
        consoleOut("Robot: Reverse.");
    }

    obj.left = function()
    {
        var turn_revs = document.getElementById("turn_revs"),
            turn_speed = document.getElementById("turn_speed"),
            revs,
            speed;

        revs = turn_revs.value;
        speed = turn_speed.value;

        connectionSend('{"msg":' + MSG_LEFT + ',"data":{"r":' + revs + ',"s":' + speed + '}}');
        consoleOut("Robot: Left.");
    }

    obj.right = function()
    {
        var turn_revs = document.getElementById("turn_revs"),
            turn_speed = document.getElementById("turn_speed"),
            revs,
            speed;

        revs = turn_revs.value;
        speed = turn_speed.value;

        connectionSend('{"msg":' + MSG_RIGHT + ',"data":{"r":' + revs + ',"s":' + speed + '}}');
        consoleOut("Robot: Right.");
    }

    obj.getSensorData = function()
    {
        connectionSend('{"msg":' + MSG_READ_SENSORS + '}');
        consoleOut("Robot: Request sensor data.");
    }

    obj.tiltUp = function()
    {
        connectionSend('{"msg":' + MSG_SONAR_UP + '}');
        consoleOut("Robot: Tilt up.");
    }

    obj.tiltCentre = function()
    {
        connectionSend('{"msg":' + MSG_SONAR_CENTRE + '}');
        consoleOut("Robot: Tilt centre.");
    }

    obj.tiltDown = function()
    {
        connectionSend('{"msg":' + MSG_SONAR_DOWN + '}');
        consoleOut("Robot: Tilt down.");
    }

    obj.tiltLow = function()
    {
        connectionSend('{"msg":' + MSG_SONAR_LOW + '}');
        consoleOut("Robot: Tilt low.");
    }

    obj.sonarLeft = function()
    {
        connectionSend('{"msg":' + MSG_SONAR_LEFT + '}');
        consoleOut("Robot: Sonar left.");
    }

    obj.sonarMid = function()
    {
        connectionSend('{"msg":' + MSG_SONAR_MID + '}');
        consoleOut("Robot: Sonar middle.");
    }

    obj.sonarRight = function()
    {
        connectionSend('{"msg":' + MSG_SONAR_RIGHT + '}');
        consoleOut("Robot: Sonar right.");
    }

    obj.sonarScan = function()
    {
        connectionSend('{"msg":' + MSG_SONAR_SCAN + '}');
        consoleOut("Robot: Sonar scan.");
    }

    obj.sonarPark = function()
    {
        connectionSend('{"msg":' + MSG_PARK_SONAR + '}');
        consoleOut("Robot: Sonar park.");
    }

    obj.sonarFloor = function()
    {
        connectionSend('{"msg":' + MSG_FLOOR_SONAR + '}');
        consoleOut("Robot: Sonar floor.");
    }

    obj.resetClicks = function()
    {
        connectionSend('{"msg":' + MSG_RESET_CLICKS + '}');
        consoleOut("Robot: reset clicks.");
    }

    obj.getClicks = function()
    {
        connectionSend('{"msg":' + MSG_GET_CLICKS + '}');
        consoleOut("Robot: get clicks.");
    }

    obj.sonarTilt = function()
    {
        var tilt_slide = document.getElementById("tilt_slide");

        obj.tiltPercent(tilt_slide.value);
    }

    obj.sonarYaw = function()
    {
        var yaw_slide = document.getElementById("yaw_slide");

        obj.yawPercent(yaw_slide.value);
    }

    obj.tiltPercent = function(val)
    {
        connectionSend('{"msg":' + MSG_TILT_PERCENT + ',"data":{"v":' + val + '}}');
        consoleOut("Robot: tilt - " + val + "%");
    }

    obj.yawPercent = function(val)
    {
        connectionSend('{"msg":' + MSG_YAW_PERCENT + ',"data":{"v":' + val + '}}');
        consoleOut("Robot: yaw - " + val + "%");
    }

    obj.detailedScan = function()
    {
        var tilt, yaw, renderData, i;

        stage = obj._stage || 0;
        result = obj._result || [];

        if (stage == 25)
        {
            renderData = expandData(result);
            colourCanvas(renderData);

            obj._scanning = false;
            return;
        }

        if (!obj._scanning)
        {
            for(i = 0; i < 5; ++i)
            {
                obj._result[i] = [];
            }
            obj._scanning = true;   
        }

        yaw = (stage % 5) * 25;
        tilt = 25 + (((stage / 5) << 0) * 10)

        connectionSend('{"msg":' + MSG_TILT_PERCENT + ',"data":{"v":' + tilt + '}}');
        connectionSend('{"msg":' + MSG_YAW_PERCENT + ',"data":{"v":' + yaw + '}}');

        obj._stage = stage + 1;

    }

    obj.incomingMessage = function(msg, data)
    {
        var x, y;
        switch(msg)
        {
        case MSG_OK_DONE:
            if (obj._scanning && data.msg == MSG_YAW_PERCENT)
            {
                obj.state_request_sensor_data();
            }
            break;
        case MSG_SENSOR_DATA:
            if (obj._scanning)
            {
                x = (stage % 5)
                y = ((stage / 5) << 0)
                console.log("[INFO] Scan[" + x + "," + y +"] = " + data.dist);
                obj._result[x][y] = data.dist;
                obj.detailedScan();
            }
            break;
        }
    }

    obj.state = STATE_INIT;
    obj.last = (new Date).getTime();
    obj.timer = setInterval(obj.update, 250);

    consoleOut("Robot: Created.");

    return obj;
}
