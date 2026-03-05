import { useState } from "react";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { useAuthContext } from "@/auth/hooks/use-auth-context";
import { Iconify, Logo } from "@/components/core";
import { paths } from "@/paths";
import { usePathname } from "@/routes/hooks/use-pathname";
import { useRouter } from "@/routes/hooks/use-router";

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 77;

const NAV_ITEMS = [
	{ title: "Dashboard", path: paths.dashboard.root, icon: "solar:chart-bold-duotone" },
	// { title: "Contratos", path: paths.dashboard.contratos, icon: "solar:document-bold-duotone" },
	// { title: "Consulta IA", path: paths.dashboard.consultaIA, icon: "solar:magic-stick-3-bold-duotone" },
	// { title: "Investigación", path: paths.dashboard.investigacion, icon: "solar:magnifer-bold-duotone" },
	// { title: "Estadísticas", path: paths.dashboard.estadisticas, icon: "solar:graph-new-bold-duotone" },
	{ title: "Alertas y Concentración", path: paths.dashboard.neo4jAlertasConcentracion, icon: "solar:bell-bing-bold-duotone" },
	{ title: "Alertas Tempranas", path: paths.dashboard.neo4jAlertasTempranas, icon: "solar:shield-warning-bold-duotone" },
	{ title: "Análisis de Relación", path: paths.dashboard.neo4jAnalisisRelacion, icon: "solar:users-group-rounded-bold-duotone" },
];

function SidebarContent({ collapsed, pathname, onNavigate, onLogout }) {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
			{/* Logo area — height: 64px matches AppBar Toolbar, aligning the Dividers */}
			<Box
				sx={{
					height: 64,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					px: collapsed ? 1 : 2.5,
					overflow: "hidden",
					flexShrink: 0,
				}}
			>
				{collapsed ? (
					<Logo variant="mini" sx={{ height: 32 }} />
				) : (
					<Logo variant="dark" sx={{ height: 40 }} />
				)}
			</Box>

			<Divider />

			<List sx={{ px: collapsed ? 0.5 : 1.5, py: 2, flex: 1 }}>
				{NAV_ITEMS.map((item) => {
					const active = pathname === item.path;
					return (
						<Tooltip key={item.path} title={collapsed ? item.title : ""} placement="right" arrow>
							<ListItemButton
								onClick={() => onNavigate(item.path)}
								sx={{
									borderRadius: 1.5,
									mb: 0.5,
									minHeight: 44,
									justifyContent: collapsed ? "center" : "flex-start",
									color: active ? "primary.main" : "text.secondary",
									bgcolor: active ? "rgba(46, 59, 78, 0.08)" : "transparent",
									"&:hover": { bgcolor: "rgba(46, 59, 78, 0.06)" },
								}}
							>
								<ListItemIcon
									sx={{
										minWidth: collapsed ? 0 : 40,
										color: "inherit",
										justifyContent: "center",
									}}
								>
									<Iconify icon={item.icon} width={22} />
								</ListItemIcon>
								{!collapsed && (
									<ListItemText
										primary={item.title}
										primaryTypographyProps={{ variant: "body2", fontWeight: active ? 600 : 400 }}
									/>
								)}
							</ListItemButton>
						</Tooltip>
					);
				})}
			</List>

			<Divider />

			<Box sx={{ p: collapsed ? 1 : 2 }}>
				<Tooltip title={collapsed ? "Cerrar sesión" : ""} placement="right" arrow>
					<ListItemButton
						onClick={onLogout}
						sx={{
							borderRadius: 1.5,
							minHeight: 44,
							justifyContent: collapsed ? "center" : "flex-start",
							color: "error.main",
						}}
					>
						<ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, color: "inherit", justifyContent: "center" }}>
							<Iconify icon="solar:logout-2-bold-duotone" width={22} />
						</ListItemIcon>
						{!collapsed && (
							<ListItemText
								primary="Cerrar sesión"
								primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
							/>
						)}
					</ListItemButton>
				</Tooltip>
			</Box>
		</Box>
	);
}

