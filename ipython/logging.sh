#!/bin/bash

red=$(tput setaf 1)
green=$(tput setaf 76)

log_info() {
	printf "${green}[$(date) INFO]: %s\n" "$@" 
}
log_error(){
	printf "${red}[$(date) ERROR]: %s\n" "$@"
}

