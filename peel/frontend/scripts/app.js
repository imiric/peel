/** @jsx React.DOM */

var EventHandlerMixin = {
  onBlur: function(event) {
    $(this.getDOMNode()).hallo({editable: false});
  },
  onMouseDown: function(event) {
    if (event.ctrlKey) {
      $(this.getDOMNode()).hallo({editable: true});
    }
  }
};

var ArticleTitle = React.createClass({displayName: 'ArticleTitle',
  mixins: [EventHandlerMixin],
  render: function() {
    return (
      React.DOM.span( {onBlur:this.onBlur, onMouseDown:this.onMouseDown}, this.props.title)
    );
  }
})

var ArticleBody = React.createClass({displayName: 'ArticleBody',
  mixins: [EventHandlerMixin],
  render: function() {
    return (
      React.DOM.p( {className:"article-body", onBlur:this.onBlur, onMouseDown:this.onMouseDown}, this.props.content)
    );
  }
});

var Article = React.createClass({displayName: 'Article',
  render: function() {
    var tags = [];
    this.props.tags.forEach(function(tag) {
      tags.push(React.DOM.li(null, React.DOM.a( {href:"#"}, tag)));
    });
    return (
      React.DOM.div( {className:"article"}, 
        React.DOM.div( {className:"date pull-right"}, this.props.created_at),
        React.DOM.h3( {className:"title"}, ArticleTitle( {title:this.props.title} ),React.DOM.ul( {className:"tags"}, tags)),
        ArticleBody( {content:this.props.content} )
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