export function DashboardLayout({ children }) {
	const { user, logout } = useAuthContext();
	const router = useRouter();
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);

	const handleLogout = async () => {
		try {
			await logout();
			router.replace(paths.landing);
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const handleNavigate = (path) => {
		router.push(path);
		setMobileOpen(false);
	};

	return (
		<Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
			{/* Sidebar - desktop */}
			<Box
				sx={{
					display: { xs: "none", md: "block" },
					position: "relative",
					flexShrink: 0,
					width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
					transition: "width 0.25s ease",
				}}
			>
				<Drawer
					variant="permanent"
					sx={{
						width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
						flexShrink: 0,
						"& .MuiDrawer-paper": {
							width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
							boxSizing: "border-box",
							borderRight: "1px dashed",
							borderColor: "divider",
							overflowX: "hidden",
							transition: "width 0.25s ease",
						},
					}}
				>
					<SidebarContent
						collapsed={collapsed}
						pathname={pathname}
						onNavigate={handleNavigate}
						onLogout={handleLogout}
					/>
				</Drawer>

				{/* Collapse / expand toggle button — sits on the right border of the sidebar */}
				<IconButton
					onClick={() => setCollapsed((prev) => !prev)}
					size="small"
					sx={{
						position: "absolute",
						top: 18, // (64 - 28) / 2 → vertically centered in the logo area
						right: -14, // center of the button straddles the sidebar border
						width: 28,
						height: 28,
						bgcolor: "background.paper",
						border: "1px dashed",
						borderColor: "divider",
						zIndex: 1300,
						"&:hover": { bgcolor: "grey.100" },
					}}
				>
					<Iconify
						icon="solar:alt-arrow-left-bold-duotone"
						width={14}
						sx={{
							color: "text.secondary",
							transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
							transition: "transform 0.25s ease",
						}}
					/>
				</IconButton>
			</Box>

			{/* Sidebar - mobile (always expanded) */}
			<Drawer
				variant="temporary"
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				sx={{
					display: { xs: "block", md: "none" },
					"& .MuiDrawer-paper": { width: DRAWER_WIDTH },
				}}
			>
				<SidebarContent
					collapsed={false}
					pathname={pathname}
					onNavigate={handleNavigate}
					onLogout={handleLogout}
				/>
			</Drawer>

			{/* Main content */}
			<Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
				<AppBar
					position="sticky"
					color="inherit"
					elevation={0}
					sx={{ borderBottom: "1px dashed", borderColor: "divider", bgcolor: "background.default" }}
				>
					<Toolbar>
						<IconButton
							onClick={() => setMobileOpen(true)}
							sx={{ mr: 1, display: { md: "none" } }}
						>
							<Iconify icon="solar:hamburger-menu-bold-duotone" />
						</IconButton>

						<Box sx={{ flex: 1 }} />

						<Stack direction="row" alignItems="center" spacing={1}>
							<Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
								{user?.email}
							</Typography>

							<IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
								<Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14 }}>
									{user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
								</Avatar>
							</IconButton>

							<Menu
								anchorEl={anchorEl}
								open={!!anchorEl}
								onClose={() => setAnchorEl(null)}
								anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
								transformOrigin={{ vertical: "top", horizontal: "right" }}
							>
								<MenuItem disabled>
									<Typography variant="body2">{user?.email}</Typography>
								</MenuItem>
								<Divider />
								<MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
									<Iconify icon="solar:logout-2-bold-duotone" width={20} sx={{ mr: 1 }} />
									Cerrar sesión
								</MenuItem>
							</Menu>
						</Stack>
					</Toolbar>
				</AppBar>

				<Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: "auto", minHeight: 0, position: "relative" }}>
					{children}
				</Box>
			</Box>
		</Box>
	);
}
