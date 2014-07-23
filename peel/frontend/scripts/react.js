/** @jsx React.DOM */

var EventHandlerMixin = {
  getInitialState: function() {
    var state = {},
        fn = this.props.fieldName;
    state[fn] = this.props[fn];
    return state;
  },

  componentDidUpdate: function() {
    var node = this.getDOMNode(),
        fn = this.props.fieldName,
        data = {};
    $(node).hallo({editable: false});
    data[fn] = this.state[fn];
    this.props.updateArticle(data, true);
  },

  onBlur: function(event) {
    var html = this.getDOMNode().innerHTML,
        fn = this.props.fieldName,
        state = {};
    state[fn] = html;
    this.setState(state);
  },

  onMouseDown: function(event) {
    if (event.ctrlKey) {
      $(this.getDOMNode()).hallo({editable: true});
    }
  },
};

var ArticleTitle = React.createClass({
  mixins: [EventHandlerMixin],
  render: function() {
    return (
      <span onBlur={this.onBlur} onMouseDown={this.onMouseDown}
        dangerouslySetInnerHTML={{__html: this.state['title']}} />
    );
  }
})

var ArticleBody = React.createClass({
  mixins: [EventHandlerMixin],
  render: function() {
    return (
      <p className="article-body" onBlur={this.onBlur} onMouseDown={this.onMouseDown}
        dangerouslySetInnerHTML={{__html: this.state['content']}} />
    );
  }
});

var Article = React.createClass({
  updateArticle: function(data, partial) {
    var url = '/api/v1/article/' + this.props.id + '/';
    // PATCH is forbidden on GAE, so use POST and a special header so
    // Tastypie will interpret it as a partial update.
    $.ajax({
      url: url,
      type: 'POST',
      accepts: 'application/json',
      contentType: 'application/json',
      headers: partial ? {'X-HTTP-Method-Override': 'PATCH'} : {},
      data: JSON.stringify(data)
    });
  },

  render: function() {
    var tags = [];
    this.props.tags.forEach(function(tag) {
      tags.push(<li><a href="#">{tag}</a></li>);
    });
    return (
      <div className="article">
        <div className="date pull-right">{this.props.created_at}</div>
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
  getInitialState: function() {
    return {articles: []};
  },

  componentDidMount: function() {
    $.get(this.props.source, function(result) {
      if (this.isMounted()) {
        this.setState({articles: result.objects});
      }
    }.bind(this));
  },

  render: function() {
    var articles = [];
    this.state.articles.forEach(function(article) {
      articles.push(<Article id={article.id} title={article.title}
                    content={article.content} tags={article.tags}
                    created_at={article.created_at} />);
    });
    return (
      <div>
        {articles}
      </div>
    );
  }
});

React.renderComponent(<ArticleList source="/api/v1/article/" />, document.getElementById("articles"));
