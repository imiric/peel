from django.db import models
from django.contrib.auth.models import User
from djangotoolbox.fields import ListField

class Article(models.Model):

    EDITING   = 1
    PUBLISHED = 2
    DELETED   = 3
    STATUS_CHOICES = (
        (EDITING, 'Editing'),
        (PUBLISHED, 'Published'),
        (DELETED, 'Deleted'),
    )

    author = models.ForeignKey(User, null=True, blank=True)
    title = models.CharField(max_length=512)
    content = models.TextField()
    tags = ListField()
    status = models.IntegerField(choices=STATUS_CHOICES, default=EDITING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
