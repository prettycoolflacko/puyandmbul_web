import type { Moment as PrismaMoment, Photo as PrismaPhoto, Letter as PrismaLetter, SpecialDate as PrismaSpecialDate } from "@/generated/prisma/client";

export type Photo = PrismaPhoto;

export type Moment = PrismaMoment & {
  photos: Photo[];
  children?: Moment[];
};

export type SimpleMoment = { id: string; title: string };

export type Letter = PrismaLetter;
export type SpecialDate = PrismaSpecialDate;
