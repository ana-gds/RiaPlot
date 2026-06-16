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
        'photo_url', 'bio', 'saved_routes', 'followers', 'following',
        // Privacidade
        'is_private', 'hide_location', 'hide_followers', 'searchable',
        'blocked', 'follow_requests',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'saved_routes'    => 'array',
        'followers'       => 'array',
        'following'       => 'array',
        'blocked'         => 'array',
        'follow_requests' => 'array',
        'is_private'      => 'boolean',
        'hide_location'   => 'boolean',
        'hide_followers'  => 'boolean',
        'searchable'      => 'boolean',
    ];

    public function boats()
    {
        return $this->hasMany(Boat::class, 'user_id');
    }
}
