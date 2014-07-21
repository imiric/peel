/** @jsx React.DOM */

var Article = React.createClass({displayName: 'Article',
  render: function() {
    var tags = [];
    this.props.tags.forEach(function(tag) {
      tags.push(React.DOM.li(null, React.DOM.a( {href:"#"}, tag)));
    });
    return (
      React.DOM.div( {className:"article"}, 
        React.DOM.div( {className:"date pull-right"}, this.props.created_at),
        React.DOM.h3( {className:"title"}, React.DOM.span( {className:"highlight"}, this.props.title),React.DOM.ul( {className:"tags"}, tags)),
        React.DOM.p( {className:"article-body"}, React.DOM.span( {className:"highlight"}, this.props.content))
      )
    );
  }
});

var ArticleList = React.createClass({displayName: 'ArticleList',
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

React.renderComponent(ArticleList( {source:"/api/v1/article/"} ), document.getElementById("articles"));
