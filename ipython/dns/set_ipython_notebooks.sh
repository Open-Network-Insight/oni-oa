#!/bin/bash
log_info(){
    printf "[$(date) INFO]: %s\n" "$1"
}
log_error(){
    printf "[$(date) ERROR]: %s\n" "$1"
}

oni_oa_path=$1
new_name=$2
EDGE="Edge_Investigation_master.ipynb"
THREAT="Threat_Investigation_master.ipynb"
CPEDGE="Edge_Investigation.ipynb"
CPTHREAT="Threat_Investigation.ipynb"

log_info "Start to create ipython notebooks for today"
#new_path=`date +%Y%m%d`
#oni_oa_path example: /home/duxbury/DuxburyBay/ipython/dns
user_path="$oni_oa_path/user"
master_path="$oni_oa_path/master"

if [[ -n "$oni_oa_path" ]]; then
    if [[ ! -d "$user_path" ]]; then
	log_info "Needed to create ipython/dns/user directory"
	`mkdir ${user_path}`
    fi 
    if [[ ! -d "$user_path/$new_name" ]]; then
	log_info "Creating today's directory"
	`mkdir $user_path/${new_name}`
    fi
    `cp ${master_path}/${EDGE} ${user_path}/${new_name}/${CPEDGE}`
    `cp ${master_path}/${THREAT} ${user_path}/${new_name}/${CPTHREAT}`
    log_info "Create ipython notebooks completed for date ${new_name}"
    exit 0
fi

log_error "Usage ./set_ipython_notebooks.sh <oni path i.e. /home/duxbury/DuxburyBay/ipython/dns>"

exit 1
