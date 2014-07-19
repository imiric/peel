/** @jsx React.DOM */

var UIBuilder = React.createClass({displayName: 'UIBuilder',
    render: function() {
        return (
            React.DOM.div( {className:"ui-hello"}, 
                "Test."
            )
        );
    }
});

React.renderComponent(UIBuilder(null ), document.getElementById("content"));
