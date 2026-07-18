CREATE TABLE `pictures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path` text NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_man_pic_creator` (`created_by`),
  CONSTRAINT `fk_man_pic_creator` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;insert into `pictures` (`created_at`, `created_by`, `id`, `path`) values ('2026-04-03 20:18:13', 1, 1, '/assets/captions/pchimg2.png');
insert into `pictures` (`created_at`, `created_by`, `id`, `path`) values ('2026-04-03 20:18:13', 1, 2, '/assets/captions/pchimg3.png');
insert into `pictures` (`created_at`, `created_by`, `id`, `path`) values ('2026-04-03 20:39:54', 2, 3, '/assets/captions/artimg4.jpg');
insert into `pictures` (`created_at`, `created_by`, `id`, `path`) values ('2026-04-05 22:02:13', 2, 4, '/assets/captions/artimg9.jpg');
insert into `pictures` (`created_at`, `created_by`, `id`, `path`) values ('2026-04-05 22:03:07', 2, 5, '/assets/captions/artimg8.jpg');
insert into `pictures` (`created_at`, `created_by`, `id`, `path`) values ('2026-04-05 22:17:07', 2, 6, '/assets/captions/artimg6.jpg');
