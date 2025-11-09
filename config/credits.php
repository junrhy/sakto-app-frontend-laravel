<?php

return [
    'packages' => [
        [
            'id' => 1,
            'name' => '100 Credits',
            'credits' => 100,
            'price' => 2.99,
            'popular' => false,
            'lemon_squeezy_variant_id' => env('LEMON_SQUEEZY_PACKAGE_1_VARIANT_ID', '1035913'),
        ],
        [
            'id' => 2,
            'name' => '500 Credits',
            'credits' => 500,
            'price' => 8.99,
            'popular' => true,
            'savings' => '40%',
            'lemon_squeezy_variant_id' => env('LEMON_SQUEEZY_PACKAGE_2_VARIANT_ID', '1035919'),
        ],
        [
            'id' => 3,
            'name' => '1000 Credits',
            'credits' => 1000,
            'price' => 14.99,
            'popular' => false,
            'savings' => '50%',
            'lemon_squeezy_variant_id' => env('LEMON_SQUEEZY_PACKAGE_3_VARIANT_ID', '1035920'),
        ],
        [
            'id' => 4,
            'name' => '2500 Credits',
            'credits' => 2500,
            'price' => 29.99,
            'popular' => false,
            'savings' => '60%',
            'lemon_squeezy_variant_id' => env('LEMON_SQUEEZY_PACKAGE_4_VARIANT_ID', '1035921'),
        ],
    ],
];

