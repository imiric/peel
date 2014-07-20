from tastypie.resources import ModelResource

from peel.models import Article


class ArticleResource(ModelResource):
    class Meta:
        queryset = Article.objects.all()
