from djangoappengine.settings_base import *

import os

BASE_DIR = os.path.join(os.path.dirname(__file__), '..')

DATABASES['native'] = DATABASES['default']
DATABASES['default'] = {'ENGINE': 'dbindexer', 'TARGET': 'native'}
AUTOLOAD_SITECONF = 'indexes'
SECRET_KEY = '=r-$b*8hglm+858&9t043hlm6-&6-3d3vfc4((7yd0dbrakhvi'
ALLOWED_HOSTS = []
# XXX: For some reason this needs to be enabled, otherwise the GAE instance
# fails with 400 Bad Request. Investigate why this happens...
DEBUG = True

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.sessions',
    'djangotoolbox',
    'autoload',
    'dbindexer',
    'djangoappengine',
    'tastypie',
    'peel',
)

MIDDLEWARE_CLASSES = (
    'autoload.middleware.AutoloadMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.request',
    'django.core.context_processors.media',
)

STATIC_ROOT = os.path.join(BASE_DIR, 'static')
TEMPLATE_DIRS = (os.path.join(BASE_DIR, 'templates'),)

TEST_RUNNER = 'djangotoolbox.test.CapturingTestSuiteRunner'
ROOT_URLCONF = 'urls'
