from tastypie.resources import ModelResource
from tastypie.authorization import Authorization

from peel.models import Article


class ArticleResource(ModelResource):
    def dehydrate_tags(self, bundle):
        # Needed to properly serialize tags into a valid JSON list of strings.
        return bundle.obj.tags

    class Meta:
        queryset = Article.objects.all()
        authorization = Authorization()
