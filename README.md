# ricket4pi

Python code for 4tronix initio robot buggy. Web-Interface to make it more accessible.

# Install

    git clone https://github.com/koyoki-al/ricket4pi.git
    cd ricket4pi
    cd bin
    ./install.sh

# Running

To Start:

    sudo supervisorctl start ricket_websock
    sudo supervisorctl start ricket_www

To Stop:
    
    sudo supervisorctl stop ricket_www
    sudo supervisorctl stop ricket_websock
   
To Check:

    sudo supervisorctl status


# Notes

Web Sockets provided by:

https://github.com/Pithikos/python-websocket-server

Robohat python code downloaded from:

http://4tronix.co.uk/robohat/robohat.py

Wheel sensor code originally cloned from:

https://github.com/ailiev/robohat
