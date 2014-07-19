/** @jsx React.DOM */

var UIBuilder = React.createClass({
    render: function() {
        return (
            <div className="ui-hello">
                Test.
            </div>
        );
    }
});

React.renderComponent(<UIBuilder />, document.getElementById("content"));
