CREATE TABLE `interaction` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `likes` int(10) unsigned DEFAULT 0,
  `dislikes` int(10) unsigned DEFAULT 0,
  `views` int(11) DEFAULT 0,
  `visites` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;insert into `interaction` (`dislikes`, `id`, `likes`, `views`, `visites`) values (0, 2, 13, 3, 0);
