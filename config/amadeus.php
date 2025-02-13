<?php

return [
    'client_id' => env('AMADEUS_CLIENT_ID'),
    'client_secret' => env('AMADEUS_CLIENT_SECRET'),
    'environment' => env('AMADEUS_API_ENV', 'test'),
    'base_url' => env('AMADEUS_API_ENV') === 'production' 
        ? 'https://api.amadeus.com' 
        : 'https://test.api.amadeus.com',
]; 