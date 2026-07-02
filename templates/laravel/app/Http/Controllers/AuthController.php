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
            return $this->signInError($request, 'missing_token');
        }
        $session = $this->authio->verifyToken($token);
        if ($session === null) {
            return $this->signInError($request, 'invalid_token');
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

    /**
     * Carry the error code across the bounce in a short-lived cookie
     * instead of ?error= — query-string error codes leak into browser
     * history, access logs, and Referer headers. Read (and clear) the
     * authio_signin_flash cookie on the sign-in page.
     */
    private function signInError(Request $request, string $code)
    {
        return redirect('/auth/sign-in')->cookie(
            'authio_signin_flash',
            $code,
            1, // minutes
            '/',
            null,
            $request->isSecure(),
            false, // not HttpOnly so the page's JS can read + clear it
            false,
            'lax'
        );
    }
}
