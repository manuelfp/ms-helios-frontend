import { useState } from "react";

import { useNavigate } from "react-router-dom";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Iconify } from "@/components/core";
import { lookupNitByName } from "@/services/helios-api";
import { paths } from "@/paths";

const FUENTE_LABELS = {
	proveedores_unicos: "Proveedores únicos (silver)",
	rues: "RUES — Confecámaras",
	nits_defensa: "Catálogo Sector Defensa",
	contratos_entidad: "Histórico de contratos (entidad)",
	proponentes_proceso: "Proponentes históricos",
};

function confianzaColor(score) {
	if (score >= 0.9) return "success";
	if (score >= 0.6) return "primary";
	if (score >= 0.4) return "warning";
	return "default";
}

function confianzaLabel(score) {
	if (score >= 0.9) return "Alta";
	if (score >= 0.6) return "Media";
	if (score >= 0.4) return "Baja";
	return "Muy baja";
}

/**
 * Botón compacto que, al hacer clic, consulta el endpoint de lookup de NIT
 * para una empresa o entidad. Si hay un único candidato con alta confianza
 * (≥0.9), navega directo a Investigación. Si hay múltiples candidatos o
 * confianza media/baja, muestra un popover con la lista para que el usuario
 * confirme. Si no encuentra nada, muestra un mensaje explicativo.
 *
 * @param {{ nombre: string, tipo?: "proveedor"|"entidad"|"any", size?: "small"|"medium" }} props
 */
export function LookupNitButton({ nombre, tipo = "any", size = "small" }) {
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	const handleClick = async (e) => {
		const target = e.currentTarget;
		setAnchorEl(target);
		setError(null);
		setLoading(true);
		try {
			const data = await lookupNitByName(nombre, tipo);
			setResult(data);
			const top = data?.matches?.[0];
			if (data?.matches?.length === 1 && top?.confianza >= 0.9) {
				navigate(paths.dashboard.investigarDoc(String(top.nit)));
				setAnchorEl(null);
			}
		} catch (err) {
			setError(err?.message || "Error consultando lookup de NIT");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setAnchorEl(null);
		setResult(null);
		setError(null);
	};

	const handleSelect = (nit) => {
		navigate(paths.dashboard.investigarDoc(String(nit)));
		handleClose();
	};

	const open = Boolean(anchorEl);

	return (
		<>
			<Tooltip title="Resolver NIT cruzando con RUES, catálogo Sector Defensa y proveedores históricos" arrow>
				<IconButton
					size={size}
					onClick={handleClick}
					sx={{ color: "warning.main" }}
					aria-label="Resolver NIT"
				>
					<Iconify icon="solar:question-circle-bold-duotone" width={size === "small" ? 16 : 20} />
				</IconButton>
			</Tooltip>

			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				transformOrigin={{ vertical: "top", horizontal: "left" }}
				slotProps={{ paper: { sx: { p: 2, maxWidth: 480, minWidth: 320 } } }}
			>
				<Stack spacing={1.5}>
					<Stack direction="row" spacing={1} alignItems="center">
						<Iconify icon="solar:magnifer-bold-duotone" width={20} color="warning" />
						<Typography variant="subtitle2">Resolver NIT</Typography>
					</Stack>
					<Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>
						Nombre buscado: <strong>{nombre}</strong>
					</Typography>

					{loading && (
						<Stack direction="row" spacing={1} alignItems="center">
							<CircularProgress size={16} />
							<Typography variant="body2">Cruzando con RUES, catálogo Defensa y proveedores…</Typography>
						</Stack>
					)}

					{error && <Alert severity="error">{error}</Alert>}

					{!loading && !error && result && (
						<>
							{result.matches?.length > 0 ? (
								<>
									<Typography variant="caption" color="text.secondary">
										{result.matches.length} candidato{result.matches.length === 1 ? "" : "s"} encontrado
										{result.matches.length === 1 ? "" : "s"}. Selecciona uno para investigar.
									</Typography>
									<Stack spacing={1} sx={{ maxHeight: 340, overflow: "auto" }}>
										{result.matches.map((m) => (
											<Box
												key={m.nit}
												sx={{
													p: 1,
													borderRadius: 1,
													border: 1,
													borderColor: "divider",
													transition: "background-color 0.15s",
													cursor: "pointer",
													"&:hover": { bgcolor: "action.hover" },
												}}
												onClick={() => handleSelect(m.nit)}
											>
												<Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
													<Box sx={{ minWidth: 0, flex: 1 }}>
														<Typography
															variant="body2"
															fontWeight={600}
															sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
														>
															{m.nombre_oficial || "(sin nombre)"}
														</Typography>
														<Typography variant="caption" color="text.secondary">
															NIT: <strong>{m.nit}</strong>
															{m.contratos_relacionados
																? ` · ${m.contratos_relacionados.toLocaleString("es-CO")} contratos`
																: ""}
															{m.apariciones_historicas
																? ` · ${m.apariciones_historicas.toLocaleString("es-CO")} apariciones`
																: ""}
															{m.estado_matricula ? ` · RUES ${m.estado_matricula}` : ""}
															{m.fuerza ? ` · ${m.fuerza}` : ""}
														</Typography>
													</Box>
													<Chip
														size="small"
														label={`${confianzaLabel(m.confianza)} · ${(m.confianza * 100).toFixed(0)}%`}
														color={confianzaColor(m.confianza)}
														variant="outlined"
													/>
												</Stack>
												<Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
													{(m.fuentes || [m.fuente]).map((f) => (
														<Chip
															key={f}
															size="small"
															label={FUENTE_LABELS[f] || f}
															sx={{ fontSize: 10 }}
															variant="outlined"
														/>
													))}
												</Stack>
											</Box>
										))}
									</Stack>
								</>
							) : (
								<Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
									No se encontró el NIT en RUES, catálogo Sector Defensa ni en proveedores históricos.
									Es posible que el dato no esté capturado en ninguna fuente disponible.
								</Alert>
							)}
							<Stack direction="row" justifyContent="flex-end">
								<Button size="small" onClick={handleClose}>
									Cerrar
								</Button>
							</Stack>
						</>
					)}
				</Stack>
			</Popover>
		</>
	);
}
