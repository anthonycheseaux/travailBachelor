/**
 * Mutation object
 */
export class Mutation {
  id: number;
  uri: string;
  date: Date;
  mutationLabel: string;

  constructor(id: number, uri: string, date: Date, mutationId: number){
    this.id = id;
    this.uri = uri;
    this.date = date;
    this.mutationLabel = ConceptLabel[mutationId];
  }

}

/**
 * Enum used to translate the label only available in German
 */
enum ConceptLabel {
  ""                                                  = -1,
  "Statut provisoire"                                 = 0,  //Status provisorisch
  "Statut définitif"                                  =	1,  //Status definitiv
  "Commune politique"                                 =	11, //Politische Gemeinde
  "Territoire non attribué à une commune"             =	12, //Gemeindefreies Gebiet
  "Partie cantonale de lac"                           =	13, //Kantonaler Seeanteil
  "District"                                          =	15, //Bezirk
  "Canton sans districts"                             =	16, //Kanton ohne Bezirksunterteilung
  "Territoire non attribué à un district"             =	17, //Bezirksfreies Gebiet
  "Première saisie commune/district"                  =	20, //Ersterfassung Gemeinde/Bezirk
  "Création commune/district"                         =	21, //Neugründung Gemeinde/Bezirk
  "Changement de nom du district" 	                  = 22, //Namensänderung Bezirk
  "Changement de nom de la commune"                   =	23, //Namensänderung Gemeinde
  "Rattachement à un autre district/canton"           =	24, //Neue Bezirks-/Kantonszuteilung
  "Modification du territoire de la commune"          =	26, //Gebietsänderung Gemeinde
  "Renumérotation formelle de la commune/du district" =	27, //Formale Neunummerierung Gemeinde/Bezirk
  "Radiation commune/district"                        = 29, //Aufhebung Gemeinde/Bezirk
  "Annulation de la mutation"                         =	30  //Mutation annulliert
}
