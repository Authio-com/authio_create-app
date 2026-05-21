<?php

namespace App\Http\Controllers;

use Authio\Authio;
use Illuminate\Http\Request;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function __construct(private Authio $authio)
    {
    }

    public function index(Request $request): View
    {
        $token = $request->cookie('authio_session');
        $session = $token ? $this->authio->verifyToken($token) : null;

        return view('welcome', ['session' => $session]);
    }
}
