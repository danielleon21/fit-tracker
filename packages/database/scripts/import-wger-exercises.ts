// Importa una vez el catalogo publico de ejercicios de wger (CC-BY-SA, ver
// CLAUDE.md) a nuestra propia base de datos. No se vuelve a llamar a wger en
// vivo desde la app: correr `pnpm import:wger` desde packages/database cuando
// haga falta re-sincronizar el catalogo.
//
// Usa /api/v2/exerciseinfo/, que ya trae categoria, musculos, equipo,
// imagenes y traducciones anidadas en un solo objeto por ejercicio -evita
// tener que pegarle a 4-5 endpoints distintos y cruzar ids a mano.
//
// Nota: el endpoint /exercise-translation/ NO filtra por idioma via query
// param (?language=4 se ignora silenciosamente y devuelve todo sin filtrar)
// -verificado a mano antes de escribir este script- por eso se usa
// exerciseinfo y se filtra el array `translations` en memoria.

import { PrismaClient } from "@prisma/client";
import { WGER_EXERCISE_OVERRIDES } from "./wger-overrides";

const prisma = new PrismaClient();

const WGER_BASE_URL = "https://wger.de/api/v2";
const PAGE_SIZE = 100;
const REQUEST_DELAY_MS = 200;
const SPANISH_LANGUAGE_ID = 4;
const ENGLISH_LANGUAGE_ID = 2;

interface WgerCategory {
  id: number;
  name: string;
}

interface WgerMuscle {
  id: number;
  name: string;
  name_en: string | null;
  is_front: boolean;
  image_url_main: string | null;
  image_url_secondary: string | null;
}

interface WgerEquipment {
  id: number;
  name: string;
}

interface WgerImage {
  exercise: number;
  image: string;
  is_main: boolean;
}

interface WgerTranslation {
  name: string;
  description: string;
  language: number;
  exercise: number;
}

interface WgerExerciseInfo {
  id: number;
  uuid: string;
  category: WgerCategory | null;
  muscles: WgerMuscle[];
  muscles_secondary: WgerMuscle[];
  equipment: WgerEquipment[];
  images: WgerImage[];
  translations: WgerTranslation[];
}

interface WgerPage<T> {
  count: number;
  next: string | null;
  results: T[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let url: string | null = `${WGER_BASE_URL}${path}?limit=${PAGE_SIZE}&format=json`;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`wger API error ${res.status} en ${url}`);
    const page = (await res.json()) as WgerPage<T>;
    items.push(...page.results);
    url = page.next;
    if (url) await sleep(REQUEST_DELAY_MS);
  }

  return items;
}

function pickTranslation(translations: WgerTranslation[], languageId: number) {
  return translations.find((translation) => translation.language === languageId) ?? null;
}

// Parte de la data comunitaria de wger es basura ("excercise error", vacia, etc.).
function cleanText(text: string | undefined | null): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function upsertCategory(category: WgerCategory, cache: Map<number, string>) {
  const cached = cache.get(category.id);
  if (cached) return cached;

  const saved = await prisma.exerciseCategory.upsert({
    where: { wgerId: category.id },
    update: { name: category.name },
    create: { wgerId: category.id, name: category.name },
  });
  cache.set(category.id, saved.id);
  return saved.id;
}

async function upsertMuscle(muscle: WgerMuscle, cache: Map<number, string>) {
  const cached = cache.get(muscle.id);
  if (cached) return cached;

  const data = {
    name: muscle.name,
    nameEn: muscle.name_en,
    isFront: muscle.is_front,
    imageUrlMain: muscle.image_url_main,
    imageUrlSecondary: muscle.image_url_secondary,
  };
  const saved = await prisma.muscle.upsert({
    where: { wgerId: muscle.id },
    update: data,
    create: { wgerId: muscle.id, ...data },
  });
  cache.set(muscle.id, saved.id);
  return saved.id;
}

async function upsertEquipment(equipment: WgerEquipment, cache: Map<number, string>) {
  const cached = cache.get(equipment.id);
  if (cached) return cached;

  const saved = await prisma.equipment.upsert({
    where: { wgerId: equipment.id },
    update: { name: equipment.name },
    create: { wgerId: equipment.id, name: equipment.name },
  });
  cache.set(equipment.id, saved.id);
  return saved.id;
}

async function run() {
  console.log("Descargando catalogo de ejercicios de wger (exerciseinfo)...");
  const exercises = await fetchAllPages<WgerExerciseInfo>("/exerciseinfo/");
  console.log(`  ${exercises.length} ejercicios descargados.`);

  const categoryCache = new Map<number, string>();
  const muscleCache = new Map<number, string>();
  const equipmentCache = new Map<number, string>();

  let imported = 0;
  let skipped = 0;

  for (const ex of exercises) {
    const es = pickTranslation(ex.translations, SPANISH_LANGUAGE_ID);
    const en = pickTranslation(ex.translations, ENGLISH_LANGUAGE_ID);

    const name = cleanText(es?.name) ?? cleanText(en?.name);
    if (!name) {
      skipped += 1;
      continue;
    }

    const categoryId = ex.category ? await upsertCategory(ex.category, categoryCache) : null;

    const muscleIds: string[] = [];
    for (const muscle of ex.muscles) muscleIds.push(await upsertMuscle(muscle, muscleCache));

    const secondaryMuscleIds: string[] = [];
    for (const muscle of ex.muscles_secondary) {
      secondaryMuscleIds.push(await upsertMuscle(muscle, muscleCache));
    }

    const equipmentIds: string[] = [];
    for (const equipment of ex.equipment) equipmentIds.push(await upsertEquipment(equipment, equipmentCache));

    const mainImage = ex.images.find((image) => image.is_main) ?? ex.images[0] ?? null;

    const override = WGER_EXERCISE_OVERRIDES[ex.id];

    const finalName = override?.name ?? name;
    const nameEn = override?.nameEn ?? cleanText(en?.name);
    const description = override?.description ?? cleanText(es?.description) ?? cleanText(en?.description);
    const descriptionEn = override?.descriptionEn ?? cleanText(en?.description);

    await prisma.exercise.upsert({
      where: { wgerId: ex.id },
      update: {
        uuid: ex.uuid,
        categoryId,
        name: finalName,
        nameEn,
        description,
        descriptionEn,
        imageUrl: mainImage?.image ?? null,
        primaryMuscles: { set: muscleIds.map((id) => ({ id })) },
        secondaryMuscles: { set: secondaryMuscleIds.map((id) => ({ id })) },
        equipment: { set: equipmentIds.map((id) => ({ id })) },
      },
      create: {
        wgerId: ex.id,
        uuid: ex.uuid,
        categoryId,
        name: finalName,
        nameEn,
        description,
        descriptionEn,
        imageUrl: mainImage?.image ?? null,
        primaryMuscles: { connect: muscleIds.map((id) => ({ id })) },
        secondaryMuscles: { connect: secondaryMuscleIds.map((id) => ({ id })) },
        equipment: { connect: equipmentIds.map((id) => ({ id })) },
      },
    });

    imported += 1;
    if (imported % 100 === 0) console.log(`  ${imported}/${exercises.length} procesados...`);
  }

  console.log(`Listo: ${imported} ejercicios importados, ${skipped} omitidos (sin nombre en ES ni EN).`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
