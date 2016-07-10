from subprocess import check_output

class Engine(object):

    def __init__(self,db,conf):
   
        self._daemon_node = conf['impala_daemon']
        self._db = db
        impala_cmd = "impala-shell -i {0} --quiet -q 'INVALIDATE METADATA {1}.dns'".format(self._daemon_node,self._db)
        check_output(impala_cmd,shell=True)
    
        impala_cmd = "impala-shell -i {0} --quiet -q 'REFRESH {1}.dns'".format(self._daemon_node,self._db)
        check_output(impala_cmd,shell=True)

    def query(self,query,output_file=None):

        if output_file:
            impala_cmd = "impala-shell -i {0} --quiet --print_header -B --output_delimiter='\\t' -q \"{1}\" -o {2}".format(self._daemon_node,query,output_file)
        else:
            impala_cmd = "impala-shell -i {0} --quiet --print_header -B --output_delimiter='\\t' -q \"{1}\"".format(self._daemon_node,query)
              
        check_output(impala_cmd,shell=True)