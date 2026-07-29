CREATE TABLE  IF NOT EXISTS `branch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `manager` (
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `firstname` varchar(255) NOT NULL,
   `lastname` varchar(255) NOT NULL,
   `mail` varchar(255) NOT NULL,
   `code` text NOT NULL,
   `nickname` varchar(255) NOT NULL,
   `phone` varchar(255) NOT NULL,
   `created_at` datetime NOT NULL,
   `created_by` int(11) DEFAULT NULL,
   `active` tinyint(1) NOT NULL,
   PRIMARY KEY (`id`),
   KEY `fk_man_mentor` (`created_by`),
   CONSTRAINT `fk_man_mentor` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `category` (
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `pictures` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `path` text NOT NULL,
    `created_at` datetime NOT NULL,
    `created_by` int(11) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_man_pic_creator` (`created_by`),
    CONSTRAINT `fk_man_pic_creator` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `interaction_registry` (
    `id` int(10) unsigned NOT NULL,
    `uid` varchar(255) NOT NULL,
    `stats` set('likes','views') DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE  IF NOT EXISTS `interaction` (
   `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
   `likes` int(10) unsigned DEFAULT 0,
   `dislikes` int(10) unsigned DEFAULT 0,
   `views` int(11) DEFAULT 0,
   `visites` int(11) DEFAULT 0,
   PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE  IF NOT EXISTS `communauty` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `branch` int(11) NOT NULL,
  `manager` int(11) NOT NULL,
  `access` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_man_com` (`manager`),
  KEY `fk_branch_com` (`branch`),
  CONSTRAINT `fk_branch_com` FOREIGN KEY (`branch`) REFERENCES `branch` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_man_com` FOREIGN KEY (`manager`) REFERENCES `manager` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `sys_pref` (
    `metadata` varchar(255) NOT NULL,
    `content` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `subscriber` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mail` varchar(255) NOT NULL,
  `contact` int(11) NOT NULL,
  `news` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `branch` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_branch_mail` (`branch`,`mail`),
  CONSTRAINT `fk_branch_subscribe` FOREIGN KEY (`branch`) REFERENCES `branch` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE  IF NOT EXISTS `session_trace` (
 `client` int(11) NOT NULL,
 `token` text NOT NULL,
 `created_at` datetime NOT NULL,
 `last_seen` datetime NOT NULL,
 KEY `fk_man_session` (`client`),
 CONSTRAINT `fk_man_session` FOREIGN KEY (`client`) REFERENCES `manager` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `client_snapshot` (
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `file` text NOT NULL,
   `created_at` datetime NOT NULL,
   PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `messenging` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `client` int(11) NOT NULL,
  `message` text NOT NULL,
  `post_on` datetime NOT NULL,
  `read_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sub_cli_mess` (`client`),
  KEY `fk_man_mess` (`read_by`),
  CONSTRAINT `fk_man_mess` FOREIGN KEY (`read_by`) REFERENCES `manager` (`id`),
  CONSTRAINT `fk_sub_cli_mess` FOREIGN KEY (`client`) REFERENCES `subscriber` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `mailing` (
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `client` int(11) NOT NULL,
   `object` varchar(255) NOT NULL,
   `body` text NOT NULL,
   `created_at` datetime NOT NULL,
   `post_on` datetime NOT NULL,
   `posted_by` int(11) NOT NULL,
   PRIMARY KEY (`id`),
   KEY `fk_subs_cli` (`client`),
   KEY `fk_man_mail` (`posted_by`),
   CONSTRAINT `fk_man_mail` FOREIGN KEY (`posted_by`) REFERENCES `manager` (`id`),
   CONSTRAINT `fk_subs_cli` FOREIGN KEY (`client`) REFERENCES `subscriber` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `punchlines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `presentation` int(11) NOT NULL,
  `picture` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `artist` varchar(255) NOT NULL,
  `lyrics` text DEFAULT NULL,
  `punchline` text NOT NULL,
  `year` int(11) NOT NULL,
  `category` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `modified_at` datetime DEFAULT NULL,
  `modified_by` int(11) NOT NULL,
  `post_on` datetime DEFAULT NULL,
  `branch` int(11) NOT NULL,
  `stats` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_base_pic` (`presentation`),
  KEY `fk_final_pic` (`picture`),
  KEY `fk_cat_punch` (`category`),
  KEY `fk_man_punch_creator` (`created_by`),
  KEY `fk_man_punch_editor` (`modified_by`),
  KEY `fk_branch_punch` (`branch`),
  CONSTRAINT `fk_base_pic` FOREIGN KEY (`presentation`) REFERENCES `pictures` (`id`),
  CONSTRAINT `fk_branch_punch` FOREIGN KEY (`branch`) REFERENCES `branch` (`id`),
  CONSTRAINT `fk_cat_punch` FOREIGN KEY (`category`) REFERENCES `category` (`id`),
  CONSTRAINT `fk_final_pic` FOREIGN KEY (`picture`) REFERENCES `pictures` (`id`),
  CONSTRAINT `fk_man_punch_creator` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`),
  CONSTRAINT `fk_man_punch_editor` FOREIGN KEY (`modified_by`) REFERENCES `manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `articles` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `caption` int(11) DEFAULT NULL,
    `content` text NOT NULL,
    `created_at` datetime NOT NULL,
    `created_by` int(11) NOT NULL,
    `modified_at` datetime NOT NULL,
    `modified_by` int(11) NOT NULL,
    `reading` int(11) NOT NULL DEFAULT 0,
    `likes` int(11) NOT NULL DEFAULT 0,
    `dislikes` int(11) NOT NULL DEFAULT 0,
    `category` int(11) NOT NULL,
    `branch` int(11) NOT NULL,
    `post_on` datetime NOT NULL,
    `resume` text NOT NULL,
    `theme` varchar(255) NOT NULL,
    `duration` int(11) NOT NULL,
    `slug` text NOT NULL,
    `stats` int(11) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_pic_caption` (`caption`),
    KEY `fk_man_creator` (`created_by`),
    KEY `fk_man_editor` (`modified_by`),
    KEY `fk_cat_art` (`category`),
    KEY `fk_branch_art` (`branch`),
    CONSTRAINT `fk_branch_art` FOREIGN KEY (`branch`) REFERENCES `branch` (`id`),
    CONSTRAINT `fk_cat_art` FOREIGN KEY (`category`) REFERENCES `category` (`id`),
    CONSTRAINT `fk_man_creator` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`),
    CONSTRAINT `fk_man_editor` FOREIGN KEY (`modified_by`) REFERENCES `manager` (`id`),
    CONSTRAINT `fk_pic_caption` FOREIGN KEY (`caption`) REFERENCES `pictures` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `articles_pictures` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `img` int(11) NOT NULL,
 `article` int(11) NOT NULL,
 PRIMARY KEY (`id`),
 KEY `fk_art_img` (`img`),
 KEY `fk_art_id` (`article`),
 CONSTRAINT `fk_art_id` FOREIGN KEY (`article`) REFERENCES `articles` (`id`),
 CONSTRAINT `fk_art_img` FOREIGN KEY (`img`) REFERENCES `pictures` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;