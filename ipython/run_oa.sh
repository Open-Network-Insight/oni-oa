#!/bin/bash

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

ndate=$1
LIM=$2
TYPE=$3

source /etc/duxbay.conf
export DBNAME
export DSOURCES
export LUSER
#export LIM

echo "executing ops for date: $ndate"

if [[ "$TYPE" == flow ]]; then
    echo `python2.7 lda_ranking.py --date $ndate --user ${LUSER} --ifile ${TYPE}_results.csv --ofile ${TYPE}_scores.csv --limit ${LIM}`
    echo `python2.7 add_nc_and_rep_services.py --date $ndate --user ${LUSER} --${TYPE}`
    echo `python2.7 suspicious_connects_op.py --date $ndate --user ${LUSER}` elif [[ "$TYPE" == dns ]]; then
    cd $dir/dns
    echo `python2.7 $dir/dns/dns_oa.py -d $ndate -i $dir/dns -l ${LIM}` else
    echo "data type not selected"
fi
