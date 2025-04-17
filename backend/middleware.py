# backend/middleware.py
from django.http import HttpResponsePermanentRedirect

class RedirectToWWW:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host()
        if host == 'rifandoando.club':
            new_url = request.build_absolute_uri().replace('//rifandoando.club', '//www.rifandoando.club')
            return HttpResponsePermanentRedirect(new_url)
        return self.get_response(request)
