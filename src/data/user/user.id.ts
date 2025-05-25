import { PrimaryId } from "@/data/primaryId";

export type UserId = PrimaryId & {
  _userId: never;
};
