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
        data = {id: this.props.id};
    if (value) {
      if (fn == 'tag') {
        var valExists = $.inArray(value, this.props.tags) > -1;
        if (valExists) {
          // Don't add an already existing tag
          if (this.props.tag) {
            node.text(this.props.tag);
          } else {
            this.showPlaceholder();
          }
          return;
        }
        value = this.props.updateTagState(value, this.props.tag);
        fn = 'tags'
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
  deleteTag: function(e) {
    var tag = $(e.target).siblings('a').text(),
        updatedTags = this.updateTagState(tag, null, true);

    this.props.updateArticle({id: this.props.id, tags: updatedTags}, true);
  },

  /**
   * Adds, edits or removes tags from the current state.
   * It doesn't modify the current state, just returns a modified copy of it.
   *
   * TODO: Split this into several functions? Initially it made sense to keep
   * this logic centralized, but I'm not so convinced.
   *
   * @param {String} newTag - The tag to add or delete.
   * @param {String} targetTag - The tag that was clicked on, if any.
   * @param {boolean} del - Whether to delete the tag or not.
   * @return {Array} An array of tags representing the updated state.
   */
  updateTagState: function(newTag, targetTag, del) {
    del = del === undefined ? false : del;
    if (!targetTag) {
      targetTag = newTag;
    }
    var tags = this.props.tags.slice(),
        tagExists = $.inArray(newTag, tags) > -1,
        targetIdx = $.inArray(targetTag, tags),
        spliceArgs = [targetIdx > -1 ? targetIdx : tags.length, targetIdx > -1 ? 1 : 0];

    if (!del) {
      spliceArgs.push(newTag);
    }

    Array.prototype.splice.apply(tags, spliceArgs);
    return tags;
  },

  render: function() {
    var tags = this.props.tags.concat('');
    tags = tags.map(function(tag) {
      return (
        <li key={tag ? tag : Math.random()} className={tag ? '' : 'placeholder'}>
          <span onClick={this.deleteTag} className='glyphicon glyphicon-remove-circle delete-tag'></span>
          <a href="#">
            <ArticleTag tag={tag} id={this.props.id}
              updateArticle={this.props.updateArticle}
              updateTagState={this.updateTagState}
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
        <span className={updatedObj ? 'changed' : ''} title={created.local().format()}>{created.fromNow()}</span>
        {updatedObj}
      </div>
    );
  }
});

var ArticleSettings = React.createClass({
  getDefaultProps: function() {
    return {status: 1};
  },

  componentDidMount: function() {
    $(this.getDOMNode()).find('[data-toggle="tooltip"]').tooltip();
  },

  tooltipText: function(stat) {
    var texts = {
      1: 'Unpublished',
      2: 'Published',
      3: 'Deleted'
    }
    return texts[stat] || 'Delete?';
  },

  /**
   * Updates the tooltip in-place.
   */
  setTooltipText: function(stat) {
    var className = (stat == 1 || stat == 2) ? '.published' : '.delete',
        node = $(this.getDOMNode()).find(className),
        newText = this.tooltipText(stat);
    node.tooltip('fixTitle')
        .data('bs.tooltip')
        .$tip.find('.tooltip-inner')
        .text(newText);
  },

  setArticleStatus: function(e) {
    e.stopPropagation();
    var published = $(e.target).closest('.published'),
        newStatus = published.length ? (this.props.status == 1 ? 2 : 1) : 3;
    if (newStatus == this.props.status) {
      return;
    }

    var update = function() {
        this.props.updateArticle({id: this.props.id, status: newStatus}, true);
    }.bind(this);

    this.setTooltipText(newStatus);
    if (newStatus === 3) {
      $(this.getDOMNode()).closest('.article-wrapper').addClass('deleted');
      setTimeout(update, 1000);
    } else {
      update();
    }
    return false;
  },

  render: function() {
    var style = {display: 'none'};
    return (
    <div className='article-settings' style={this.props.id ? {} : style}>
      <a className='published' data-original-title={this.tooltipText(this.props.status == 1 ? 1 : 2)}
          data-toggle='tooltip' data-placement='right' onClick={this.setArticleStatus} href='#'>
        <span className={'glyphicon glyphicon-eye-' + (this.props.status == 1 ? 'close' : 'open')}></span>
      </a>
      <a className='delete' data-original-title={this.tooltipText(this.props.status == 3 ? 3 : 4)}
          data-toggle='tooltip' data-placement='right' onClick={this.setArticleStatus} href='#'>
        <span className='glyphicon glyphicon-remove-circle'></span>
      </a>
    </div>
    );
  }
});

var Article = React.createClass({
  getDefaultProps: function() {
    return {id: '', title: '', body: '', status: 1, tags: [], created_at: '', updated_at: ''};
  },

  render: function() {
    var tags = [];
    this.props.tags.forEach(function(tag) {
      tags.push(<li><a href="#">{tag}</a></li>);
    });
    return (
      <div className='article'>
        <ArticleDate created_at={this.props.created_at} updated_at={this.props.updated_at} />
        <h3 className="title">
          <ArticleTitle id={this.props.id} updateArticle={this.props.updateArticle}
            fieldName="title" title={this.props.title} />
          <ArticleTags id={this.props.id} updateArticle={this.props.updateArticle}
            fieldName="tags" tags={this.props.tags} />
        </h3>
        <ArticleBody id={this.props.id} updateArticle={this.props.updateArticle}
          fieldName="body" body={this.props.body} />
      </div>
    );
  }
});

var ArticleWrapper = React.createClass({
  componentDidMount: function() {
    $(this.getDOMNode()).removeClass('deleted');
  },

  render: function() {
    return (
      <div className={'article-wrapper' + (this.props.id ? '' : ' deleted')}>
        {this.props.children}
      </div>
    );
  }
});

var ArticleList = React.createClass({
  updateArticle: function(data, partial) {
    var url = '/api/v1/article/',
        reqOpts = {
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json'
        };

    var id = data['id'];
    delete data['id'];

    if (id) {
      // The article already exists, so just update it.
      url = url + id + '/';
      // PATCH is forbidden on GAE, so use POST and a special header so
      // Tastypie will interpret it as a partial update.
      reqOpts.headers = partial ? {'X-HTTP-Method-Override': 'PATCH'} : {};
    }

    reqOpts.url = url;
    reqOpts.data = JSON.stringify(data),

    $.ajax(reqOpts)
      .done(function(response) {
        response.key = id;
        this.props.updateArticleState(response);
      }.bind(this));
  },

  render: function() {
    var articles = this.props.articles.map(function(article, i) {
      return (
        <ArticleWrapper key={article.id} id={article.id}>
          <Article key={article.id} id={article.id} title={article.title}
            body={article.body} tags={article.tags}
            created_at={article.created_at} updated_at={article.updated_at}
            updateArticle={this.updateArticle}
          />
          <ArticleSettings id={article.id}
            status={article.status}
            updateArticle={this.updateArticle}/>
        </ArticleWrapper>
      );
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
    var deleteIndex = -1;

    for (var i=0; i < articles.length; i++) {
      if (articleData.key == articles[i].id) {
        if (articleData.status === 3) {
          deleteIndex = i;
        } else {
          articles[i] = articleData;
        }
        break;
      }
    }

    if (deleteIndex > -1) {
      articles.splice(deleteIndex, 1);
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

var sourceUrl = '/api/v1/article/?status__in=1,2&order_by=-created_at';
React.renderComponent(<Content articleSource={sourceUrl} />, document.getElementById('content'));
