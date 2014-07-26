from tastypie.resources import ModelResource
from tastypie.authorization import Authorization

from peel.models import Article


class ArticleResource(ModelResource):
    def dehydrate_tags(self, bundle):
        # Needed to properly serialize tags into a valid JSON list of strings.
        return bundle.obj.tags

    class Meta:
        queryset = Article.objects.all()
        ordering = ['created_at', 'updated_at']
        filtering = {
            'status': ('exact', 'in'),
            'created_at': ('lt', 'gt'),
            'updated_at': ('lt', 'gt'),
        }
        authorization = Authorization()
        always_return_data = True
