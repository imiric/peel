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
        <div className="date">{this.props.created_at.toUTCString()}</div>
        <p className="article-body">{this.props.content}</p>
      </div>
    );
  }
});

var ArticleList = React.createClass({
  render: function() {
    var articles = [];
    this.props.articles.forEach(function(article) {
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

var ARTICLES = [
  {title: 'My first post', content: 'Well this is cool.', tags: ['dumb', 'funny'], created_at: new Date('2014-07-01T08:24:39.184')},
  {title: 'Another post', content: 'Radical!', tags: ['sweet'], created_at: new Date('2014-07-13T18:21:13.591')},
  {title: 'And yet another', content: 'Cowabunga!', tags: [], created_at: new Date('2014-06-26T13:51:50.417')},
];

React.renderComponent(<ArticleList articles={ARTICLES} />, document.getElementById("content"));
