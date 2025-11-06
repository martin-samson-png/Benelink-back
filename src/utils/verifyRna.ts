interface AssociationDTO {
  id: string;
  nom: string;
  objet: string;
  adresse: string;
  prefecture: string;
  date_creation: string;
  verified: boolean;
  source: "mock";
}

const MOCK_RNA: Record<string, AssociationDTO> = {
  W123456789: {
    id: "W123456789",
    nom: "ASSOCIATION LES AMIS DU PATRIMOINE",
    objet: "Préserver le patrimoine local",
    adresse: "12 rue du Port, 33000 Bordeaux",
    prefecture: "Gironde",
    date_creation: "2012-03-04",
    verified: true,
    source: "mock",
  },
  W987654321: {
    id: "W987654321",
    nom: "ASSOCIATION SOLIDARITE URBAINE",
    objet: "Soutien et actions solidaires en milieu urbain",
    adresse: "5 avenue Victor, 33000 Bordeaux",
    prefecture: "Gironde",
    date_creation: "2018-07-11",
    verified: true,
    source: "mock",
  },
};

export const verifyRNa = async (
  rna: string
): Promise<{ verified: boolean; data: AssociationDTO | null }> => {
  if (!rna) return { verified: false, data: null };

  await new Promise((resolve) => setTimeout(resolve, 300));

  const record = MOCK_RNA[rna.trim()];
  if (record) return { verified: true, data: record };

  return { verified: false, data: null };
};
