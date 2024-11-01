<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Widget extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'column',
        'order',
        'dashboard_id',
        'user_id'
    ];

    protected $casts = [
        'column' => 'integer',
        'order' => 'integer',
    ];

    public function dashboard()
    {
        return $this->belongsTo(Dashboard::class);
    }

    public static function reorderWidgets($dashboardId, $column)
    {
        $widgets = self::where('dashboard_id', $dashboardId)
            ->where('column', $column)
            ->orderBy('order')
            ->get();

        foreach ($widgets->values() as $index => $widget) {
            $widget->update(['order' => $index * 10]);
        }
    }

    public function moveUp()
    {
        $columnWidgets = self::where('dashboard_id', $this->dashboard_id)
            ->where('column', $this->column)
            ->orderBy('order')
            ->get();

        $currentPosition = $columnWidgets->search(function($item) {
            return $item->id === $this->id;
        });

        if ($currentPosition === false || $currentPosition === 0) {
            return false;
        }

        $upperWidget = $columnWidgets[$currentPosition - 1];
        $tempOrder = $this->order;
        
        $this->update(['order' => $upperWidget->order]);
        $upperWidget->update(['order' => $tempOrder]);

        return true;
    }

    public function moveDown()
    {
        $columnWidgets = self::where('dashboard_id', $this->dashboard_id)
            ->where('column', $this->column)
            ->orderBy('order')
            ->get();

        $currentPosition = $columnWidgets->search(function($item) {
            return $item->id === $this->id;
        });

        if ($currentPosition === false || $currentPosition === ($columnWidgets->count() - 1)) {
            return false;
        }

        $lowerWidget = $columnWidgets[$currentPosition + 1];
        $tempOrder = $this->order;
        
        $this->update(['order' => $lowerWidget->order]);
        $lowerWidget->update(['order' => $tempOrder]);

        return true;
    }
}
