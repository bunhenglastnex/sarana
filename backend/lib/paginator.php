<?php
// backend/lib/paginator.php
// Centralized Reusable Database Pagination Module for Pure PHP PDO Endpoints

/**
 * Paginates any SQL SELECT query with dynamic LIMIT, OFFSET, and COUNT metadata.
 *
 * @param PDO $pdo
 * @param string $baseSql
 * @param array $params
 * @param int|null $page
 * @param int|null $limit
 * @return array ['data' => array, 'pagination' => array|null]
 */
function paginateQuery(PDO $pdo, string $baseSql, array $params = [], ?int $page = null, ?int $limit = null): array {
    // If no pagination requested, execute base query as-is
    if ($limit === null && $page === null) {
        $stmt = $pdo->prepare($baseSql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        return [
            'data'       => $rows,
            'pagination' => null
        ];
    }

    $currentPage = max(1, $page ?? 1);
    $currentLimit = max(1, $limit ?? 12);
    $offset = ($currentPage - 1) * $currentLimit;

    // 1. Calculate Total Matching Records Count
    $cleanCountSql = preg_replace('/ORDER\s+BY.+$/i', '', $baseSql);
    $countSql = "SELECT COUNT(*) FROM ({$cleanCountSql}) as count_table";

    try {
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $totalCount = (int)$countStmt->fetchColumn();
    } catch (\Throwable $e) {
        $totalCount = 0;
    }

    // 2. Append LIMIT and OFFSET to Base Query
    $paginatedSql = $baseSql . " LIMIT {$currentLimit} OFFSET {$offset}";
    $stmt = $pdo->prepare($paginatedSql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $totalPages = max(1, (int)ceil($totalCount / $currentLimit));

    return [
        'data'       => $rows,
        'pagination' => [
            'total'      => $totalCount,
            'page'       => $currentPage,
            'limit'      => $currentLimit,
            'totalPages' => $totalPages,
            'hasMore'    => ($currentPage < $totalPages)
        ]
    ];
}
