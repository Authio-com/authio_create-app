<?php

namespace App\Http\Middleware;

use Authio\Authio;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithAuthio
{
    public function __construct(private Authio $authio)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->cookie('authio_session');
        if (! $token) {
            return $this->redirectToSignIn($request);
        }

        $session = $this->authio->verifyToken($token);
        if ($session === null) {
            return $this->redirectToSignIn($request);
        }

        $request->attributes->set('authio_session', $session);

        return $next($request);
    }

    private function redirectToSignIn(Request $request): Response
    {
        $redirect = urlencode($request->fullUrl());

        return redirect("/auth/sign-in?redirect_url={$redirect}");
    }
}
