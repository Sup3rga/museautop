CREATE TABLE `interaction_registry` (
  `id` int(10) unsigned NOT NULL,
  `uid` varchar(255) NOT NULL,
  `stats` set('likes','views') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;