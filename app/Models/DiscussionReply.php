<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $discussion_id
 * @property string $user_id
 * @property string $reply_text
 * @property \Carbon\Carbon $posted_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class DiscussionReply extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'discussion_replies';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'discussion_id',
        'user_id',
        'reply_text',
        'posted_at',
        'parent_id',
    ];

    protected $casts = [
        'posted_at' => 'datetime',
    ];

    public function discussion()
    {
        return $this->belongsTo(Discussion::class, 'discussion_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function parent()
    {
        return $this->belongsTo(DiscussionReply::class, 'parent_id');
    }

    public function children()
{
    return $this->hasMany(DiscussionReply::class, 'parent_id')
        ->with(['user:id,name,avatar,role', 'children'])
        ->orderBy('posted_at', 'asc');
}


    protected static function booted()
{
    static::creating(function ($reply) {
        if (empty($reply->posted_at)) {
            $reply->posted_at = now();
        }
    });
}
}
