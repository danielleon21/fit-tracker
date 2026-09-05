-- CreateTable
CREATE TABLE "exercise_categories" (
    "id" TEXT NOT NULL,
    "wger_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "exercise_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muscles" (
    "id" TEXT NOT NULL,
    "wger_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "is_front" BOOLEAN NOT NULL,
    "image_url_main" TEXT,
    "image_url_secondary" TEXT,

    CONSTRAINT "muscles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "wger_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "wger_id" INTEGER NOT NULL,
    "uuid" TEXT NOT NULL,
    "category_id" TEXT,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "description" TEXT,
    "description_en" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EquipmentToExercise" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ExercisePrimaryMuscles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ExerciseSecondaryMuscles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "exercise_categories_wger_id_key" ON "exercise_categories"("wger_id");

-- CreateIndex
CREATE UNIQUE INDEX "muscles_wger_id_key" ON "muscles"("wger_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_wger_id_key" ON "equipment"("wger_id");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_wger_id_key" ON "exercises"("wger_id");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_uuid_key" ON "exercises"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "_EquipmentToExercise_AB_unique" ON "_EquipmentToExercise"("A", "B");

-- CreateIndex
CREATE INDEX "_EquipmentToExercise_B_index" ON "_EquipmentToExercise"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ExercisePrimaryMuscles_AB_unique" ON "_ExercisePrimaryMuscles"("A", "B");

-- CreateIndex
CREATE INDEX "_ExercisePrimaryMuscles_B_index" ON "_ExercisePrimaryMuscles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ExerciseSecondaryMuscles_AB_unique" ON "_ExerciseSecondaryMuscles"("A", "B");

-- CreateIndex
CREATE INDEX "_ExerciseSecondaryMuscles_B_index" ON "_ExerciseSecondaryMuscles"("B");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "exercise_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToExercise" ADD CONSTRAINT "_EquipmentToExercise_A_fkey" FOREIGN KEY ("A") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToExercise" ADD CONSTRAINT "_EquipmentToExercise_B_fkey" FOREIGN KEY ("B") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExercisePrimaryMuscles" ADD CONSTRAINT "_ExercisePrimaryMuscles_A_fkey" FOREIGN KEY ("A") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExercisePrimaryMuscles" ADD CONSTRAINT "_ExercisePrimaryMuscles_B_fkey" FOREIGN KEY ("B") REFERENCES "muscles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseSecondaryMuscles" ADD CONSTRAINT "_ExerciseSecondaryMuscles_A_fkey" FOREIGN KEY ("A") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseSecondaryMuscles" ADD CONSTRAINT "_ExerciseSecondaryMuscles_B_fkey" FOREIGN KEY ("B") REFERENCES "muscles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
