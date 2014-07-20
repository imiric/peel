from django.conf.urls import *
from django.contrib import admin
import dbindexer

from tastypie.api import Api
from peel.api import ArticleResource

admin.autodiscover()
dbindexer.autodiscover()
api = Api()
api.register(ArticleResource())

urlpatterns = patterns('',
    ('^admin/', include(admin.site.urls)),
    ('', include('peel.urls')),
    (r'^api/', include(api.urls)),
)
