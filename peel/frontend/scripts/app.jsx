/** @jsx React.DOM */

var Article = React.createClass({
  render: function() {
    var tags = [];
    this.props.tags.forEach(function(tag) {
      tags.push(<span className="badge">{tag}</span>);
    });
    return (
      <div className="article">
        <h3 className="title">{this.props.title}</h3>
        <div className="tags">{tags}</div>
        <div className="date">{this.props.created_at}</div>
        <p className="article-body">{this.props.content}</p>
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
      articles.push(<Article title={article.title} content={article.content}
                    tags={article.tags} created_at={article.created_at} />);
    });
    return (
      <div>
        {articles}
      </div>
    );
  }
});

React.renderComponent(<ArticleList source="/api/v1/article/" />, document.getElementById("content"));
