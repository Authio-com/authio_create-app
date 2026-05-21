<?php

namespace App\Http\Controllers;

use Authio\Authio;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function __construct(private Authio $authio)
    {
    }

    public function signInForm(Request $request): View
    {
        return view('auth.sign-in', [
            'publishable_key' => env('AUTHIO_PUBLISHABLE_KEY', ''),
            'api_url' => env('AUTHIO_API_URL', 'https://api.authio.com'),
            'redirect_url' => $request->query('redirect_url', '/dashboard'),
        ]);
    }

    public function callback(Request $request)
    {
        $token = $request->query('access_token');
        $redirect = $request->query('redirect', '/dashboard');
        if (! $token) {
            return redirect('/auth/sign-in?error=missing_token');
        }
        $session = $this->authio->verifyToken($token);
        if ($session === null) {
            return redirect('/auth/sign-in?error=invalid_token');
        }
        return redirect($redirect)->cookie(
            'authio_session',
            $token,
            (int) (env('SESSION_LIFETIME', 480)),
            '/',
            null,
            $request->isSecure(),
            true,
            false,
            'lax'
        );
    }

    public function signOut()
    {
        return redirect('/')->withCookie(cookie()->forget('authio_session'));
    }
}
