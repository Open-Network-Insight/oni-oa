#!/bin/sh
./OniWebApplication.py oninotebook --profile=ia --port=8889 --ip=0.0.0.0 --no-browser '--NotebookApp.extra_static_paths=["ipython/"]' > ipython.out 2>&1&
