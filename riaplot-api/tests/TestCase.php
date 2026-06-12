<?php

namespace Tests;

use App\Models\Notification;
use App\Models\PasswordResetToken;
use App\Models\PersonalAccessToken;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Salvaguarda: só limpamos se estivermos mesmo na base de testes.
        // Evita apagar dados reais caso o phpunit.xml seja mal configurado.
        $database = DB::connection('mongodb')->getDatabaseName();
        if (!str_contains($database, 'test')) {
            $this->fail("Recusado: a ligar à base '{$database}', que não parece ser de testes.");
        }

        // Cada teste arranca com as coleções vazias.
        User::truncate();
        Post::truncate();
        Notification::truncate();
        PersonalAccessToken::truncate();
        PasswordResetToken::truncate();
    }
}
