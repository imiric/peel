/** @jsx React.DOM */

var EventHandlerMixin = {
  onBlur: function(event) {
    var html = this.getDOMNode().innerHTML,
        fn = this.props.fieldName,
        data = {};
    $(this.getDOMNode()).hallo({editable: false});
    data[fn] = html;
    this.props.updateArticle(data, true);
  },

  onMouseDown: function(event) {
    if (event.ctrlKey) {
      var node = $(this.getDOMNode()),
          innerNode = node.children(':first');
      if (innerNode.hasClass('placeholder')) {
        innerNode.html('');
      }
      node.hallo({editable: true});
    }
  },
};

var ArticleTitle = React.createClass({
  mixins: [EventHandlerMixin],

  componentDidMount: function() {
    $(this.getDOMNode()).on('hallomodified', this.onHalloModified);
  },

  onHalloModified: function(event) {
    var node = this.getDOMNode();
    // TODO: Figure out a better workaround to avoid rich formatting.
    node.innerHTML = node.innerText;
  },

  render: function() {
    var title = this.props.title || '<i class="placeholder">Add title</i>';
    return (
      <span onBlur={this.onBlur} onMouseDown={this.onMouseDown}
        dangerouslySetInnerHTML={{__html: title}} />
    );
  }
})

var ArticleBody = React.createClass({
  mixins: [EventHandlerMixin],
  render: function() {
    var body = this.props.content || '<i class="placeholder">Add body</i>';
    return (
      <div className="article-body" onBlur={this.onBlur} onMouseDown={this.onMouseDown}
        dangerouslySetInnerHTML={{__html: body}} />
    );
  }
});

var Article = React.createClass({
  getDefaultProps: function() {
    return {id: '', title: '', content: '', tags: [], created_at: '', updated_at: ''};
  },

  updateArticle: function(data, partial) {
    var url = '/api/v1/article/',
        reqOpts = {
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
          dataType: 'json'
        };

    var id = this.props.id;

    if (id) {
      // The article already exists, so just update it.
      url = url + id + '/';
      // PATCH is forbidden on GAE, so use POST and a special header so
      // Tastypie will interpret it as a partial update.
      reqOpts.headers = partial ? {'X-HTTP-Method-Override': 'PATCH'} : {};
    }

    reqOpts.url = url;

    $.ajax(reqOpts)
      .done(function(response) {
        response.key = id;
        this.props.updateArticleState(response);
      }.bind(this));
  },

  render: function() {
    var tags = [];
    this.props.tags.forEach(function(tag) {
      tags.push(<li><a href="#">{tag}</a></li>);
    });
    return (
      <div className="article">
        <div className="date pull-right" title={this.props.updated_at}>{this.props.created_at}</div>
        <h3 className="title">
          <ArticleTitle updateArticle={this.updateArticle} fieldName="title" title={this.props.title} />
          <ul className="tags">{tags}</ul>
        </h3>
        <ArticleBody updateArticle={this.updateArticle} fieldName="content" content={this.props.content} />
      </div>
    );
  }
});

var ArticleList = React.createClass({
  render: function() {
    var articles = this.props.articles.map(function(article, i) {
      return <Article key={article.id} id={article.id} title={article.title}
                    content={article.content} tags={article.tags}
                    created_at={article.created_at}
                    updated_at={article.updated_at}
                    updateArticleState={this.props.updateArticleState}
                  />;
    }.bind(this));
    return <div id="articles">{articles}</div>;
  }
});

var AddArticleButton = React.createClass({
  componentDidMount: function() {
    $(this.getDOMNode()).tooltip();
  },

  onClick: function() {
    this.props.updateArticleState({});
  },

  render: function() {
    return (
      <button type="button" className="btn btn-primary" onClick={this.onClick}
          data-toggle="tooltip" data-placement="top" title="Add a new article">
        <span className="glyphicon glyphicon-plus"></span>
      </button>
    );
  }
});

var Content = React.createClass({
  getInitialState: function() {
    return {articles: []};
  },

  componentDidMount: function() {
    $.get(this.props.articleSource, function(result) {
      this.setState({articles: result.objects});
    }.bind(this));
  },

  /**
   * Update an article that already exists in the backend.
   */
  updateExistingArticle: function(articles, articleData) {
    for (var i=0; i < articles.length; i++) {
      if (articleData.key == articles[i].id) {
        articles[i] = articleData;
        break;
      }
    }
  },

  /**
   * Update or create a placeholder article.
   */
  updatePlaceholderArticle: function(articles, articleData) {
    if ($.isEmptyObject(articleData)) {
      if (articles[0] !== undefined && $.isEmptyObject(articles[0])) {
        return;
      }
      // Add a new placeholder article
      articles.splice(0, 0, articleData);
    } else {
      if ($.isEmptyObject(articles[0])) {
        // Update an existing placeholder article
        articles[0] = articleData;
      }
    }
  },

  updateArticleState: function(data) {
    if (this.isMounted()) {
      var articles = this.state.articles;
      if (data.key) {
        this.updateExistingArticle(articles, data);
      } else {
        this.updatePlaceholderArticle(articles, data);
      }
      this.setState({articles: articles})
    }
  },

  render: function() {
    return (
      <div>
        <div className="row" data-js="header">
          <div className="col-lg-12 text-center">
            <AddArticleButton updateArticleState={this.updateArticleState} />
          </div>
        </div>
        <ArticleList articles={this.state.articles} updateArticleState={this.updateArticleState} />
      </div>
    );
  }
});

React.renderComponent(<Content articleSource="/api/v1/article" />, document.getElementById('content'));
