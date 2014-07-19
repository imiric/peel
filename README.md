### Django / App Engine / Docker / Fig

---
#####Dev requirements:
- [Docker](https://www.docker.io/)
- [Fig](http://orchardup.github.io/fig/install.html)

1. Clone this repo:
   ```
   git clone https://github.com/bradleyg/django-appengine.git
   ```

2. In the project directory build the docker image:
   ```
   fig build web
   ```

3. Install Django-nonrel dependencies:
   ```
   fig run web ./build.sh
   ```

4. Run:
   ```
   fig up web
   ```

Point your browser to your docker IP at port 5000.