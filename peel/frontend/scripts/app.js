/** @jsx React.DOM */

var Article = React.createClass({displayName: 'Article',
  render: function() {
    var tags = [];
    this.props.tags.forEach(function(tag) {
      tags.push(React.DOM.span( {className:"badge"}, tag));
    });
    return (
      React.DOM.div( {className:"article"}, 
        React.DOM.h3( {className:"title"}, this.props.title),
        React.DOM.div( {className:"tags"}, tags),
        React.DOM.div( {className:"date"}, this.props.created_at.toUTCString()),
        React.DOM.p( {className:"article-body"}, this.props.content)
      )
    );
  }
});

var ArticleList = React.createClass({displayName: 'ArticleList',
  render: function() {
    var articles = [];
    this.props.articles.forEach(function(article) {
      articles.push(Article( {title:article.title, content:article.content,
                    tags:article.tags, created_at:article.created_at} ));
    });
    return (
      React.DOM.div(null, 
        articles
      )
    );
  }
});

var ARTICLES = [
  {title: 'My first post', content: 'Well this is cool.', tags: ['dumb', 'funny'], created_at: new Date('2014-07-01T08:24:39.184')},
  {title: 'Another post', content: 'Radical!', tags: ['sweet'], created_at: new Date('2014-07-13T18:21:13.591')},
  {title: 'And yet another', content: 'Cowabunga!', tags: [], created_at: new Date('2014-06-26T13:51:50.417')},
];

React.renderComponent(ArticleList( {articles:ARTICLES} ), document.getElementById("content"));
