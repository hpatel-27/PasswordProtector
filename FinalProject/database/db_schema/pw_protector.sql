CREATE TABLE IF NOT EXISTS `provider` (
  `prv_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `prv_name` varchar(50) NOT NULL,
--   `prv_account` varchar(150) NOT NULL,
  PRIMARY KEY (`prv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELETE FROM `provider`;
INSERT INTO `provider` (`prv_id`, `prv_name`) VALUES
    (1, 'amazon.com'),
    (2, 'spotify.com'),
    (3, 'facebook.com'),
    (4, 'linkedin.com'),
    (5, 'google.com'),
    (6, 'stackoverflow.com'),
    (7, 'twitter.com'),
    (8, 'microsoft.com'),
    (9, 'instagram.com'),
    (10, 'github.com'),
    (11, 'ebay.com'),
    (12, 'pinterest.com'),
    (13, 'netflix.com'),
    (14, 'wikipedia.org'),
    (15, 'adobe.com'),
    (16, 'apple.com'),
    (17, 'walmart.com'),
    (18, 'forbes.com'),
    (19, 'wordpress.org'),
    (20, 'yahoo.com');

CREATE TABLE IF NOT EXISTS `account` (
  `act_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `act_username` varchar(64) NOT NULL,
  `act_password` varchar(127) NOT NULL,
  `act_notes` varchar(280) NOT NULL,
  `prv_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`act_id`),
  CONSTRAINT `FK_ACCOUNT_PROVIDER` FOREIGN KEY (`prv_id`) REFERENCES `provider` (`prv_id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELETE FROM `account`;
INSERT INTO `account` (`act_id`, `act_username`, `act_password`, `act_notes`, `prv_id`) VALUES
    (1, 'username1', 'password1', 'message1', 1),
    (2, 'username2', 'password2', 'message2', 1),
    (3, 'username3', 'password3', 'message3', 2),
    (4, 'username4', 'password4', 'message4', 2),
    (5, 'username5', 'password5', 'message5', 3),
    (6, 'username6', 'password6', 'message6', 3),
    (7, 'username7', 'password7', 'message7', 4),
    (8, 'username8', 'password8', 'message8', 4),
    (9, 'username9', 'password9', 'message9', 5),
    (10, 'username10', 'password10', 'message10', 5),
    (11, 'username11', 'password11', 'message11', 6),
    (12, 'username12', 'password12', 'message12', 6),
    (13, 'username13', 'password13', 'message13', 7),
    (14, 'username14', 'password14', 'message14', 7),
    (15, 'username15', 'password15', 'message15', 8),
    (16, 'username16', 'password16', 'message16', 8),
    (17, 'username17', 'password17', 'message17', 9),
    (18, 'username18', 'password18', 'message18', 9),
    (19, 'username19', 'password19', 'message19', 10),
    (20, 'username20', 'password20', 'message20', 10),
    (21, 'username21', 'password21', 'message21', 11),
    (22, 'username22', 'password22', 'message22', 11),
    (23, 'username23', 'password23', 'message23', 12),
    (24, 'username24', 'password24', 'message24', 12),
    (25, 'username25', 'password25', 'message25', 13),
    (26, 'username26', 'password26', 'message26', 13),
    (27, 'username27', 'password27', 'message27', 14),
    (28, 'username28', 'password28', 'message28', 14),
    (29, 'username29', 'password29', 'message29', 15),
    (30, 'username30', 'password30', 'message30', 15),
    (31, 'username31', 'password31', 'message31', 16),
    (32, 'username32', 'password32', 'message32', 16),
    (33, 'username33', 'password33', 'message33', 17),
    (34, 'username34', 'password34', 'message34', 17),
    (35, 'username35', 'password35', 'message35', 18),
    (36, 'username36', 'password36', 'message36', 18),
    (37, 'username37', 'password37', 'message37', 19),
    (38, 'username38', 'password38', 'message38', 19),
    (39, 'username39', 'password39', 'message39', 20),
    (40, 'username40', 'password40', 'message40', 20);

CREATE TABLE IF NOT EXISTS `user` (
  `usr_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usr_username` varchar(64) NOT NULL,
  `usr_password` varchar(127) NOT NULL,
  `usr_salt` varchar(100) NOT NULL,
  `usr_email` varchar(64) NOT NULL,
--   `usr_providers` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELETE FROM `user`;
INSERT INTO `user` (`usr_id`, `usr_username`, `usr_password`, `usr_salt`, `usr_email`) VALUES
    (1, 'student1', 'fa618ff05c687488bd740bd958a03380b47f75d61bd2172afa428954df92b55b', '1pdj4md7n24zr5u3wy3olp1r1a6p7otw', 'student1@mail.com'),
	(2, 'student2', 'de67fbed51baa01ec9843db58bffafd28dfb02619875626002ccfe4533d353a1', 'k974s9egj23sujb7jhltggqh0dnss2eh', 'student2@mail.com'),
    (3, 'student3', 'f5a05548ea49258d40eecf7afabc04b55f68953d5dc67bfd9dc90df7b51c7574', 'nhug7j4pps5zjceyjzgan5ftbnnngipf', 'student3@mail.com'),
	(4, 'student4', '397080a248bf517bfbe5b3b994eb566cd37e8cb24121331c14ee92b351bcbb80', '7qk5hbkh2hpo7252ncuv2mxpk8mded0p', 'student4@mail.com'),
    (5, 'student5', 'e744fd8303d95446446aaffc9ebc321f22bcbdbf2cd5419526bd0cbd1ef65920', 'hlejo01eq93t1862nxmr1a4cv6naypw7', 'student5@mail.com'),
	(6, 'student6', 'a6fa7595806d1b9b971d5676600bb4fbdd7297c6c998a6f326bf2c9013522aaa', 'vkvw3thggkw8vbgjtzz5px8eztlrvcji', 'student6@mail.com'),
    (7, 'student7', 'e4f6c53a2ac696f0b788e8ae9559f5a7d490e7516d68b99d2e401223d199eb95', 'g6mr1ki2acyp6x3yjsb59hscei665gw3', 'student7@mail.com'),
	(8, 'student8', '1d897ca84ebdc0306ce6a174b7046b68c9b26cdb0484f0f72b6bc08fa2da5d64', 'y8u3n885aghdc2jw4s0u888uqvkxnec7', 'student8@mail.com'),
    (9, 'student9', '4038a883f19299ba24169b7cede15b299f7e5e30bc082601391978cb197fef74', 'bjg3r5e5hi8s5twkm9pwif5cfcjps74h', 'student9@mail.com'),
	(10, 'student10', '432fc1b8bd3a4fa81895a321f0c7bac68d02d16de4e89757e55d143958a69196', 'lbw50wgv28lsgl7vor3pl95p2lvdc6a0 ', 'student10@mail.com');

CREATE TABLE IF NOT EXISTS `user_provider` (
  `upr_usr_id` int(10) unsigned NOT NULL,
  `upr_prv_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`upr_usr_id`,`upr_prv_id`),
  KEY `FK_UPR_USR` (`upr_usr_id`),
  CONSTRAINT `FK_UPR_USR` FOREIGN KEY (`upr_usr_id`) REFERENCES `user` (`usr_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_UPR_PRV` FOREIGN KEY (`upr_prv_id`) REFERENCES `provider` (`prv_id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELETE FROM `user_provider`;
INSERT INTO `user_provider` (`upr_usr_id`, `upr_prv_id`) VALUES
	(1, 1),
	(1, 2),
	(2, 3),
	(2, 4),
	(3, 5),
	(3, 6),
	(4, 7),
	(4, 8),
	(5, 9),
	(5, 10),
	(6, 11),
	(6, 12),
	(7, 13),
	(7, 14),
	(8, 15),
	(8, 16),
	(9, 17),
	(9, 18),
	(10, 19),
	(10, 20);
