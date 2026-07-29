CREATE TABLE `communauty` (
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
insert into `communauty` (`access`, `branch`, `id`, `manager`) values ('0,1,2,3,4,5,6,100,101,102,103,104,105,106,200,201,202,203,300,301,302,303,400,401,402,403,404,405,406,407,408,409', 1, 1, 1);
insert into `communauty` (`access`, `branch`, `id`, `manager`) values ('1,2,3,4,5,6,101,100,102,103,104,105,106,200,201,202,203,300,301,302,303,400,401,402,403,404,405,406,407,408,409', 1, 16, 2);
