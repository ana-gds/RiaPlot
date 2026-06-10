<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Post extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'posts';

    protected $fillable = [
        'user_id', 'username', 'title', 'description',
        'route_doc', 'location', 'post_url', 'gpx_url', 'gpx_points', 'likes', 'comments',
    ];

    // Nota: o MongoDB guarda/lê arrays nativamente, por isso NÃO usamos o cast
    // 'array' aqui — esse cast faz json_decode() de um valor que já é array e
    // rebenta a leitura do feed (TypeError: json_decode espera string).
}
