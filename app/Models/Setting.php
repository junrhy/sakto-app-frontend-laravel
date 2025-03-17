<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'description'];

    /**
     * Get a setting value by key
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        
        if ($setting) {
            return $setting->value;
        }
        
        return $default;
    }

    /**
     * Set a setting value
     *
     * @param string $key
     * @param mixed $value
     * @param string|null $description
     * @return Setting
     */
    public static function set(string $key, $value, ?string $description = null)
    {
        $setting = self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'description' => $description ?? $key,
            ]
        );
        
        return $setting;
    }
}
