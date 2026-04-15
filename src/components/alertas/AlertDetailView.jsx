import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Iconify } from "@/components/core";
import { MethodologyInfo } from "@/components/alertas/MethodologyInfo";
import { fCurrency, fNumber } from "@/utils/format";

/**
 * @typedef {{ key: string; label: string; align?: "left"|"right"|"center"; numeric?: boolean; format?: "currency"|"number"|"percent"; maxWidth?: number }} AlertColumn
 */

function formatCellValue(value, col) {
	if (value == null || value === "") return "—";
	if (col.format === "currency") return fCurrency(Number(value));
	if (col.format === "number") return fNumber(value);
	if (col.format === "percent") return `${Number(value).toFixed(1)}%`;
	return String(value);
}

function downloadCsv(filename, columns, rows) {
	const headers = columns.map((c) => c.label).join(";");
	const lines = rows.map((row) =>
		columns
			.map((c) => {
				const v = row[c.key];
				const s = v == null ? "" : String(v).replaceAll(";", ",");
				return `"${s.replaceAll('"', '""')}"`;
			})
			.join(";"),
	);
	const blob = new Blob(["\uFEFF" + [headers, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

/**
 * Vista reutilizable: metodología, búsqueda, tabla ordenable, export CSV, modal de detalle.
 *
 * @param {{
 *   title: string;
 *   subtitle?: string;
 *   alertCode: string;
 *   columns: AlertColumn[];
 *   rows: Record<string, unknown>[];
 *   loading?: boolean;
 *   methodology?: { title?: string; ocpRef?: string; steps?: string[]; fields?: string[] } | null;
 *   children?: import("react").ReactNode;
 *   graphSlot?: import("react").ReactNode;
 *   exportFileName?: string;
 *   mockBanner?: boolean;
 * }} props
 */
export function AlertDetailView({
	title,
	subtitle,
	alertCode,
	columns,
	rows = [],
	loading = false,
	methodology,
	children,
	graphSlot,
	exportFileName = "alertas.csv",
	mockBanner = false,
}) {
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState(columns[0]?.key || "");
	const [sortDir, setSortDir] = useState("asc");
	const [detail, setDetail] = useState(null);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		let list = rows;
		if (q) {
			list = rows.filter((row) =>
				Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(q)),
			);
		}
		if (!sortBy) return list;
		return [...list].sort((a, b) => {
			const va = a[sortBy];
			const vb = b[sortBy];
			if (typeof va === "number" && typeof vb === "number") {
				return sortDir === "asc" ? va - vb : vb - va;
			}
			const cmp = String(va ?? "").localeCompare(String(vb ?? ""), "es");
			return sortDir === "asc" ? cmp : -cmp;
		});
	}, [rows, search, sortBy, sortDir]);

	const handleSort = (key) => {
		if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		else {
			setSortBy(key);
			setSortDir("asc");
		}
	};

	return (
		<Stack spacing={2}>
			<Stack spacing={0.5}>
				<Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
					<Typography variant="h4">{title}</Typography>
					<Typography variant="caption" sx={{ px: 1, py: 0.25, bgcolor: "action.hover", borderRadius: 1 }}>
						{alertCode}
					</Typography>
				</Stack>
				{subtitle && (
					<Typography variant="body2" color="text.secondary">
						{subtitle}
					</Typography>
				)}
			</Stack>

			{mockBanner && (
				<Box
					sx={{
						p: 1.5,
						borderRadius: 1,
						border: "1px dashed",
						borderColor: "info.main",
						bgcolor: "info.lighter",
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<Iconify icon="solar:info-circle-bold-duotone" width={22} color="info" />
					<Typography variant="body2" color="info.dark">
						Datos de demostración: la API de alertas no está disponible o devolvió error; se muestran registros simulados.
					</Typography>
				</Box>
			)}

			<MethodologyInfo methodology={methodology} />

			{children}

			{graphSlot}

			<Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
				<TextField
					size="small"
					placeholder="Buscar en resultados…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					sx={{ minWidth: 280 }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Iconify icon="solar:magnifer-bold-duotone" width={20} />
							</InputAdornment>
						),
					}}
				/>
				<Button
					variant="outlined"
					startIcon={<Iconify icon="solar:download-minimalistic-bold-duotone" width={20} />}
					onClick={() => downloadCsv(exportFileName, columns, filtered)}
					disabled={!filtered.length}
				>
					Exportar CSV
				</Button>
			</Stack>

			<TableContainer sx={{ borderRadius: 2, border: 1, borderColor: "divider" }}>
				<Table size="small" stickyHeader>
					<TableHead>
						<TableRow>
							{columns.map((col) => (
								<TableCell
									key={col.key}
									align={col.align || "left"}
									sx={{ maxWidth: col.maxWidth, fontWeight: 600 }}
								>
									<TableSortLabel
										active={sortBy === col.key}
										direction={sortBy === col.key ? sortDir : "asc"}
										onClick={() => handleSort(col.key)}
									>
										{col.label}
									</TableSortLabel>
								</TableCell>
							))}
							<TableCell align="right" width={56}>
								Detalle
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading && (
							<TableRow>
								<TableCell colSpan={columns.length + 1}>Cargando…</TableCell>
							</TableRow>
						)}
						{!loading && filtered.length === 0 && (
							<TableRow>
								<TableCell colSpan={columns.length + 1}>Sin registros</TableCell>
							</TableRow>
						)}
						{!loading &&
							filtered.map((row, idx) => (
								<TableRow key={row.id ?? idx} hover>
									{columns.map((col) => (
										<TableCell key={col.key} align={col.align || "left"} sx={{ maxWidth: col.maxWidth }}>
											{formatCellValue(row[col.key], col)}
										</TableCell>
									))}
									<TableCell align="right">
										<Tooltip title="Ver detalle">
											<IconButton size="small" onClick={() => setDetail(row)}>
												<Iconify icon="solar:eye-bold-duotone" width={20} />
											</IconButton>
										</Tooltip>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>

			<Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="md" fullWidth>
				<DialogTitle>Detalle del registro</DialogTitle>
				<DialogContent dividers>
					{detail && (
						<Stack spacing={1}>
							{Object.entries(detail).map(([k, v]) => (
								<Stack key={k} direction="row" spacing={2} flexWrap="wrap">
									<Typography variant="caption" color="text.secondary" sx={{ minWidth: 160 }}>
										{k}
									</Typography>
									<Typography variant="body2" sx={{ wordBreak: "break-word" }}>
										{v == null ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v)}
									</Typography>
								</Stack>
							))}
						</Stack>
					)}
				</DialogContent>
			</Dialog>
		</Stack>
	);
}
