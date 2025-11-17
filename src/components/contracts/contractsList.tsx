import { Badge } from "@/components/ui/badge";

const keyWords: string[] = [
  "bombeo",
  "estaciones de bombeo",
  "ampliación de capacidad",
  "optimización de sistemas",
  "sectorización de acueductos",
  "suministro de equipos",
  "motobombas",
  "equipos electromecánicos",
  "bombas flotantes",
  "control de inundaciones",
  "construcción electromecánica",
  "variadores de velocidad",
  "desarenadores",
  "rejillas de cribado",
  "estaciones elevadoras",
  "tanques de almacenamiento",
  "tratamiento de lixiviados",
  "tubería de impulsión",
  "control de aguas lluvias",
  "control de aguas residuales",
  "mantenimiento de equipos eléctricos",
  "operación de sistemas de tratamiento",
  "agua residual",
  "agua potable",
  "agua industrial",
  "bombeo en lagunas",
  "automatización de plantas",
  "PTAR",
  "PTAP",
  "mantenimiento electromecánico",
  "regulación de aguas lluvias",
  "paneles solares hidráulicos",
  "almacenamiento de agua",
  "bombas sumergibles",
  "red matriz",
  "red troncal",
  "conexiones domiciliarias",
  "ampliación de redes de acueducto",
  "alcantarillado",
  "sumideros",
  "sistemas de válvulas",
  "medición de caudal",
  "medición de presión",
  "calidad de agua",
  "telemetría",
  "plantas de tratamiento de agua potable",
  "plantas de tratamiento de agua residual",
  "pozos profundos",
  "diseño de desarenadores",
  "distribución de agua",
];

interface Contract {
  entidad: string;
  id_del_proceso: string;
  departamento_entidad: string;
  ciudad_entidad: string;
  nombre_del_procedimiento: string;
  descripci_n_del_procedimiento: string;
  fase: string;
  estado_del_procedimiento: string;
  fecha_de_publicacion_del: string;
  precio_base: number;
  duracion: string;
  urlproceso: {
    url: string;
  };
  matched_keywords: string[];
}

// Helper functions
const formatCurrency = (value: string | number): string => {
  let num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
};

const matchKeywords = (description: string, keywords: string[]): string[] => {
  const desc = description.toLowerCase();
  return keywords.filter((kw) => desc.includes(kw.toLowerCase()));
};

const fetchContracts = async (startDate?: string, endDate?: string) => {
  const finalPostings: Contract[] = [];
  let query =
    "SELECT * WHERE precio_base > 500000000 AND precio_base <= 20000000000 AND estado_del_procedimiento != 'Seleccionado'";

  // Apply start/end date from user-selected query params
  if (startDate) query += ` AND fecha_de_publicacion_del >= '${startDate}'`;
  if (endDate) query += ` AND fecha_de_publicacion_del <= '${endDate}'`;

  const url =
    "https://www.datos.gov.co/api/v3/views/p6dx-8zbt/query.json" +
    "?pageSize=1000&pageNumber=1" +
    `&query=${encodeURIComponent(query)}`;

  // Always fetch fresh data (no-cache)
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "X-App-Token": process.env.NEXT_PUBLIC_API_APP_TOKEN ?? "",
    },
  });

  if (!response.ok)
    throw new Error("Network response was not ok: " + response.statusText);

  const postings = await response.json();

  postings.forEach((item: Contract) => {
    const desc = item["descripci_n_del_procedimiento"] || "";
    const matchedKeywords = matchKeywords(desc, keyWords);
    if (matchedKeywords.length > 0) {
      finalPostings.push({ ...item, matched_keywords: matchedKeywords });
    }
  });

  // Sort by publication date descending
  return finalPostings.sort((a, b) =>
    b.fecha_de_publicacion_del.localeCompare(a.fecha_de_publicacion_del)
  );
};

type ContractsListProps = {
  startDate?: string;
  endDate?: string;
};

export default async function ContractsList({
  startDate,
  endDate,
}: ContractsListProps) {
  const contracts = await fetchContracts(startDate, endDate);

  return (
    <div className="w-full flex flex-col items-center gap-y-4">
      <p>Se encontraron {contracts.length} procesos</p>
      {contracts.map((contract) => (
        <div
          key={contract.id_del_proceso}
          className="w-[1000px] border rounded-md p-4 text-left"
        >
          <div className="flex flex-col gap-y-1 pb-2">
            <h1 className="text-xl">{contract.nombre_del_procedimiento}</h1>
            <div className="flex flex-row gap-x-1">
              {contract.matched_keywords.map((keyword: string, idx) => (
                <Badge key={idx}>
                  {keyword.charAt(0).toUpperCase() + keyword.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
          <p>
            Estado: {contract.estado_del_procedimiento} - {contract.fase}
          </p>
          <p>{`Fecha de publicacion: ${contract.fecha_de_publicacion_del}`}</p>
          <p>Entidad: {contract.entidad}</p>
          <p>
            Ubicacion: {contract.ciudad_entidad},{" "}
            {contract.departamento_entidad}
          </p>
          <p>
            Descripcion:{" "}
            {contract.descripci_n_del_procedimiento.charAt(0) +
              contract.descripci_n_del_procedimiento.toLowerCase().slice(1)}
          </p>
          <p>Precio Base: {formatCurrency(contract.precio_base)}</p>
          <a href={contract.urlproceso.url} className="text-blue-500 underline">
            Link del proceso
          </a>
        </div>
      ))}
    </div>
  );
}
