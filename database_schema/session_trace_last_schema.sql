CREATE TABLE `session_trace` (
  `client` int(11) NOT NULL,
  `token` text NOT NULL,
  `created_at` datetime NOT NULL,
  `last_seen` datetime NOT NULL,
  KEY `fk_man_session` (`client`),
  CONSTRAINT `fk_man_session` FOREIGN KEY (`client`) REFERENCES `manager` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;