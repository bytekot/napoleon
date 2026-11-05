CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`creation_date` text NOT NULL,
	`due_date` text,
	`order` integer,
	`completed` integer DEFAULT false
);
