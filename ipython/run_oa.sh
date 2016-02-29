#!/bin/bash
source ./logging.sh

LIM=3000
ndate=$1
dsources=$2 
execute_sco=$3

source /etc/duxbay.conf
export DBNAME
export LUSER
export LIM

log_info "Ops starts..."

if [[ -n "$ndate" && -n "$dsource" && -n "$execute_sco" ]]; then
	log_info "Executing ops for date: $ndate"
	log_info "Execute lda_ranking.py starts..."
	echo `python2.7 lda_ranking.py --date $ndate --user ${LUSER} --ifile $dsources__results.csv --ofile $dsources_scores.csv --limit ${LIM}`
	log_info "completed."
	log_info "Execute add_nc_and_rep_services.py starts..."
	echo `python2.7 add_nc_and_rep_services.py --date $ndate --user ${LUSER} --$dsources`
	log_info "completed."
	if [ $execute_soc = "yes" ];	then
		log_info "Execute suspicious_connects_op.py starts..."
		echo `python2.7 suspicious_connects_op.py --date $ndate --user ${LUSER}`
		log_info "completed."
	fi
	log_info "...Ops completed."
	exit 0
fi

log_error "One or more parameters are not correct"
printf "Usage ./run_oa.sh [ndate] [flow OR dns] [yes OR no]\nArguments:\nndate\t: date to execute\nflow\t: will process flows\ndns\t: will process dns\nyes\t: will execute suspicious_connects_op.py\nno\t: won't execute suspicious_connects_op.py\n"
exit 1
