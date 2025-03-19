<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'subject',
        'body',
        'variables',
        'category',
        'is_active',
        'client_identifier',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    // Scope to get only active templates
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope to get templates by category
    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Scope to get templates by client
    public function scopeClient($query, $clientIdentifier)
    {
        return $query->where('client_identifier', $clientIdentifier);
    }

    // Helper method to replace variables in template
    public function replaceVariables($data)
    {
        $body = $this->body;
        $subject = $this->subject;

        foreach ($data as $key => $value) {
            $body = str_replace('{{' . $key . '}}', $value, $body);
            $subject = str_replace('{{' . $key . '}}', $value, $subject);
        }

        return [
            'subject' => $subject,
            'body' => $body,
        ];
    }

    // Boot method to set client_identifier on create
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($template) {
            if (!$template->client_identifier) {
                $template->client_identifier = auth()->user()->identifier;
            }
        });
    }
}
