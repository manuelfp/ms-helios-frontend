import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";

export function AlertFilterBar({ ano, fuerza, setAno, setFuerza, resetFilters, anios = [], fuerzas = [], compact = false }) {
	return (
		<Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" alignItems={{ sm: "center" }}>
			<FormControl size="small" sx={{ minWidth: 120 }}>
				<InputLabel>Año</InputLabel>
				<Select label="Año" value={ano} onChange={(e) => setAno(e.target.value)}>
					{(anios.length ? anios : [2025, 2024]).map((a) => (
						<MenuItem key={String(a)} value={String(a)}>
							{a}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			{!compact && (
				<FormControl size="small" sx={{ minWidth: 200 }}>
					<InputLabel>Fuerza</InputLabel>
					<Select label="Fuerza" value={fuerza} onChange={(e) => setFuerza(e.target.value)}>
						<MenuItem value="">Todas</MenuItem>
						{fuerzas.map((f) => {
							const val = typeof f === "string" ? f : f.fuerza || f.nombre;
							const lbl = typeof f === "string" ? f : f.fuerza || f.nombre || f.descripcion;
							return (
								<MenuItem key={val} value={val}>
									{lbl}
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>
			)}
			{resetFilters && (
				<Button variant="outlined" size="small" onClick={resetFilters}>
					Restablecer filtros
				</Button>
			)}
		</Stack>
	);
}
