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

class Task(db.Model):
  creator = db.UserProperty(auto_current_user_add=True)
  creation = db.DateTimeProperty(auto_now_add=True)
  modifier = db.UserProperty(auto_current_user=True)
  modification = db.DateTimeProperty(auto_now=True)
  identity = db.IntegerProperty()
  version = db.IntegerProperty()
  priority = db.IntegerProperty()
  title = db.StringProperty(multiline=False)
  description = db.StringProperty(multiline=True)
  group = db.SelfReferenceProperty()
  due_date = db.DateTimeProperty()
  expectedTimeSpan = db.TimeProperty()
  is_done = db.BooleanProperty()

class MainPage(webapp.RequestHandler):
  def get(self):
    tasks_query = Task.all().order('priority')
    tasks = tasks_query.fetch(10)

    if users.get_current_user():
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

    path = os.path.join(os.path.dirname(__file__), 'index.html')
    self.response.out.write(template.render(path, template_values))

class Insert(webapp.RequestHandler):
  def post(self):
    task = Task()
    task.title = self.request.get('title')
    task.put()
    self.response.out.write('0')

class Update(webapp.RequestHandler):
  def post(self):
    key = int(self.request.get('key'))
    task = Task.get_by_id(key)
    task.title = self.request.get('title')
    task.put()
    self.response.out.write('0')

application = webapp.WSGIApplication(
                                     [('/', MainPage),
                                      ('/insert', Insert),
                                      ('/update', Update)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
