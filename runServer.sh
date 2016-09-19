#!/bin/sh
JUPYTER_VERSION=`jupyter --version 2> /dev/null`
IPYTHON_VERSION=`ipython --version 2> /dev/null`

# Is Jupyter installed?
if [ "${JUPYTER_VERSION}" != "" ]; then
    if [ ! -f ~/.jupyter/custom/custom.js ]; then
        cp ui/ipython/custom/custom.* ~/.jupyter/custom/
    fi
    NOTEBOOK_CMD="jupyter notebook --no-mathjax --port=8889 --ip=0.0.0.0 --no-browser"
elif [ "${IPYTHON_VERSION}" != "" ]; then
    # Try with Ipython
    NOTEBOOK_CMD="ipython notebook --no-mathjax --port=8889 --ip=0.0.0.0 --no-browser '--NotebookApp.extra_static_paths=[\"ui/ipython/\"]'"
else
    # Not installed, exit
    echo "Jupyter/Ipython not found on your system."
    exit
fi

eval "${NOTEBOOK_CMD} > ipython.out 2>&1&"
