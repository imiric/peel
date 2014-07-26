from tastypie.resources import ModelResource
from tastypie.authorization import Authorization

from peel.models import Article


class ArticleResource(ModelResource):
    def dehydrate_tags(self, bundle):
        # Needed to properly serialize tags into a valid JSON list of strings.
        return bundle.obj.tags

    def build_filters(self, filters=None):
        """
        Add support for exclude filtering
        See https://github.com/toastdriven/django-tastypie/issues/524
        """
        if not filters:
            return filters

        applicable_filters = {}

        # Separate out normal filters and the __ne operations.
        # Normal filtering
        filter_params = dict([(x, filters[x]) for x in filter(lambda x: not x.endswith('__ne'), filters)])
        applicable_filters['filter'] = super(type(self), self).build_filters(filter_params)

        # Exclude filtering
        exclude_params = dict([(x[:-4], filters[x]) for x in filter(lambda x: x.endswith('__ne'), filters)])
        applicable_filters['exclude'] = super(type(self), self).build_filters(exclude_params)

        return applicable_filters

    def apply_filters(self, request, applicable_filters):
        """
        Add support for exclude filtering
        See https://github.com/toastdriven/django-tastypie/issues/524
        """
        objects = self.get_object_list(request)

        # Distinguish between normal filters and exclude filters
        f = applicable_filters.get('filter')
        if f:
            objects = objects.filter(**f)
        e = applicable_filters.get('exclude')
        if e:
            for exclusion_filter, value in e.items():
                objects = objects.exclude(**{exclusion_filter: value})
        return objects

    class Meta:
        queryset = Article.objects.all()
        ordering = ['created_at', 'updated_at']
        filtering = {
            'status': ('exact', 'ne'),
            'created_at': ('lt', 'gt'),
            'updated_at': ('lt', 'gt'),
        }
        authorization = Authorization()
        always_return_data = True
