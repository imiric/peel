/** @jsx React.DOM */

var moment = require('moment');

var EventHandlerMixin = {
  componentDidMount: function() {
    var fn = this.props.fieldName;
    if (!this.props[fn]) {
      this.showPlaceholder();
    }
    $(this.getDOMNode()).on('update-data', this.updateData);
  },

  showPlaceholder: function() {
    if (!this.isMounted()) {
      return;
    }
    var node = $(this.getDOMNode());
    node.hallo({placeholder: 'Add ' + this.props.fieldName});
    // Leave the content in editable mode, just disable it. Needed to show
    // the placeholder properly.
    node.data('IKS-hallo').disable();
  },

  updateData: function() {
    var node = $(this.getDOMNode()),
        value = node.html(),
        fn = this.props.fieldName,
        data = {};
    if (value) {
      if (fn == 'tag') {
        var tags = this.props.tags.slice(),
            valExists = $.inArray(value, tags) > -1,
            tagIdx = $.inArray(this.props.tag, tags);

        if (valExists) {
          // Don't add an already existing tag
          if (this.props.tag) {
            node.text(this.props.tag);
          } else {
            this.showPlaceholder();
          }
          return;
        }

        // Either update an existing tag or append a new one
        tags.splice(tagIdx > -1 ? tagIdx : tags.length, tagIdx > -1 ? 1 : 0, value);
        value = tags;
        fn = 'tags';
      }
      data[fn] = value;
      this.props.updateArticle(data, true);
    } else {
      this.showPlaceholder();
    }
  },

  onMouseDown: function(e) {
    var fn = this.props.fieldName,
        node = $(this.getDOMNode());
    // Allow one-click edits for placeholder items and CTRL+Click for all others
    if (e.ctrlKey || node.hasClass('inPlaceholderMode')) {
      node.hallo({editable: true});
    }
  },
};

var SafeInputMixin = {
  onKeyDown: function(e) {
    var node = $(this.getDOMNode());
    // Persist the data on Enter
    if (e.keyCode === 13) {
      if (node.text()) {
        node.hallo({editable: false});
        node.trigger('update-data');
      } else {
        return false;
      }
    } else if (e.ctrlKey && $.inArray(e.keyCode, [66, 73, 85]) > -1) {
      // Ignore Hallo shortcuts (^B, ^I, ^U)
      e.stopPropagation();
      return false;
    }
  },
};

var ArticleTitle = React.createClass({
  mixins: [EventHandlerMixin, SafeInputMixin],
  render: function() {
    return (
      <div className="inner-title" onBlur={this.onBlur} onMouseDown={this.onMouseDown}
        onKeyDown={this.onKeyDown} dangerouslySetInnerHTML={{__html: this.props.title}} />
    );
  }
});

var ArticleBody = React.createClass({
  mixins: [EventHandlerMixin],

  onKeyDown: function(e) {
    // Persist the data on CTRL+Enter
    var node = $(this.getDOMNode());
    if (e.ctrlKey && e.keyCode === 13 && node.text()) {
      node.hallo({editable: false});
      this.updateData();
    } else if (e.keyCode === 27) {
      this.showPlaceholder();
    }
  },

  render: function() {
    return (
      <div className="article-body" onBlur={this.onBlur} onMouseDown={this.onMouseDown}
        onKeyDown={this.onKeyDown} dangerouslySetInnerHTML={{__html: this.props.body}} />
    );
  }
});

var ArticleTag = React.createClass({
  mixins: [EventHandlerMixin, SafeInputMixin],
  render: function() {
      return <div onMouseDown={this.onMouseDown} onKeyDown={this.onKeyDown}>
                {this.props.tag}
             </div>;
  },
});

var ArticleTags = React.createClass({
  render: function() {
    var tags = this.props.tags.concat('');
    tags = tags.map(function(tag) {
      return (
        <li key={tag ? tag : Math.random()} className={tag ? '' : 'placeholder'}>
          <a href="#">
            <ArticleTag tag={tag} updateArticle={this.props.updateArticle}
                tags={this.props.tags} fieldName="tag"
            />
          </a>
        </li>
      );
    }.bind(this));
    return <ul className="tags">{tags}</ul>;
  }
});

var ArticleDate = React.createClass({
  componentDidMount: function() {
    setInterval(this.update, 30000);
  },

  update: function() {
    if (this.isMounted()) {
      this.forceUpdate();
    }
  },

  render: function() {
    if (!this.props.created_at) {
      return <span></span>;
    }
    var created = moment.utc(this.props.created_at),
        updated = moment.utc(this.props.updated_at),
        updatedObj = null;

    if (!created.isSame(updated, 'minute')) {
      updatedObj = (
        <small>&nbsp;
          <span className="glyphicon glyphicon-flash" title={'Updated ' + updated.fromNow()} />
        </small>
      );
    }
    return (
      <div className="date pull-right">
        <span title={created.local().format()}>{created.fromNow()}</span>
        {updatedObj}
      </div>
    );
  }
});

var Article = React.createClass({
  getDefaultProps: function() {
    return {id: '', title: '', body: '', tags: [], created_at: '', updated_at: ''};
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
        <ArticleDate created_at={this.props.created_at} updated_at={this.props.updated_at} />
        <h3 className="title">
          <ArticleTitle updateArticle={this.updateArticle} fieldName="title" title={this.props.title} />
          <ArticleTags updateArticle={this.updateArticle} fieldName="tags" tags={this.props.tags} />
        </h3>
        <ArticleBody updateArticle={this.updateArticle} fieldName="body" body={this.props.body} />
      </div>
    );
  }
});

var ArticleList = React.createClass({
  render: function() {
    var articles = this.props.articles.map(function(article, i) {
      return <Article key={article.id} id={article.id} title={article.title}
                    body={article.body} tags={article.tags}
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
