import ast  
import os
import json
import urllib2
import requests
import json
import csv   
import urllib 
import subprocess
from pyhive import hive
from flask import Flask, abort, request, jsonify, g, url_for, session, current_app, Blueprint
from flask.ext.cors import CORS, cross_origin
from passlib.apps import custom_app_context as pwd_context
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)
from impala.dbapi import connect  
from iana import iana_transform
  
blueprint = Blueprint('data_api', __name__) 
 
FILE_PATH = 'ipython/dns/user/'
CONTENT_TYPE = 'application/json'  
 

#-------------------------------------------DNS METHODS------------------------------------------------#
@blueprint.route('/dns/suspicious/<date>', methods=['GET','POST']) 
def get_dns_suspicious(date=None):
    """Returns top 250 suspicious dns detected by ML, ordered by most suspcious first
        and only ones that haven't been ranked by the security analyst. 
    """
    conf = current_app.config["API"]     
    date = date if date != None else configData['DEFAULT_DATE'] 
    dbname = conf["DATABASE"]

    try:  
        if int(date):
            yy = date[0:4]
            mm = date[4:6]
            dd = date[6:8]
    except ValueError:        
        return "Unexpected date format", 400
    else:
        if not yy or not mm or not dd:
            return "Unexpected date format", 400 
        else: 
            qry = "SELECT susp.frame_time, susp.ip_dst, susp.dns_qry_name, susp.dns_qry_class, susp.dns_qry_type, susp.dns_qry_rcode, susp.score, susp.query_rep, susp.hh FROM " + dbname + ".dns_susp as susp "
            qry = qry + " LEFT JOIN " + dbname + ".dns_scores as scores ON scores.dns_qry_name = susp.dns_qry_name WHERE scores.dns_qry_name IS NULL "
            qry = qry + " AND susp.y=" + yy + " AND susp.m=" + mm + " AND susp.d=" + dd + " "
    if request.method == 'POST' and request.headers['Content-Type'] == CONTENT_TYPE:
        try:
            obj = json.loads(request.data)  
            qry = qry + " AND susp.ip_dst = '" + obj["ip_dst"]+ "'" if obj.has_key("ip_dst") else qry + ""
            qry = qry + " AND susp.dns_qry_name = '" + obj["dns_qry_name"]+ "'" if obj.has_key("dns_qry_name") else qry + ""
        except Exception, e:
            return "Bad request", 400 
    qry = qry + " LIMIT 250"   
    res = ExecuteReader(qry)   
    if isinstance(res[1], (int, long)):
        print res
        return res
    else: 
        ian = IanaCodesReplace(res[1])
        return jsonify({'headers':res[0] , 'data':ian})
 

@blueprint.route('/dns/details/<date>', methods=['POST'])
def get_dns_details(date=None): 
    configData=current_app.config["API"]     
    date = date if date != None else configData['DEFAULT_DATE']
    try:  
        if int(date):
            yy = date[0:4]
            mm = date[4:6]
            dd = date[6:8]
    except ValueError:        
        return "Unexpected date format", 400 
    else:
        qry= "SELECT frame_time, frame_len, ip_dst, ip_src, dns_qry_name, dns_qry_class, dns_qry_type, dns_qry_rcode, dns_a FROM " + configData["DATABASE"] + ".dns WHERE y=" + yy + " AND m=" + mm + " AND d=" + dd + ""
        if request.method == 'POST' and request.headers['Content-Type'] == 'application/json':
            try:
                obj = json.loads(request.data)  
                time = obj["time"] if obj.has_key("time") else ""
                hh = ""
                if time != "" :
                    hh = time[0:time.find(":")] 
                qry = qry + " AND dns_qry_name LIKE '%" + obj["dns_qry_name"]+ "%' " if obj.has_key("dns_qry_name") else qry + ""            
                qry = qry + " AND h=" + hh + " " if hh != "" else qry + ""
            except Exception, e:
                return "Bad request", 400
        qry = qry + " LIMIT 250 "    
    res = ExecuteReader(qry)   
    if isinstance(res[1], (int, long)):
        return res
    else: 
        ian = IanaCodesReplace(res[1])
        return jsonify({'headers':res[0] , 'data':ian}) 
 


