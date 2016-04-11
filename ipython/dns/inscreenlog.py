import datetime

def info(message):
    date = str(datetime.datetime.now())
    print "[{0} INFO]: {1}".format(date, message)

def error(message):
    date = str(datetime.datetime.now())
    print "[{0} ERROR]: {1}".format(date, message)

def process(message):
    print "::::::::::::: {0} :::::::::::::".format(message)
