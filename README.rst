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
- Linux/macOS - ``bash <(curl -s https://raw.githubusercontent.com/Home-warehouse/warehouse-api/master/install_nix.sh) './hw' 5000 5001``

**Use evernote integration**

#. To use evernote integration create .env file where you will call script.
#. Generate evernote `developer token <https://sandbox.evernote.com/api/DeveloperToken.action>`_
#. Paste generated token to .env file using format: ``EVERNOTE_TOKEN=<token goes here>``
#. Run installation script

`API reference <https://github.com/Home-warehouse/warehouse-api>`_
