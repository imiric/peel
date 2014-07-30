Peel
====

Peel is a small blogging engine designed for simple and quick creation of
content.

Some of its main features include:

* In-place editing with support for rich text formatting.
* All changes are synced to the server as you make them.
* ...

It is built with a lightweight Django backend (powered by
[Tastypie](http://tastypieapi.org/)), and a quick and responsive frontend
built with [React](http://facebook.github.io/react/). The current version
runs on Google App Engine, but through the use of
[django-nonrel](http://django-nonrel.org/) and
[djangoappengine](http://www.allbuttonspressed.com/projects/djangoappengine)
it can easily be adapted to other platforms.


Demo
----

You can view a demo of the app [here](http://peel-demo.appspot.com/). If it's
down, then the free quota has run out, so try again tomorrow.


Usage
-----

To create a new article, click on the center '+' button. This will create a
new empty article that you can edit. Clicking on any of the placeholder
fields (Title, Body or Tags) will allow you to edit them.

When you're done editing, pressing CTRL+Enter will save your changes. For
convenience, in the Title and Tags fields you can also just press Enter.
Rich text formatting is disabled in these fields.

In the Body field, you can additionally press CTRL+B, CTRL+I or CTRL+U to
make the text bold, italic or underlined, respectively.

You can delete or set the visibility of an article via the slide controls that
appear on the right side.

To make changes to already existing fields, press CTRL and click on the field
you wish to edit.


Developing
----------

0. Install [Docker](https://www.docker.io/), [Fig](http://www.fig.sh/),
   [Node.js](http://nodejs.org/) and [Bower](http://bower.io/).

1. Clone this repo:
   ```
   git clone https://github.com/imiric/peel.git
   ```

2. In the project directory build the docker image:
   ```
   fig build web
   ```

3. Install backend dependencies:
   ```
   fig run web ./build.sh
   ```

4. Install frontend dependencies (be patient):
   ```
   npm install && bower install
   ```

5. Compile frontend files (ignore the JSHint errors)
   ```
   gulp
   ```

6. Run:
   ```
   fig up web
   ```
Point your browser to your Docker IP at port 5000.

To continually compile your assets while developing, run `gulp watch`. Also
check out some of the included tasks in `gulpfile.js`.

To deploy to Google App Engine, change the application ID in `app.yaml`, and
run `fig run web ./manage.py deploy`.


License
-------

[MIT](LICENSE)
