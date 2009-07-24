#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import cgi
import os
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db

class Tag(db.Model):
  creator = db.UserProperty(auto_current_user_add=True)
  creation = db.DateTimeProperty(auto_now_add=True)
  name = db.StringProperty(multiline=False)
  
class Permission(db.Model):
  creation = db.DateTimeProperty(auto_now_add=True)
  target = db.UserProperty()
  tag = db.ReferenceProperty(Tag)

class Task(db.Model):
  creator = db.UserProperty(auto_current_user_add=True)
  creation = db.DateTimeProperty(auto_now_add=True)
  modifier = db.UserProperty(auto_current_user=True)
  modification = db.DateTimeProperty(auto_now=True)
  priority = db.FloatProperty()
  title = db.StringProperty(multiline=False)
  description = db.StringProperty(multiline=True)
  due_date = db.DateTimeProperty()
  expectedTimeSpan = db.TimeProperty()
  is_done = db.BooleanProperty()
  tag = db.ReferenceProperty(Tag)

class MainPage(webapp.RequestHandler):
  def get(self):
    self.redirect('gadget');

class Gadget(webapp.RequestHandler):
  def get(self):
    user = users.get_current_user()
    tasks_query = Task.all().filter("creator =", user).order('priority')
    tasks = tasks_query.fetch(1000)
    if len(tasks) == 0:
      task = Task()
      task.title = ''
      task.priority = 1.
      task.put()
      tasks = [ task ]

    if user:
      url = users.create_logout_url(self.request.uri)
      url_linktext = 'Logout'
    else:
      url = users.create_login_url(self.request.uri)
      url_linktext = 'Login'

    template_values = {
      'tasks': tasks,
      'url': url,
      'url_linktext': url_linktext
      }

    path = os.path.join(os.path.dirname(__file__), 'gadget.html')
    self.response.out.write(template.render(path, template_values))

class GadgetXML(webapp.RequestHandler):
  def get(self):
    template_values = {}
    path = os.path.join(os.path.dirname(__file__), 'gadget.xml')
    self.response.out.write(template.render(path, template_values))

class Insert(webapp.RequestHandler):
  def post(self):
    priority = float(self.request.get('priority'))
    if priority == -1.:
		priority = Task.all().order('priority').get().priority + 1.
    task = Task()
    task.title = self.request.get('title')
    task.priority = priority
    task.put()
    self.response.out.write('{"key":' + str(task.key().id()) + ',"priority":' + str(priority) + '}')

class Update(webapp.RequestHandler):
  def post(self):
    key = int(self.request.get('key'))
    task = Task.get_by_id(key)
    task.title = self.request.get('title')
    task.put()
    self.response.out.write('0')

class Delete(webapp.RequestHandler):
  def post(self):
    key = int(self.request.get('key'))
    task = Task.get_by_id(key)
    task.delete()
    self.response.out.write('0')

application = webapp.WSGIApplication(
                                     [('/', MainPage),
                                      ('/gadget', Gadget),
                                      ('/gadget.xml', GadgetXML),
                                      ('/insert', Insert),
                                      ('/delete', Delete),
                                      ('/update', Update)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
