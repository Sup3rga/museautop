CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `attached_to` enum('A','P') NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` int(11) NOT NULL,
  `modified_at` datetime NOT NULL,
  `modified_by` int(11) NOT NULL,
  `branch` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_man_cat_creator` (`created_by`),
  KEY `fk_man_cat_editor` (`modified_by`),
  KEY `fk_branch_cat` (`branch`),
  CONSTRAINT `fk_branch_cat` FOREIGN KEY (`branch`) REFERENCES `branch` (`id`),
  CONSTRAINT `fk_man_cat_creator` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`),
  CONSTRAINT `fk_man_cat_editor` FOREIGN KEY (`modified_by`) REFERENCES `manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;insert into `category` (`attached_to`, `branch`, `created_at`, `created_by`, `id`, `modified_at`, `modified_by`, `name`) values ('A', 1, '2026-03-09 18:26:59', 1, 1, '2026-03-09 18:26:59', 1, 'Actualités');
insert into `category` (`attached_to`, `branch`, `created_at`, `created_by`, `id`, `modified_at`, `modified_by`, `name`) values ('A', 1, '2026-04-02 15:57:37', 1, 3, '2026-04-02 15:57:37', 1, 'Tendances');
insert into `category` (`attached_to`, `branch`, `created_at`, `created_by`, `id`, `modified_at`, `modified_by`, `name`) values ('P', 1, '2026-04-03 09:14:49', 1, 4, '2026-04-03 09:14:49', 1, 'Hip-hop');
insert into `category` (`attached_to`, `branch`, `created_at`, `created_by`, `id`, `modified_at`, `modified_by`, `name`) values ('A', 1, '2026-06-13 22:02:11', 1, 5, '2026-06-13 22:02:11', 1, 'People');
insert into `category` (`attached_to`, `branch`, `created_at`, `created_by`, `id`, `modified_at`, `modified_by`, `name`) values ('A', 1, '2026-06-13 22:02:11', 1, 6, '2026-06-13 22:02:11', 1, 'World');
