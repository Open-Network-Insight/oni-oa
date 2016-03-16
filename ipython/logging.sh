#!/bin/bash

log_info(){
    printf "[$(date) INFO]: %s\n" "$1"
}
log_error(){
    printf "[$(date) ERROR]: %s\n" "$1"
}
