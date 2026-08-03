<?php

namespace Tests\Feature;

use Tests\TestCase;

class RootRedirectTest extends TestCase
{
    public function test_the_root_redirects_to_the_api_index(): void
    {
        $this->get('/')->assertRedirect('/api');
    }

    public function test_the_api_index_lists_the_available_endpoints(): void
    {
        $this->getJson('/api')
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonStructure(['service', 'endpoints' => ['public', 'authenticated']]);
    }
}