@blueprint.route('/dns/details/visual/<date>', methods=['POST'])  
def get_dns_details_visual(date=None):  
    configData=current_app.config["API"]     
    date = date if date != None else configData['DEFAULT_DATE']   
    try:  
        if int(date):
            yy = date[0:4]
            mm = date[4:6]
            dd = date[6:8]
    except ValueError:        
        return "Unexpected date format", 400
    else:  
        qry = "SELECT ip_dst, dns_qry_name, dns_a FROM (SELECT susp.ip_dst, susp.dns_qry_name, susp.dns_a FROM " + configData["DATABASE"] + ".dns as susp " 
        qry = qry + " WHERE susp.y=" + yy + " AND susp.m=" + mm + " AND susp.d=" + dd + " "

        if request.method == 'POST' and request.headers['Content-Type'] == CONTENT_TYPE:
            try:
                obj = json.loads(request.data)  
                qry = qry + " AND susp.ip_dst='" + obj["ip_dst"]+ "' " if obj.has_key("ip_dst") else qry + ""    
            except Exception, e:
                return "Bad request", 400 
            else:
                qry=qry + ") AS tmp GROUP BY dns_qry_name, dns_a, ip_dst"   
                res = ExecuteReader(qry)   
                if isinstance(res[1], (int, long)):
                    return res
                else:
                    ian = IanaCodesReplace(res[1])
                    return jsonify({'headers':res[0] , 'data':ian}) 
        else:
            return "Bad request", 400 
  

@blueprint.route('/dns/edge/<date>', methods=['POST']) 
def get_edge_investigation(date=None):  
    configData=current_app.config["API"]  
    date = date if date != None else configData['DEFAULT_DATE']
    try:  
        if int(date):
            yy = date[0:4]
            mm = date[4:6]
            dd = date[6:8]
    except ValueError:        
        return "Unexpected date format", 400
    else:       
        if request.method == 'POST' and request.headers['Content-Type'] == CONTENT_TYPE:
            try:  
               obj = json.loads(request.data)    
               qry = "SELECT DISTINCT (susp."+ obj["filter"] +") FROM " + configData["DATABASE"] + ".dns_susp as susp "
               if obj["filter"]=="ip_dst":
                    qry = qry + " LEFT JOIN " + configData["DATABASE"] + ".dns_scores as scores ON scores.ip_dst = susp.ip_dst"
                    qry = qry + " WHERE scores.ip_dst IS NULL AND susp.y=" + yy + " AND susp.m=" + mm + " AND susp.d=" + dd + "  "    
               elif obj["filter"]=="dns_qry_name":
                    qry = qry + " LEFT JOIN " + configData["DATABASE"] + ".dns_scores as scores ON scores.dns_qry_name = susp.dns_qry_name "
                    qry = qry + " WHERE scores.dns_qry_name IS NULL AND susp.y=" + yy + " AND susp.m=" + mm + " AND susp.d=" + dd + "  "   
            except Exception, e:
                return "Bad request", 400   
            else:
                res = ExecuteReader(qry)   
                if isinstance(res[1], (int, long)):
                    return res
                else:
                    return jsonify({'headers':res[0] , 'data':res[1] })        
     
 
@blueprint.route('/dns/threat_investigation/<date>', methods=['GET']) 
def get_threat_investigation(date=None):  
    configData=current_app.config["API"]     
    date = date if date != None else configData['DEFAULT_DATE']
    try:  
        if int(date):
            yy = date[0:4]
            mm = date[4:6]
            dd = date[6:8]
    except ValueError:        
        return "Unexpected date format", 400
    else: 
        qry = " SELECT DISTINCT(score.ip_dst), ip_sev, 0 AS dns_sev FROM {0}.dns_scores AS score\
                LEFT JOIN {0}.dns_comments AS com ON score.ip_dst=com.ip_dst AND com.y={1} AND com.m={2} AND com.d={3}\
                WHERE com.ip_dst IS NULL AND ip_sev=1 AND score.y={1} AND score.m={2} AND score.d={3}\
                UNION\
                SELECT DISTINCT(score.dns_qry_name), 0 AS ip_sev, dns_sev FROM {0}.dns_scores AS score\
                LEFT JOIN {0}.dns_comments AS com ON score.dns_qry_name=com.dns_qry_name AND com.y={1} AND com.m={2} AND com.d={3}\
                WHERE com.dns_qry_name IS NULL AND dns_sev=1 AND score.y={1} AND score.m={2} AND score.d={3}".format(configData["DATABASE"], yy, mm, dd)
        res = ExecuteReader(qry)   
        if isinstance(res[1], (int, long)):
            return res
        else:  
            return jsonify({'headers':res[0] , 'data':res[1] })


