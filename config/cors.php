<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     | The SPA is served from a different origin in production (Vercel), so the
     | API must name it explicitly. Set CORS_ALLOWED_ORIGINS to a comma-separated
     | list of origins; leaving it unset falls back to '*', which is fine for
     | local development because auth is Bearer-token based, not cookie based
     | (supports_credentials is false below).
     */
    'allowed_origins' => array_values(array_filter(
        explode(',', (string) env('CORS_ALLOWED_ORIGINS', '*'))
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
