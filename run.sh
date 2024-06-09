#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd)
cd $SCRIPT_DIR
git pull
npm i
npm start