@blueprint.route('/dns/threat_investigation/comments/<date>', methods=['GET', 'POST']) 
def get_threat_investigation_comments(date=None):  
    configData=current_app.config["API"]     
    date = date if date != None else configData['DEFAULT_DATE'] 
    try:  
        if int(date):
            yy = date[0:4]
            mm = date[4:6]
            dd = date[6:8]
    except ValueError:        
        return "Unexpected date format", 400
    else:       
        if request.method == 'GET': 
            qry = "SELECT ip_dst, dns_qry_name, title, summary FROM {0}.dns_comments WHERE y={1} AND m={2} AND d={3} ".format(configData["DATABASE"], yy, mm, dd)
            res = ExecuteReader(qry)
            if isinstance(res[1], (int, long)):
                return res
            else:  
                return jsonify({'headers':res[0] , 'data':res[1] })
            return jsonify({'data':data})
        if request.method == 'POST':
            obj = json.loads(request.data) 
            engine = configData["DBENGINE"]
            if obj.has_key("data"):
                document = obj["data"]
                load_to_hadoop_script ="hive -e \"LOAD DATA LOCAL INPATH '{0}' INTO TABLE {1}.dns_comments;\"".format(document, configData["DATABASE"]) 
                print load_to_hadoop_script
                subprocess.call(load_to_hadoop_script,shell=True)    
                if engine == "Impala": 
                    invalidate_metadata()
                return "Success", 200
            else:
                return "Bad request", 400


@blueprint.route('/dns/threat_investigation/visual/<date>', methods=['POST']) 
def get_threat_investigation_visual(date=None):  
    configData=current_app.config["API"]     
    date = date if date != None else configData['DEFAULT_DATE'] 
    try:  
        if int(date):
            yy = date[0:4]
            mm = date[4:6]
            dd = date[6:8]
    except ValueError:        
        return "Unexpected date format", 400
    else:        
        if request.method == 'POST' and request.headers['Content-Type'] == CONTENT_TYPE:
            try:  
                obj = json.loads(request.data)   
                if obj.has_key("dns_qry_name"):
                    qry = "SELECT COUNT(s.ip_dst) as total, s.dns_qry_name, s.ip_dst, ISNULL(sc.ip_sev,0) as sev FROM {0}.dns_susp as s\
                            LEFT JOIN {0}.dns_scores as sc ON sc.ip_dst = s.ip_dst AND sc.y={2} AND sc.m={3} AND sc.d={4}\
                            WHERE s.y={2} AND s.m={3} AND s.d={4} AND s.dns_qry_name='{1}' GROUP BY s.ip_dst, s.dns_qry_name, sc.ip_sev\
                            ORDER BY sev DESC".format(configData["DATABASE"], obj["dns_qry_name"], yy,mm,dd)
                    res = ExecuteReader(qry)   
                elif obj.has_key("ip_dst"):
                    qry ="SELECT COUNT(s.dns_qry_name) as total, s.dns_qry_name, s.ip_dst, ISNULL(sc.dns_sev,0) as sev FROM {0}.dns_susp as s\
                            LEFT JOIN {0}.dns_scores as sc ON sc.dns_qry_name = s.dns_qry_name AND sc.y={2} AND sc.m={3} AND sc.d={4}\
                            WHERE s.y={2} AND s.m={3} AND s.d={4} AND s.ip_dst='{1}' GROUP BY s.dns_qry_name, s.ip_dst, sc.dns_sev\
                            ORDER BY sev DESC".format(configData["DATABASE"], obj["ip_dst"], yy,mm,dd)
                    res = ExecuteReader(qry)   
                else:
                    return "Unexpected parameters", 400
                if isinstance(res[1], (int, long)):
                    return res
                else:   
                    return jsonify({'headers':res[0] , 'data':res[1] })
            except Exception, e: 
                return "Unexpected parameters",  400
        else:
            return "Bad Request",  400
                

# @blueprint.route('/config', methods=['GET']) 
# def get_config_data():  
#     configData=current_app.config["API"]  
#     if configData != "":
#         return jsonify({'config':configData})


