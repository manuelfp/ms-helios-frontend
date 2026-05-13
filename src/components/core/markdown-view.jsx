import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

const INLINE_BOLD = /\*\*([^*]+)\*\*/g;
const INLINE_CODE = /`([^`]+)`/g;
const INLINE_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderInline(text, keyPrefix) {
	const tokens = [];
	let working = String(text ?? "");
	let cursor = 0;

	const pushPlain = (str) => {
		if (!str) return;
		tokens.push(<span key={`${keyPrefix}-t-${cursor++}`}>{str}</span>);
	};

	while (working.length > 0) {
		INLINE_BOLD.lastIndex = 0;
		INLINE_CODE.lastIndex = 0;
		INLINE_LINK.lastIndex = 0;
		const boldMatch = INLINE_BOLD.exec(working);
		const codeMatch = INLINE_CODE.exec(working);
		const linkMatch = INLINE_LINK.exec(working);

		const candidates = [boldMatch, codeMatch, linkMatch].filter(Boolean);
		if (candidates.length === 0) {
			pushPlain(working);
			break;
		}
		candidates.sort((a, b) => a.index - b.index);
		const next = candidates[0];
		pushPlain(working.slice(0, next.index));

		if (next === boldMatch) {
			tokens.push(
				<strong key={`${keyPrefix}-b-${cursor++}`}>{next[1]}</strong>,
			);
		} else if (next === codeMatch) {
			tokens.push(
				<Box
					key={`${keyPrefix}-c-${cursor++}`}
					component="code"
					sx={{
						fontFamily: "monospace",
						fontSize: "0.875em",
						bgcolor: "grey.100",
						px: 0.5,
						py: 0.1,
						borderRadius: 0.5,
						color: "primary.main",
					}}
				>
					{next[1]}
				</Box>,
			);
		} else if (next === linkMatch) {
			tokens.push(
				<Link
					key={`${keyPrefix}-l-${cursor++}`}
					href={next[2]}
					target={next[2].startsWith("http") ? "_blank" : undefined}
					rel="noopener noreferrer"
					underline="hover"
				>
					{next[1]}
				</Link>,
			);
		}

		working = working.slice(next.index + next[0].length);
	}

	return tokens;
}

function parseTable(lines, startIdx) {
	const header = lines[startIdx];
	const separator = lines[startIdx + 1];
	if (!separator || !/^\s*\|?[\s:-]+\|/.test(separator)) return null;

	const splitRow = (line) =>
		line
			.replace(/^\s*\|/, "")
			.replace(/\|\s*$/, "")
			.split("|")
			.map((c) => c.trim());

	const headers = splitRow(header);
	const rows = [];
	let idx = startIdx + 2;
	while (idx < lines.length && /\|/.test(lines[idx])) {
		rows.push(splitRow(lines[idx]));
		idx++;
	}
	return { headers, rows, nextIdx: idx };
}

/**
 * Minimal markdown renderer suited for in-app documentation.
 * Supports: H1-H3, paragraphs, unordered/ordered lists, tables, inline bold/code/links.
 *
 * @param {{ markdown: string }} props
 */
export function MarkdownView({ markdown }) {
	const lines = String(markdown || "")
		.replace(/\r\n/g, "\n")
		.split("\n");

	const blocks = [];
	let i = 0;
	let listBuffer = null;

	const flushList = () => {
		if (!listBuffer) return;
		const ListEl = listBuffer.ordered ? "ol" : "ul";
		blocks.push(
			<Box
				key={`list-${blocks.length}`}
				component={ListEl}
				sx={{ pl: 3, my: 1, "& li": { mb: 0.5 } }}
			>
				{listBuffer.items.map((item, idx) => (
					<Typography
						key={`${blocks.length}-item-${idx}`}
						component="li"
						variant="body2"
						color="text.primary"
					>
						{renderInline(item, `li-${blocks.length}-${idx}`)}
					</Typography>
				))}
			</Box>,
		);
		listBuffer = null;
	};

	while (i < lines.length) {
		const raw = lines[i];
		const line = raw.trimEnd();

		if (!line.trim()) {
			flushList();
			i++;
			continue;
		}

		const h = line.match(/^(#{1,3})\s+(.+)$/);
		if (h) {
			flushList();
			const level = h[1].length;
			const text = h[2];
			const variant = level === 1 ? "h4" : level === 2 ? "h6" : "subtitle1";
			blocks.push(
				<Typography
					key={`h-${i}`}
					variant={variant}
					sx={{
						mt: level === 1 ? 0 : 3,
						mb: 1,
						fontWeight: level === 1 ? 700 : 600,
						color: level === 1 ? "primary.main" : "text.primary",
					}}
				>
					{renderInline(text, `h-${i}`)}
				</Typography>,
			);
			i++;
			continue;
		}

		if (/^\s*\|.+\|/.test(line)) {
			flushList();
			const parsed = parseTable(lines, i);
			if (parsed) {
				blocks.push(
					<TableContainer
						key={`tbl-${i}`}
						component={Paper}
						variant="outlined"
						sx={{ my: 2 }}
					>
						<Table size="small">
							<TableHead>
								<TableRow>
									{parsed.headers.map((h2, idx) => (
										<TableCell key={`th-${i}-${idx}`} sx={{ fontWeight: 600 }}>
											{renderInline(h2, `th-${i}-${idx}`)}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{parsed.rows.map((row, rIdx) => (
									<TableRow key={`tr-${i}-${rIdx}`}>
										{row.map((cell, cIdx) => (
											<TableCell key={`td-${i}-${rIdx}-${cIdx}`}>
												{renderInline(cell, `td-${i}-${rIdx}-${cIdx}`)}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>,
				);
				i = parsed.nextIdx;
				continue;
			}
		}

		const ol = line.match(/^\s*\d+\.\s+(.+)$/);
		const ul = line.match(/^\s*[-*]\s+(.+)$/);
		if (ol || ul) {
			const item = (ol || ul)[1];
			const ordered = !!ol;
			if (!listBuffer || listBuffer.ordered !== ordered) {
				flushList();
				listBuffer = { ordered, items: [] };
			}
			listBuffer.items.push(item);
			i++;
			continue;
		}

		flushList();
		blocks.push(
			<Typography
				key={`p-${i}`}
				variant="body2"
				color="text.primary"
				sx={{ my: 1, lineHeight: 1.7 }}
			>
				{renderInline(line, `p-${i}`)}
			</Typography>,
		);
		i++;
	}

	flushList();

	return <Box>{blocks}</Box>;
}
