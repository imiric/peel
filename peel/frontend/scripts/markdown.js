'use strict';

var marked = require('marked/lib/marked'),
    toMarkdown = require('to-markdown').toMarkdown;

module.exports = {
  mdToHtml: function(md) {
    // Avoids enclosing in <p>
    return marked.inlineLexer(md, []);
  },
  htmlToMd: function(html) {
    return toMarkdown(html);
  }
};
