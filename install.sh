#!/bin/bash
pushd .
cd static/
npm run install-all && npm run build-all
popd
