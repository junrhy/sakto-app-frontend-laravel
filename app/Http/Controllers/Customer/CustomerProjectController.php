<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

abstract class CustomerProjectController extends Controller
{
    protected string $apiUrl;
    protected string $apiToken;

    public function __construct()
    {
        $this->apiUrl = (string) config('api.url');
        $this->apiToken = (string) config('api.token');
    }

    protected function ensureCustomerProject(Request $request, string $project): void
    {
        if ($request->user()->project_identifier !== $project) {
            abort(403, 'Unauthorized access');
        }
    }

    /**
     * @param  string|int  $identifier
     */
    protected function resolveOwner(string $project, $identifier): User
    {
        $query = User::where('project_identifier', $project)
            ->where('user_type', 'user')
            ->select(
                'id',
                'name',
                'email',
                'contact_number',
                'created_at',
                'slug',
                'identifier',
                'app_currency',
                'project_identifier'
            );

        if (is_numeric($identifier)) {
            $query->where('id', $identifier);
        } else {
            $query->where(function ($builder) use ($identifier) {
                $builder->where('slug', $identifier)
                    ->orWhere('identifier', $identifier);
            });
        }

        return $query->firstOrFail();
    }

    protected function decodeCurrency(mixed $currency): ?array
    {
        if (is_array($currency)) {
            return $currency;
        }

        if (is_string($currency) && $currency !== '') {
            $decoded = json_decode($currency, true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }

    protected function fetchCourse(User $owner, $courseId): array
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/courses/{$courseId}", [
                'client_identifier' => $owner->identifier,
            ]);

        if (!$response->successful()) {
            throw new ModelNotFoundException('Course not found');
        }

        $payload = $response->json();

        return $payload['data'] ?? $payload;
    }

    protected function fetchCourseLessons(User $owner, $courseId, bool $includeContent = false): array
    {
        $params = [
            'client_identifier' => $owner->identifier,
        ];

        if ($includeContent) {
            $params['include_content'] = true;
        }

        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/courses/{$courseId}/lessons", $params);

        if (!$response->successful()) {
            throw new ModelNotFoundException('Course lessons not found');
        }

        $payload = $response->json();

        return $payload['data'] ?? $payload;
    }

    protected function fetchCourseEnrollment(User $owner, $courseId, string $studentName): array
    {
        if ($studentName === '') {
            return [
                'is_enrolled' => false,
                'enrollment' => null,
            ];
        }

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/course-enrollments/check-status", [
                'course_id' => $courseId,
                'student_name' => $studentName,
                'client_identifier' => $owner->identifier,
            ]);

        if (!$response->successful()) {
            return [
                'is_enrolled' => false,
                'enrollment' => null,
            ];
        }

        $payload = $response->json();

        return [
            'is_enrolled' => data_get($payload, 'data.is_enrolled', false),
            'enrollment' => data_get($payload, 'data.enrollment'),
        ];
    }

    protected function mergeLessonProgress(array $lessons, array $progressEntries): array
    {
        if (empty($lessons)) {
            return [];
        }

        $progressMap = collect($progressEntries)
            ->filter(fn ($entry) => isset($entry['lesson_id']))
            ->mapWithKeys(fn ($entry) => [(string) $entry['lesson_id'] => $entry]);

        return collect($lessons)
            ->map(function ($lesson) use ($progressMap) {
                $lessonId = (string) data_get($lesson, 'id');
                $progress = $progressMap->get($lessonId);

                $lesson['is_completed'] = $progress
                    ? data_get($progress, 'status') === 'completed'
                    : (bool) data_get($lesson, 'is_completed', false);

                $lesson['is_accessible'] = $progress
                    ? true
                    : (bool) data_get($lesson, 'is_accessible', false);

                if ($progress) {
                    $lesson['progress'] = $progress;
                }

                return $lesson;
            })
            ->all();
    }

    protected function determineCurrentLesson(array $lessons, ?string $requestedLessonId): ?array
    {
        if (empty($lessons)) {
            return null;
        }

        if ($requestedLessonId !== null) {
            foreach ($lessons as $lesson) {
                if ((string) data_get($lesson, 'id') === (string) $requestedLessonId) {
                    return $lesson;
                }
            }
        }

        foreach ($lessons as $lesson) {
            if (data_get($lesson, 'is_accessible', true)) {
                return $lesson;
            }
        }

        return $lessons[0];
    }

    protected function fetchMarketplaceProducts(User $owner, array $filters = []): array
    {
        $params = [
            'client_identifier' => $owner->identifier,
            'status' => $filters['status'] ?? 'published',
            'per_page' => $filters['per_page'] ?? 12,
            'page' => $filters['page'] ?? 1,
        ];

        foreach (['search', 'category', 'type', 'availability', 'sort', 'price_min', 'price_max'] as $key) {
            if (!empty($filters[$key])) {
                $params[$key] = $filters[$key];
            }
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products", $params);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Throwable $th) {
            //
        }

        return [
            'data' => [],
            'meta' => null,
        ];
    }

    protected function fetchProductCategories(User $owner): array
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/categories", [
                    'client_identifier' => $owner->identifier,
                ]);

            if ($response->successful()) {
                $payload = $response->json();

                if (is_array($payload)) {
                    if (isset($payload['data']) && is_array($payload['data'])) {
                        return $payload['data'];
                    }

                    return $payload;
                }
            }
        } catch (\Throwable $th) {
            //
        }

        return [];
    }

    protected function fetchMarketplaceProduct(User $owner, $productId): array
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/products/{$productId}", [
                'client_identifier' => $owner->identifier,
            ]);

        if (!$response->successful()) {
            throw new ModelNotFoundException('Product not found');
        }

        $payload = $response->json();

        return $payload['data'] ?? $payload;
    }

    protected function fetchMarketplaceOrders(User $owner, User $customer, array $filters = []): array
    {
        $params = [
            'client_identifier' => $owner->identifier,
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'per_page' => $filters['per_page'] ?? 10,
            'page' => $filters['page'] ?? 1,
        ];

        foreach (['status' => 'order_status', 'payment_status', 'search'] as $filterKey => $paramKey) {
            if (is_int($filterKey)) {
                $filterKey = $paramKey;
            }

            if (!empty($filters[$filterKey])) {
                $params[$paramKey] = $filters[$filterKey];
            }
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders", $params);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Throwable $th) {
            //
        }

        return [
            'data' => [],
            'meta' => null,
        ];
    }
}