@blueprint.route('/dns/scoring', methods=['POST']) 
def insert_scores_file():  
    obj = json.loads(request.data) 
    configData = current_app.config["API"]   
    engine = configData["DBENGINE"]
    if obj.has_key("data") and obj.has_key("date"):
        document = obj["data"]
    	year = obj["date"][0:4]
    	month = obj["date"][4:6]
    	day = obj["date"][6:8]
        database = configData["DATABASE"] 
    try:
        clear_staging_files ="hadoop fs -rm -R -skipTrash '/user/duxbury/dns/scores/stage/*'"
        subprocess.call(clear_staging_files, shell=True)         
        load_to_hadoop_script ="hive -e \"LOAD DATA LOCAL INPATH '{0}' INTO TABLE {1}.dns_scores_tmp;\"".format(document, configData["DATABASE"]) 
        subprocess.call(load_to_hadoop_script, shell=True)	
        load_to_avro = " hive -e \"INSERT INTO TABLE {3}.dns_scores PARTITION (y={0}, m={1}, d={2}) SELECT d.ip_dst, d.dns_qry_name, d.ip_sev, d.dns_sev, d.mod_date, d.mod_user FROM {3}.dns_scores_tmp d;\"".format(year,month,day, database)
        subprocess.call(load_to_avro,shell=True)
        if engine == "Impala": 
            invalidate_metadata()
    except Exception, e:
        return "Internal server error", 500
    else:
        return "No Content", 204


### FUNCTIONS
#############
def ExecuteReader(query=None):
    """Executes a given query selecting the engine and db configured in config.json"""
    configData=current_app.config["API"]    
    engine = configData["DBENGINE"]    
    dbhost = configData[engine]["DB_HOST"]
    dbport = int(configData[engine]["PORT"])
    dbname = configData["DATABASE"]
    dbauth = configData[engine]["AUTH_MECHANISM"]
    dbuser = configData[engine]["LDAP_USER"] 
    if engine == "Impala": 
        try:  
            conn=connect(host=dbhost, port=dbport, database=dbname, auth_mechanism=dbauth, user=dbuser)
            cur=conn.cursor()     
            cur.execute(query)
        except Exception, e:
           return "Error trying to connect to db", 500 
        else:  
            headers={row[0]:row[0] for row in cur.description}
            data=[dict((cur.description[i][0],value) \
                     for i, value in enumerate(row)) for row in cur.fetchall()]
            cur.close()
            conn.close()
            return headers, data 

    elif engine == "Hive":
        try:
            conn = hive.Connection(host=dbhost, port=dbport, database=dbname, username=dbuser)
            cur = conn.cursor()   
            cur.execute(query)
        except Exception, e:
           return "Error trying to connect to db", 500 
        else:   
            headers={row[0]:row[0] for row in cur.description}
             
            data=[dict((cur.description[i][0],value) \
                     for i, value in enumerate(row)) for row in cur.fetchall()]
             
            cur.close()
            conn.close()
            return headers, data  
          

def ExecuteNonReader(query=None):
    """Executes a given query selecting the engine and db configured in config.json"""
    configData=current_app.config["API"]    
    engine = configData["DBENGINE"]
    dbhost = configData[engine]["DB_HOST"]
    dbport = int(configData[engine]["PORT"])
    dbname = configData["DATABASE"]
    dbauth = configData[engine]["AUTH_MECHANISM"]
    dbuser = configData[engine]["LDAP_USER"]
    result = "" 
    if engine == "Impala": 
        try: 
            conn=connect(host=dbhost, port=dbport, database=dbname, auth_mechanism=dbauth, user=dbuser)
            cur=conn.cursor()
            cur.execute(query)
        except Exception, e:
           return "Error trying to connect to db", 500 
        else:  
            result=True
    elif engine == "Hive":
        try:
            conn = hive.Connection(host=dbhost, port=dbport, database=dbname, username=dbuser)
            cur = conn.cursor()
            cur.execute(query)
        except Exception, e:
           return "Error trying to connect to db", 500 
        else:    
            result=True
    cur.close()
    conn.close()
    return result 
        
                                                      

def IanaCodesReplace(jsonData):
    conf = current_app.config["API"]     
    iana = iana_transform.IanaTransform(conf["IANA"]) 

    for datadict in jsonData:
        for key, value in datadict.items():
            if key == "dns_qry_class" or key == "dns_qry_rcode" or key == "dns_qry_type":
                datadict[key] = iana.get_name(str(value),key)  
    return jsonData


def invalidate_metadata():      
    configData=current_app.config["API"]   
    engine = configData["DBENGINE"]
    try:
        impala_script ="impala-shell -i '{0}' -q 'invalidate metadata;'".format(configData[engine]["DB_HOST"])
        subprocess.call(impala_script,shell=True)   
    except Exception, e:
        return "Internal server error", 500
    else:
        return "No Content", 204
  