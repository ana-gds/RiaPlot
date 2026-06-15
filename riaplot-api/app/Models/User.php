<?php
namespace App\Models;

use MongoDB\Laravel\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'name', 'email', 'username', 'password',
        'photo_url', 'saved_routes', 'followers', 'following',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'saved_routes' => 'array',
        'followers'    => 'array',
        'following'    => 'array',
    ];

    public function boats()
    {
        return $this->hasMany(Boat::class, 'user_id');
    }
}
