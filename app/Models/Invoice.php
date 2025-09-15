<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'user_identifier',
        'type',
        'subtotal',
        'tax_amount',
        'total_amount',
        'status',
        'payment_method',
        'payment_transaction_id',
        'notes',
        'due_date',
        'paid_at',
        'metadata',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Status constants
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_REFUNDED = 'refunded';

    // Type constants
    public const TYPE_SUBSCRIPTION = 'subscription';
    public const TYPE_APP_PURCHASE = 'app_purchase';
    public const TYPE_APP_SUBSCRIPTION = 'app_subscription';

    // Payment method constants
    public const PAYMENT_CREDITS = 'credits';

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = static::generateInvoiceNumber();
            }
        });
    }

    /**
     * Generate a unique invoice number.
     */
    public static function generateInvoiceNumber(): string
    {
        do {
            $number = 'INV-' . date('Y') . '-' . strtoupper(Str::random(8));
        } while (static::where('invoice_number', $number)->exists());

        return $number;
    }

    /**
     * Get the invoice items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Get the user that owns the invoice.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_identifier', 'identifier');
    }

    /**
     * Scope to get invoices by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get invoices by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get invoices for a specific user.
     */
    public function scopeForUser($query, string $userIdentifier)
    {
        return $query->where('user_identifier', $userIdentifier);
    }

    /**
     * Check if invoice is paid.
     */
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * Check if invoice is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Mark invoice as paid.
     */
    public function markAsPaid(string $paymentMethod = null, string $transactionId = null): void
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'paid_at' => now(),
            'payment_method' => $paymentMethod ?? $this->payment_method,
            'payment_transaction_id' => $transactionId ?? $this->payment_transaction_id,
        ]);
    }
}
