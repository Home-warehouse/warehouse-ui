=============
HomeWarehouse
=============

Manage Your groceries, laundry, tools and other things that You would like to track and keep eye on.

HomeWarehouse has location/product system with built-in raports and automatizations.
App will give You a possibility to create groceries list and save it in integrated note app without need of time consuming reminding which things are missing.

.. image:: https://raw.githubusercontent.com/Home-warehouse/warehouse-ui/master/screenshots/screenshot_0.3.0.png

==============
How to install
==============

-----------
With `docker <https://docs.docker.com/engine/install/>`_
-----------
- Linux/macOS
   #. Run from terminal: ``bash <(curl -s https://raw.githubusercontent.com/Home-warehouse/warehouse-api/master/install_nix.sh) './hw' 'localhost' 5000 5001``
   #. Go to http://localhost:5000/
   #. Login to admin account, email: ``home-warehouse@mail.com``; password: ``home-warehouse-supervisor`` and change account data
- Windows
  #. Run from PowerShell: ``Invoke-WebRequest https://raw.githubusercontent.com/Home-warehouse/warehouse-api/master/install_windows.ps1 -OutFile .\install_windows.ps1; .\install_windows.ps1 './hw' 'localhost' 5000 5001``
  #. Go to http://localhost:5000/
  #. Login to admin account, email: ``home-warehouse@mail.com``; password: ``home-warehouse-supervisor`` and change account data

**Use evernote integration**

#. Generate evernote `developer token <https://sandbox.evernote.com/api/DeveloperToken.action>`_
#. Set generated token as system env var on Linux/macOS: ``export EVERNOTE_TOKEN="<token goes here>"``
#. Set generated token as system env var on Windows: ``$Env:EVERNOTE_TOKEN="<token goes here>"``
#. Run installation script

`API reference <https://github.com/Home-warehouse/warehouse-api>`_
