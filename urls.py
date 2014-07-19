from django.conf.urls import *
from django.contrib import admin
import dbindexer

admin.autodiscover()
dbindexer.autodiscover()

urlpatterns = patterns('',
    ('^admin/', include(admin.site.urls)),
    ('', include('peel.urls')),
)
