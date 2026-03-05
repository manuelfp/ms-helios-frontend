import Box from "@mui/material/Box";

const IFRAME_SRC =
	"http://neodash.graphapp.io/?share&type=database&id=0069014b-554c-4f4e-855b-26fbf6994885&dashboardDatabase=neo4j&credentials=neo4j%2Bs%3A%2F%2Fneo4j%3Ab7N-LGmskQ_iXnA6bnNpAKZzkQOTz3TR3lNrj6-8htM%40neo4j%3A3ce5660d.databases.neo4j.io%3A7687&standalone=Yes";

export default function Neo4jAlertasTempranas() {
	return (
		<Box
			sx={{
				mx: { xs: -2, md: -3 },
				mt: { xs: -2, md: -3 },
				mb: { xs: -2, md: -3 },
				height: "calc(100vh - 64px)",
			}}
		>
			<iframe
				title="Sistema de Alertas Tempranas"
				src={IFRAME_SRC}
				style={{ width: "100%", height: "100%", border: "none", display: "block" }}
				allow="fullscreen"
			/>
		</Box>
	);
}
