<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Notification extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'notifications';

    // `user`  = destinatário (dono do post / quem é seguido)
    // `actor` = quem despoletou a notificação (quem gostou/comentou/seguiu)
    // `comment` = texto do comentário (apenas para o tipo "comment")
    protected $fillable = ['type', 'user', 'actor', 'post', 'comment', 'read'];

    protected $casts = [
        'read' => 'boolean',
    ];
}
