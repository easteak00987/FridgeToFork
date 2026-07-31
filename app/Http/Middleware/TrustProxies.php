<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
    /**
     * The trusted proxies for this application.
     *
     * Trust all of them. On a managed platform (Render, Railway, Fly) the
     * only route to this container is the provider's load balancer, which
     * terminates TLS and forwards over plain HTTP. Without trusting its
     * X-Forwarded-Proto header Laravel believes every request is http://,
     * and generates http:// image URLs that an https:// front-end then
     * refuses to load as mixed content.
     *
     * @var array<int, string>|string|null
     */
    protected $proxies = '*';

    /**
     * The headers that should be used to detect proxies.
     *
     * @var int
     */
    protected $headers =
        Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB;
}
