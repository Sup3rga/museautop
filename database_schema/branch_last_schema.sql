CREATE TABLE `branch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
insert into `branch` (`created_at`, `domain`, `id`, `name`) values ('2026-03-06 19:56:42', 'museautop.com', 1, 'museautop');
