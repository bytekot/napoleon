CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`creation_date` text NOT NULL,
	`due_date` text,
	`order` integer,
	`completed` integer DEFAULT false,
	CONSTRAINT "order_integrity_check" CHECK("tasks"."due_date" IS NULL OR "tasks"."order" IS NOT NULL)
);
--> statement-breakpoint
CREATE INDEX `due_date_order_idx` ON `tasks` (`due_date`,`order`);