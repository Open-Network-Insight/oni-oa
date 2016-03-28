#!/bin/bash

LIM=3000
ndate=$1

source /etc/duxbay.conf
export DBNAME
export DSOURCES
export LUSER
export LIM

echo "executing ops for date: $ndate"
echo `python2.7 lda_ranking.py --date $ndate --user ${LUSER} --ifile ${DSOURCES}_results.csv --ofile ${DSOURCES}_scores.csv --limit ${LIM}`
echo `python2.7 add_nc_and_rep_services.py --date $ndate --user ${LUSER} --${DSOURCES}`
echo `python2.7 suspicious_connects_op.py --date $ndate --user ${LUSER}`


