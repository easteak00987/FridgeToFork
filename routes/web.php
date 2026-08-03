<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This service is API-only — the user interface is a separate React
| application deployed to Vercel. Rather than serving Laravel's default
| welcome page, the root redirects to the API index, which lists every
| available endpoint.
|
*/

Route::get('/', fn () => redirect('/api'));
