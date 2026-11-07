PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`creation_date` text NOT NULL,
	`due_date` text,
	`order` integer,
	`completed` integer DEFAULT false,
	CONSTRAINT "order_integrity_check" CHECK("__new_tasks"."due_date" IS NULL OR "__new_tasks"."order" IS NOT NULL)
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "name", "creation_date", "due_date", "order", "completed") SELECT "id", "name", "creation_date", "due_date", "order", "completed" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `due_date_order_idx` ON `tasks` (`due_date`,`order`);