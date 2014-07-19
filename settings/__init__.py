import os

if os.environ.get('SERVER_SOFTWARE', '').startswith('Google'):
    from .prod import *
else:
    from .dev import *