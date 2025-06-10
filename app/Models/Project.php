<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name',
        'identifier',
        'enabledModules',
    ];

    protected $casts = [
        'enabledModules' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'project_identifier', 'identifier');
    }
}
