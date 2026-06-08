CREATE TABLE `analyticsDaily` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`totalUsers` int DEFAULT 0,
	`totalConversations` int DEFAULT 0,
	`totalMessages` int DEFAULT 0,
	`microphoneUsage` int DEFAULT 0,
	`speakerUsage` int DEFAULT 0,
	`projectsToolUsage` int DEFAULT 0,
	`documentsToolUsage` int DEFAULT 0,
	`searchToolUsage` int DEFAULT 0,
	`codeToolUsage` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analyticsDaily_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analyticsEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(50) NOT NULL,
	`eventName` varchar(100) NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsEvents_id` PRIMARY KEY(`id`)
);
