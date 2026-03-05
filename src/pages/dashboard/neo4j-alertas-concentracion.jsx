import Box from "@mui/material/Box";

const IFRAME_SRC =
	"https://neodash.graphapp.io/?share&type=database&id=60e57f80-1b37-4195-b563-3431109737b3&dashboardDatabase=neo4j&credentials=neo4j%2Bs%3A%2F%2Fneo4j%3Ab7N-LGmskQ_iXnA6bnNpAKZzkQOTz3TR3lNrj6-8htM%40neo4j%3A3ce5660d.databases.neo4j.io%3A7687&standalone=Yes";

export default function Neo4jAlertasConcentracionPage() {
	return (
		<Box sx={{ position: "absolute", inset: 0 }}>
			<iframe
				title="Alertas Tempranas y Análisis de Concentración"
				src={IFRAME_SRC}
				style={{ width: "100%", height: "100%", border: "none", display: "block" }}
				allow="fullscreen"
			/>
		</Box>
	);
}
