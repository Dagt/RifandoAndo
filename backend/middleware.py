from django.shortcuts import redirect

class RedirectToWWW:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host()
        if host == 'rifandoando.club':
            return redirect(f'https://www.rifandoando.club{request.get_full_path()}')
        return self.get_response(request)
