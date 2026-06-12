<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class PasswordResetToken extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'password_reset_tokens';

    // Guarda o token com hash (nunca em claro). `created_at`/`updated_at` são
    // geridos automaticamente e usados para calcular a expiração.
    protected $fillable = ['email', 'token'];
}
