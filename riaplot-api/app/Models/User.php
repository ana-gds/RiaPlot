<?php
namespace App\Models;

use MongoDB\Laravel\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory; // ← adicionar

class User extends Authenticatable
{
    use HasApiTokens, HasFactory; // ← adicionar HasFactory aqui

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'name', 'email', 'username', 'password',
        'photo_url', 'saved_routes', 'followers', 'following',
        'email_verified_at', 'verification_token',
    ];

    protected $hidden = ['password', 'verification_token'];

    protected $casts = [
        'saved_routes'      => 'array',
        'followers'         => 'array',
        'following'         => 'array',
        'email_verified_at' => 'datetime',
    ];

    public function boats()
    {
        return $this->hasMany(Boat::class, 'user_id');
    }
}
