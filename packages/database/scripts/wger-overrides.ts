// Correcciones manuales a datos de traduccion rotos/vandalizados en el origen
// de wger (idiomas invertidos, texto placeholder, descripciones de otro
// ejercicio pegadas por error, etc.). Se aplican DESPUES de procesar la
// respuesta de la API en cada corrida de import-wger-exercises.ts, para que
// sobrevivan un re-import (por ejemplo al preparar la base de produccion) en
// vez de perderse la proxima vez que se sincronice contra wger.
//
// Como agregar una correccion: buscar el wgerId del ejercicio afectado
// (columna wger_id en la tabla exercises, o el id en la URL de wger.de) y
// agregar solo los campos que hay que sobreescribir - el resto sigue viniendo
// de la API normalmente.

export interface WgerExerciseOverride {
  name?: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
}

export const WGER_EXERCISE_OVERRIDES: Record<number, WgerExerciseOverride> = {
  // wger_id 2534: las dos traducciones comunitarias (es/en) vienen con los
  // idiomas invertidos y la descripcion en espanol pegada de otro ejercicio
  // (plancha lateral) en vez de la propia (puente de gluteos). Verificado a
  // mano contra /api/v2/exercise-translation/?exercise=2534 el 2026-09-05.
  2534: {
    name: "Puente de glúteos",
    nameEn: "Glute Bridge",
    description:
      "<p>Acuéstate boca arriba con las caderas y rodillas flexionadas, los pies apoyados en el suelo. Desde esta posición, eleva los glúteos del suelo hasta que tu cuerpo forme una línea recta desde las rodillas hasta los hombros. Para hacer el ejercicio más intenso, puedes agregar peso apoyando una barra sobre las caderas mientras realizas el movimiento, o colocar los pies sobre una superficie ligeramente más alta, como un escalón o un banco.</p>",
    // descriptionEn no se sobreescribe: la traduccion en ingles del origen ya es correcta.
  },
};
