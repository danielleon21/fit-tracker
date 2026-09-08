-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('DESAYUNO', 'COMIDA', 'CENA', 'SNACK');

-- CreateTable
CREATE TABLE "meal_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "description" TEXT NOT NULL,
    "quantity_g" DECIMAL(7,2) NOT NULL,
    "calories_kcal" DECIMAL(7,2),
    "protein_g" DECIMAL(7,2),
    "fat_g" DECIMAL(7,2),
    "carbs_g" DECIMAL(7,2),
    "fdc_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_entries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
