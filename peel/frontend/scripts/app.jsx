/** @jsx React.DOM */

var Article = React.createClass({
  render: function() {
    var tags = [];
    this.props.tags.forEach(function(tag) {
      tags.push(<li><a href="#">{tag}</a></li>);
    });
    return (
      <div className="article">
        <div className="date pull-right">{this.props.created_at}</div>
        <h3 className="title"><span className="highlight">{this.props.title}</span><ul className="tags">{tags}</ul></h3>
        <p className="article-body"><span className="highlight">{this.props.content}</span></p>
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

React.renderComponent(<ArticleList source="/api/v1/article/" />, document.getElementById("articles"));
