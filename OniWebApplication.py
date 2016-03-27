#!/usr/bin/python
from IPython.html.notebookapp import NotebookApp
from IPython.terminal.ipapp import TerminalIPythonApp
import tornado.web
import tornado.wsgi

import oni_wsgi

class OniNotebookApp(NotebookApp):
  def init_webapp(self, *args, **kwargs):
    super(OniNotebookApp, self).init_webapp(*args, **kwargs)

    oni_wsgi_container = tornado.wsgi.WSGIContainer(
      oni_wsgi.app
    )

    self.web_app.add_handlers('.*$', (
      (r'/app/.*', tornado.web.FallbackHandler, {'fallback':oni_wsgi_container}),
    ))

class OniIPythonApp(TerminalIPythonApp):
  def __init__(self, *argv, **kwargs):
    super(OniIPythonApp, self).__init__(*argv, **kwargs)

    self.subcommands['oninotebook'] = ('OniWebApplication.OniNotebookApp', 'Launch the ONI IPython HTML Notebook Server.')

launch_new_instance = OniIPythonApp.launch_instance

if __name__ == '__main__':
  launch_new_instance()
